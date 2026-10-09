from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Academic, Student
from routers.auth import auth_guard
from routers.students import upsert_child
from schemas import AcademicIn, AcademicOut

router = APIRouter(prefix="/academics", tags=["Academics"], dependencies=[Depends(auth_guard)])


@router.get("", response_model=list[AcademicOut])
def list_academics(min_cgpa: float | None = None, max_cgpa: float | None = None,
                   skip: int = 0, limit: int = Query(100, le=1000), db: Session = Depends(get_db)):
    q = db.query(Academic)
    if min_cgpa is not None:
        q = q.filter(Academic.cgpa >= min_cgpa)
    if max_cgpa is not None:
        q = q.filter(Academic.cgpa <= max_cgpa)
    return q.order_by(Academic.cgpa.desc()).offset(skip).limit(limit).all()


@router.get("/at-risk")
def academic_at_risk(db: Session = Depends(get_db)):
    """CGPA < 6 or any backlog."""
    rows = (db.query(Student.student_id, Student.name, Student.department, Academic.cgpa, Academic.backlogs)
            .join(Academic, Academic.student_id == Student.student_id)
            .filter((Academic.cgpa < 6) | (Academic.backlogs > 0)).order_by(Academic.cgpa).all())
    return [dict(zip(["student_id", "name", "department", "cgpa", "backlogs"], r)) for r in rows]


@router.get("/summary/departments")
def academics_by_department(db: Session = Depends(get_db)):
    rows = (db.query(Student.department, func.avg(Academic.cgpa), func.sum(Academic.backlogs))
            .join(Academic, Academic.student_id == Student.student_id).group_by(Student.department).all())
    return [{"department": d, "avg_cgpa": round(c or 0, 2), "total_backlogs": int(b or 0)} for d, c, b in rows]


@router.get("/{student_id}", response_model=AcademicOut)
def get_academics(student_id: str, db: Session = Depends(get_db)):
    row = db.query(Academic).filter(Academic.student_id == student_id).first()
    if not row:
        raise HTTPException(404, "No academic record")
    return row


@router.put("/{student_id}", response_model=AcademicOut)
def put_academics(student_id: str, body: AcademicIn, db: Session = Depends(get_db)):
    return upsert_child(db, Academic, student_id, body.model_dump())
