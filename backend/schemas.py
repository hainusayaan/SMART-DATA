from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class ORM(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ---------- Auth ----------
class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str = Field(min_length=6)
    role: str = "faculty"


class LoginIn(BaseModel):
    email: str
    password: str


class UserOut(ORM):
    id: int
    email: str
    full_name: str
    role: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Students ----------
class StudentBase(BaseModel):
    name: str
    email: Optional[str] = None
    department: str
    year: int = Field(ge=1, le=4)


class StudentCreate(StudentBase):
    student_id: str


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    department: Optional[str] = None
    year: Optional[int] = Field(default=None, ge=1, le=4)


class StudentOut(StudentBase, ORM):
    student_id: str
    created_at: Optional[datetime] = None


# ---------- Child records (PUT bodies = *In, responses = *Out) ----------
class AttendanceIn(BaseModel):
    attendance_pct: float = Field(ge=0, le=100)
    classes_held: Optional[int] = None
    classes_attended: Optional[int] = None


class AttendanceOut(AttendanceIn, ORM):
    student_id: str


class AcademicIn(BaseModel):
    cgpa: float = Field(ge=0, le=10)
    backlogs: int = Field(default=0, ge=0)
    internal_marks_avg: float = Field(default=0, ge=0, le=100)
    semester: Optional[int] = None


class AcademicOut(AcademicIn, ORM):
    student_id: str


class LMSIn(BaseModel):
    logins_per_week: float = Field(default=0, ge=0)
    assignments_submitted_pct: float = Field(default=0, ge=0, le=100)
    time_spent_hours: float = Field(default=0, ge=0)
    quiz_avg: float = Field(default=0, ge=0, le=100)


class LMSOut(LMSIn, ORM):
    student_id: str


class EngagementIn(BaseModel):
    clubs_count: int = Field(default=0, ge=0)
    events_attended: int = Field(default=0, ge=0)
    volunteering_hours: float = Field(default=0, ge=0)


class EngagementOut(EngagementIn, ORM):
    student_id: str


class PlacementIn(BaseModel):
    internships: int = Field(default=0, ge=0)
    status: str = "Not Started"
    company: Optional[str] = None
    package_lpa: Optional[float] = None
    mock_interview_score: float = Field(default=0, ge=0, le=100)


class PlacementOut(PlacementIn, ORM):
    student_id: str


class SkillIn(BaseModel):
    name: str
    level: str = "Beginner"


class SkillOut(SkillIn, ORM):
    id: int
    student_id: str


# ---------- Insights ----------
class Recommendation(BaseModel):
    category: str
    priority: str
    action: str


class StudentSummary(BaseModel):
    student_id: str
    name: str
    department: Optional[str]
    year: Optional[int]
    attendance_pct: Optional[float]
    cgpa: Optional[float]
    success_score: float
    grade: str
    risk_level: str
    segment: str


class StudentList(BaseModel):
    total: int
    skip: int
    limit: int
    items: List[StudentSummary]
