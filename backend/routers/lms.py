from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import LMSActivity, Student
from routers.auth import auth_guard
from routers.students import upsert_child
from schemas import LMSIn, LMSOut

router = APIRouter(prefix="/lms", tags=["LMS"], dependencies=[Depends(auth_guard)])


@router.get("", response_model=list[LMSOut])
def list_lms(skip: int = 0, limit: int = Query(100, le=1000), db: Session = Depends(get_db)):
    return db.query(LMSActivity).offset(skip).limit(limit).all()


@router.get("/low-engagement")
def low_lms_engagement(db: Session = Depends(get_db)):
    """Assignments < 50% or logins < 2 per week."""
    rows = (db.query(Student.student_id, Student.name, Student.department, LMSActivity.logins_per_week,
                     LMSActivity.assignments_submitted_pct)
            .join(LMSActivity, LMSActivity.student_id == Student.student_id)
            .filter((LMSActivity.assignments_submitted_pct < 50) | (LMSActivity.logins_per_week < 2)).all())
    return [dict(zip(["student_id", "name", "department", "logins_per_week", "assignments_submitted_pct"], r))
            for r in rows]


@router.get("/summary")
def lms_summary(db: Session = Depends(get_db)):
    a = db.query(func.avg(LMSActivity.logins_per_week), func.avg(LMSActivity.assignments_submitted_pct),
                 func.avg(LMSActivity.time_spent_hours), func.avg(LMSActivity.quiz_avg)).one()
    return {k: round(v or 0, 1) for k, v in zip(
        ["avg_logins_per_week", "avg_assignments_pct", "avg_time_spent_hours", "avg_quiz"], a)}


@router.get("/{student_id}", response_model=LMSOut)
def get_lms(student_id: str, db: Session = Depends(get_db)):
    row = db.query(LMSActivity).filter(LMSActivity.student_id == student_id).first()
    if not row:
        raise HTTPException(404, "No LMS record")
    return row


@router.put("/{student_id}", response_model=LMSOut)
def put_lms(student_id: str, body: LMSIn, db: Session = Depends(get_db)):
    return upsert_child(db, LMSActivity, student_id, body.model_dump())
