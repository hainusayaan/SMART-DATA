from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import or_
from sqlalchemy.orm import Session, selectinload

from database import get_db
from models import Student
from routers.auth import auth_guard
from schemas import StudentCreate, StudentList, StudentOut, StudentUpdate
from services.recommendations import analyze_student

router = APIRouter(prefix="/students", tags=["Students"], dependencies=[Depends(auth_guard)])

LOAD = (
    selectinload(Student.attendance), selectinload(Student.academics), selectinload(Student.lms),
    selectinload(Student.engagement), selectinload(Student.placement), selectinload(Student.skills),
)


# ---- shared helpers (imported by other routers) ----
def get_student_or_404(db: Session, student_id: str) -> Student:
    s = db.get(Student, student_id)
    if not s:
        raise HTTPException(404, f"Student {student_id} not found")
    return s


def upsert_child(db: Session, model, student_id: str, data: dict):
    get_student_or_404(db, student_id)
    row = db.query(model).filter(model.student_id == student_id).first()
    if row:
        for k, v in data.items():
            setattr(row, k, v)
    else:
        row = model(student_id=student_id, **data)
        db.add(row)
    db.commit()
    db.refresh(row)
    return row


def all_students(db: Session) -> list[Student]:
    return db.query(Student).options(*LOAD).all()


def student_summary(s: Student, info: dict | None = None) -> dict:
    info = info or analyze_student(s)
    return {
        "student_id": s.student_id, "name": s.name, "department": s.department, "year": s.year,
        "attendance_pct": s.attendance.attendance_pct if s.attendance else None,
        "cgpa": s.academics.cgpa if s.academics else None,
        "success_score": info["success_score"]["score"], "grade": info["success_score"]["grade"],
        "risk_level": info["risk"]["risk_level"], "segment": info["segment"],
    }


# ---- routes ----
@router.get("", response_model=StudentList)
def list_students(
    search: Optional[str] = Query(None, description="name or roll number"),
    department: Optional[str] = None, year: Optional[int] = None,
    risk_level: Optional[str] = Query(None, description="High | Medium | Low"),
    segment: Optional[str] = None,
    sort_by: str = Query("name", description="name | success_score | cgpa | attendance_pct | risk_level"),
    order: str = Query("asc", pattern="^(asc|desc)$"),
    skip: int = Query(0, ge=0), limit: int = Query(50, ge=1, le=500),
    db: Session = Depends(get_db),
):
    q = db.query(Student).options(*LOAD)
    if search:
        like = f"%{search}%"
        q = q.filter(or_(Student.name.ilike(like), Student.student_id.ilike(like)))
    if department:
        q = q.filter(Student.department == department)
    if year:
        q = q.filter(Student.year == year)
    items = [student_summary(s) for s in q.all()]
    if risk_level:
        items = [i for i in items if i["risk_level"].lower() == risk_level.lower()]
    if segment:
        items = [i for i in items if i["segment"].lower() == segment.lower()]
    if sort_by not in {"name", "success_score", "cgpa", "attendance_pct", "risk_level"}:
        sort_by = "name"
    rank = {"High": 0, "Medium": 1, "Low": 2}
    key = (lambda i: rank[i["risk_level"]]) if sort_by == "risk_level" else (lambda i: (i[sort_by] is None, i[sort_by]))
    items.sort(key=key, reverse=(order == "desc"))
    return {"total": len(items), "skip": skip, "limit": limit, "items": items[skip: skip + limit]}


@router.get("/meta/filters")
def filter_options(db: Session = Depends(get_db)):
    """Dropdown values for the frontend."""
    from services.segmentation import SEGMENTS
    depts = sorted({d for (d,) in db.query(Student.department).distinct() if d})
    years = sorted({y for (y,) in db.query(Student.year).distinct() if y})
    return {"departments": depts, "years": years, "risk_levels": ["High", "Medium", "Low"], "segments": SEGMENTS}


@router.post("", response_model=StudentOut, status_code=201)
def create_student(body: StudentCreate, db: Session = Depends(get_db)):
    if db.get(Student, body.student_id):
        raise HTTPException(409, "Student already exists")
    s = Student(**body.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    return s


@router.get("/{student_id}", response_model=StudentOut)
def get_student(student_id: str, db: Session = Depends(get_db)):
    return get_student_or_404(db, student_id)


@router.get("/{student_id}/profile")
def student_profile(student_id: str, db: Session = Depends(get_db)):
    """360-degree view: all records + success score, risk, segment, recommendations."""
    s = db.query(Student).options(*LOAD).filter(Student.student_id == student_id).first()
    if not s:
        raise HTTPException(404, f"Student {student_id} not found")
    from schemas import (AcademicOut, AttendanceOut, EngagementOut, LMSOut, PlacementOut, SkillOut)
    def dump(schema, obj):
        return schema.model_validate(obj).model_dump() if obj else None
    return {
        "student": StudentOut.model_validate(s).model_dump(),
        "attendance": dump(AttendanceOut, s.attendance),
        "academics": dump(AcademicOut, s.academics),
        "lms": dump(LMSOut, s.lms),
        "engagement": dump(EngagementOut, s.engagement),
        "placement": dump(PlacementOut, s.placement),
        "skills": [SkillOut.model_validate(k).model_dump() for k in s.skills],
        **analyze_student(s),
    }


@router.put("/{student_id}", response_model=StudentOut)
def update_student(student_id: str, body: StudentUpdate, db: Session = Depends(get_db)):
    s = get_student_or_404(db, student_id)
    for k, v in body.model_dump(exclude_unset=True).items():
        setattr(s, k, v)
    db.commit()
    db.refresh(s)
    return s


@router.delete("/{student_id}", status_code=204)
def delete_student(student_id: str, db: Session = Depends(get_db)):
    db.delete(get_student_or_404(db, student_id))
    db.commit()
