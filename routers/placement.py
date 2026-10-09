from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Academic, Placement, Student
from routers.auth import auth_guard
from routers.students import upsert_child
from schemas import PlacementIn, PlacementOut

router = APIRouter(prefix="/placement", tags=["Placement"], dependencies=[Depends(auth_guard)])


@router.get("", response_model=list[PlacementOut])
def list_placement(status: Optional[str] = Query(None, description="Placed | In Process | Not Started"),
                   skip: int = 0, limit: int = Query(100, le=1000), db: Session = Depends(get_db)):
    q = db.query(Placement)
    if status:
        q = q.filter(Placement.status == status)
    return q.offset(skip).limit(limit).all()


@router.get("/stats")
def placement_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(Placement.id)).scalar() or 0
    by_status = dict(db.query(Placement.status, func.count(Placement.id)).group_by(Placement.status).all())
    placed = by_status.get("Placed", 0)
    pk = db.query(func.avg(Placement.package_lpa), func.max(Placement.package_lpa)).filter(
        Placement.status == "Placed").one()
    return {"total": total, "by_status": by_status,
            "placement_rate": round(placed / total * 100, 1) if total else 0,
            "avg_package_lpa": round(pk[0] or 0, 2), "max_package_lpa": pk[1] or 0}


@router.get("/eligible")
def placement_eligible(min_cgpa: float = 6.5, db: Session = Depends(get_db)):
    """Not yet placed, CGPA >= min_cgpa and zero backlogs."""
    rows = (db.query(Student.student_id, Student.name, Student.department, Student.year,
                     Academic.cgpa, Placement.status, Placement.mock_interview_score)
            .join(Academic, Academic.student_id == Student.student_id)
            .join(Placement, Placement.student_id == Student.student_id)
            .filter(Academic.cgpa >= min_cgpa, Academic.backlogs == 0, Placement.status != "Placed")
            .order_by(Academic.cgpa.desc()).all())
    keys = ["student_id", "name", "department", "year", "cgpa", "status", "mock_interview_score"]
    return [dict(zip(keys, r)) for r in rows]


@router.get("/by-department")
def placement_by_department(db: Session = Depends(get_db)):
    rows = (db.query(Student.department, func.count(Placement.id),
                     func.sum(func.iif(Placement.status == "Placed", 1, 0)))
            .join(Placement, Placement.student_id == Student.student_id).group_by(Student.department).all())
    return [{"department": d, "students": n, "placed": int(p or 0),
             "rate": round((p or 0) / n * 100, 1) if n else 0} for d, n, p in rows]


@router.get("/{student_id}", response_model=PlacementOut)
def get_placement(student_id: str, db: Session = Depends(get_db)):
    row = db.query(Placement).filter(Placement.student_id == student_id).first()
    if not row:
        raise HTTPException(404, "No placement record")
    return row


@router.put("/{student_id}", response_model=PlacementOut)
def put_placement(student_id: str, body: PlacementIn, db: Session = Depends(get_db)):
    return upsert_child(db, Placement, student_id, body.model_dump())
