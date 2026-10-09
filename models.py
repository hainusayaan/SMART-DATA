from datetime import datetime

from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from database import Base


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    full_name = Column(String, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="admin")  # admin | faculty | counsellor
    created_at = Column(DateTime, default=datetime.utcnow)


class Student(Base):
    __tablename__ = "students"
    student_id = Column(String, primary_key=True, index=True)  # roll number
    name = Column(String, nullable=False, index=True)
    email = Column(String)
    department = Column(String, index=True)
    year = Column(Integer, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    _opts = dict(back_populates="student", uselist=False, cascade="all, delete-orphan")
    attendance = relationship("Attendance", **_opts)
    academics = relationship("Academic", **_opts)
    lms = relationship("LMSActivity", **_opts)
    engagement = relationship("Engagement", **_opts)
    placement = relationship("Placement", **_opts)
    skills = relationship("Skill", back_populates="student", cascade="all, delete-orphan")


def _fk():
    return Column(String, ForeignKey("students.student_id", ondelete="CASCADE"),
                  unique=True, nullable=False, index=True)


class Attendance(Base):
    __tablename__ = "attendance"
    id = Column(Integer, primary_key=True)
    student_id = _fk()
    attendance_pct = Column(Float, default=0)
    classes_held = Column(Integer)
    classes_attended = Column(Integer)
    student = relationship("Student", back_populates="attendance")


class Academic(Base):
    __tablename__ = "academics"
    id = Column(Integer, primary_key=True)
    student_id = _fk()
    cgpa = Column(Float, default=0)
    backlogs = Column(Integer, default=0)
    internal_marks_avg = Column(Float, default=0)
    semester = Column(Integer)
    student = relationship("Student", back_populates="academics")


class LMSActivity(Base):
    __tablename__ = "lms_activity"
    id = Column(Integer, primary_key=True)
    student_id = _fk()
    logins_per_week = Column(Float, default=0)
    assignments_submitted_pct = Column(Float, default=0)
    time_spent_hours = Column(Float, default=0)  # per week
    quiz_avg = Column(Float, default=0)
    student = relationship("Student", back_populates="lms")


class Engagement(Base):
    __tablename__ = "engagement"
    id = Column(Integer, primary_key=True)
    student_id = _fk()
    clubs_count = Column(Integer, default=0)
    events_attended = Column(Integer, default=0)
    volunteering_hours = Column(Float, default=0)
    student = relationship("Student", back_populates="engagement")


class Placement(Base):
    __tablename__ = "placement"
    id = Column(Integer, primary_key=True)
    student_id = _fk()
    internships = Column(Integer, default=0)
    status = Column(String, default="Not Started")  # Not Started | In Process | Placed
    company = Column(String)
    package_lpa = Column(Float)
    mock_interview_score = Column(Float, default=0)
    student = relationship("Student", back_populates="placement")


class Skill(Base):
    __tablename__ = "skills"
    id = Column(Integer, primary_key=True)
    student_id = Column(String, ForeignKey("students.student_id", ondelete="CASCADE"),
                        nullable=False, index=True)
    name = Column(String, nullable=False, index=True)
    level = Column(String, default="Beginner")  # Beginner | Intermediate | Advanced
    student = relationship("Student", back_populates="skills")
