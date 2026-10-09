from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Engagement, Student
from routers.auth import auth_guard
from routers.students import upsert_child
from schemas import EngagementIn, EngagementOut

router = APIRouter(prefix="/engagement", tags=["Engagement"], dependencies=[Depends(auth_guard)])


@router.get("", response_model=list[EngagementOut])
def list_engagement(skip: int = 0, limit: int = Query(100, le=1000), db: Session = Depends(get_db)):
    return db.query(Engagement).offset(skip).limit(limit).all()


@router.get("/summary")
def engagement_summary(db: Session = Depends(get_db)):
    total = db.query(func.count(Engagement.id)).scalar() or 0
    inactive = db.query(func.count(Engagement.id)).filter(
        Engagement.clubs_count == 0, Engagement.events_attended == 0).scalar() or 0
    a = db.query(func.avg(Engagement.clubs_count), func.avg(Engagement.events_attended),
                 func.avg(Engagement.volunteering_hours)).one()
    return {"students": total, "no_participation": inactive,
            "avg_clubs": round(a[0] or 0, 2), "avg_events": round(a[1] or 0, 2),
            "avg_volunteering_hours": round(a[2] or 0, 1)}


@router.get("/by-department")
def engagement_by_department(db: Session = Depends(get_db)):
    rows = (db.query(Student.department, func.avg(Engagement.clubs_count), func.avg(Engagement.events_attended))
            .join(Engagement, Engagement.student_id == Student.student_id).group_by(Student.department).all())
    return [{"department": d, "avg_clubs": round(c or 0, 2), "avg_events": round(e or 0, 2)} for d, c, e in rows]


@router.get("/{student_id}", response_model=EngagementOut)
def get_engagement(student_id: str, db: Session = Depends(get_db)):
    row = db.query(Engagement).filter(Engagement.student_id == student_id).first()
    if not row:
        raise HTTPException(404, "No engagement record")
    return row


@router.put("/{student_id}", response_model=EngagementOut)
def put_engagement(student_id: str, body: EngagementIn, db: Session = Depends(get_db)):
    return upsert_child(db, Engagement, student_id, body.model_dump())
