"""DB engine, session, Base and CSV seeding."""
import csv
import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

DB_DIR = BASE_DIR / "database"
DB_DIR.mkdir(exist_ok=True)
DATABASE_URL = os.getenv("DATABASE_URL") or f"sqlite:///{DB_DIR / 'campus.db'}"
CSV_PATH = BASE_DIR / "data" / "students.csv"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def _student_csv_files(data_dir: Path = BASE_DIR / "data") -> list[Path]:
    if not data_dir.exists():
        return []
    return sorted([p for p in data_dir.glob("students*.csv") if p.is_file()])


def _f(v, default=0.0):
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def _i(v, default=0):
    return int(_f(v, default))


def seed_from_csv(db, csv_path: Path | str | None = None) -> int:
    """Load student CSV data into all tables. Skips if students already exist."""
    from models import Academic, Attendance, Engagement, LMSActivity, Placement, Skill, Student

    if db.query(Student).count() > 0:
        return 0

    csv_files = [Path(csv_path)] if csv_path is not None else _student_csv_files()
    if not csv_files or not any(p.exists() for p in csv_files):
        return 0

    seen_ids = set()
    n = 0
    for csv_file in csv_files:
        if not Path(csv_file).exists():
            continue
        with open(csv_file, newline="", encoding="utf-8") as fh:
            for r in csv.DictReader(fh):
                sid = (r.get("student_id") or "").strip()
                if not sid or sid in seen_ids:
                    continue
                seen_ids.add(sid)
                db.add(Student(student_id=sid, name=r["name"], email=r.get("email"),
                               department=r["department"], year=_i(r["year"], 1)))
                db.add(Attendance(student_id=sid, attendance_pct=_f(r["attendance_pct"])))
                db.add(Academic(student_id=sid, cgpa=_f(r["cgpa"]), backlogs=_i(r["backlogs"]),
                                internal_marks_avg=_f(r["internal_marks_avg"])))
                db.add(LMSActivity(student_id=sid, logins_per_week=_f(r["logins_per_week"]),
                                   assignments_submitted_pct=_f(r["assignments_submitted_pct"]),
                                   time_spent_hours=_f(r["time_spent_hours"]), quiz_avg=_f(r["quiz_avg"])))
                db.add(Engagement(student_id=sid, clubs_count=_i(r["clubs_count"]),
                                  events_attended=_i(r["events_attended"]),
                                  volunteering_hours=_f(r["volunteering_hours"])))
                db.add(Placement(student_id=sid, internships=_i(r["internships"]),
                                 status=r["placement_status"] or "Not Started",
                                 company=r.get("company") or None,
                                 package_lpa=_f(r["package_lpa"], None) if r.get("package_lpa") else None,
                                 mock_interview_score=_f(r["mock_interview_score"])))
                for item in (r.get("skills") or "").split(";"):
                    if ":" in item:
                        name, level = item.split(":", 1)
                        db.add(Skill(student_id=sid, name=name.strip(), level=level.strip()))
                n += 1
    db.commit()
    return n
