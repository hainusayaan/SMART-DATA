from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Attendance, Student
from routers.auth import auth_guard
from routers.students import upsert_child
from schemas import AttendanceIn, AttendanceOut

router = APIRouter(prefix="/attendance", tags=["Attendance"], dependencies=[Depends(auth_guard)])


@router.get("", response_model=list[AttendanceOut])
def list_attendance(below: float | None = Query(None, description="only records below this %"),
                    skip: int = 0, limit: int = Query(100, le=1000), db: Session = Depends(get_db)):
    q = db.query(Attendance)
    if below is not None:
        q = q.filter(Attendance.attendance_pct < below)
    return q.order_by(Attendance.attendance_pct).offset(skip).limit(limit).all()


@router.get("/low")
def low_attendance(threshold: float = 75, db: Session = Depends(get_db)):
    rows = (db.query(Student.student_id, Student.name, Student.department, Student.year, Attendance.attendance_pct)
            .join(Attendance, Attendance.student_id == Student.student_id)
            .filter(Attendance.attendance_pct < threshold).order_by(Attendance.attendance_pct).all())
    return [dict(zip(["student_id", "name", "department", "year", "attendance_pct"], r)) for r in rows]


@router.get("/summary/departments")
def attendance_by_department(db: Session = Depends(get_db)):
    rows = (db.query(Student.department, func.count(Student.student_id), func.avg(Attendance.attendance_pct))
            .join(Attendance, Attendance.student_id == Student.student_id).group_by(Student.department).all())
    return [{"department": d, "students": n, "avg_attendance": round(a or 0, 1)} for d, n, a in rows]


@router.get("/{student_id}", response_model=AttendanceOut)
def get_attendance(student_id: str, db: Session = Depends(get_db)):
    row = db.query(Attendance).filter(Attendance.student_id == student_id).first()
    if not row:
        raise HTTPException(404, "No attendance record")
    return row


@router.put("/{student_id}", response_model=AttendanceOut)
def put_attendance(student_id: str, body: AttendanceIn, db: Session = Depends(get_db)):
    return upsert_child(db, Attendance, student_id, body.model_dump())
