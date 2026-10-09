from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from database import get_db
from models import Skill
from routers.auth import auth_guard
from routers.students import get_student_or_404
from schemas import SkillIn, SkillOut

router = APIRouter(prefix="/skills", tags=["Skills"], dependencies=[Depends(auth_guard)])


@router.get("", response_model=list[SkillOut])
def list_skills(name: Optional[str] = None, level: Optional[str] = None, db: Session = Depends(get_db)):
    q = db.query(Skill)
    if name:
        q = q.filter(Skill.name.ilike(f"%{name}%"))
    if level:
        q = q.filter(Skill.level == level)
    return q.all()


@router.get("/top")
def top_skills(limit: int = 10, db: Session = Depends(get_db)):
    rows = (db.query(Skill.name, func.count(Skill.id)).group_by(Skill.name)
            .order_by(func.count(Skill.id).desc()).limit(limit).all())
    return [{"skill": n, "students": c} for n, c in rows]


@router.get("/gaps")
def skill_gaps(db: Session = Depends(get_db)):
    """In-demand skills and how many students have them (fewest first)."""
    in_demand = ["Python", "SQL", "Java", "React", "Data Structures", "Machine Learning",
                 "Cloud Computing", "Communication", "Git", "Excel"]
    counts = dict(db.query(Skill.name, func.count(func.distinct(Skill.student_id))).group_by(Skill.name).all())
    return sorted(({"skill": s, "students": counts.get(s, 0)} for s in in_demand), key=lambda x: x["students"])


@router.get("/item/{skill_id}", response_model=SkillOut)
def get_skill(skill_id: int, db: Session = Depends(get_db)):
    row = db.get(Skill, skill_id)
    if not row:
        raise HTTPException(404, "Skill not found")
    return row


@router.delete("/item/{skill_id}", status_code=204)
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    row = db.get(Skill, skill_id)
    if not row:
        raise HTTPException(404, "Skill not found")
    db.delete(row)
    db.commit()


@router.get("/{student_id}", response_model=list[SkillOut])
def student_skills(student_id: str, db: Session = Depends(get_db)):
    get_student_or_404(db, student_id)
    return db.query(Skill).filter(Skill.student_id == student_id).all()


@router.post("/{student_id}", response_model=SkillOut, status_code=201)
def add_skill(student_id: str, body: SkillIn, db: Session = Depends(get_db)):
    get_student_or_404(db, student_id)
    row = Skill(student_id=student_id, **body.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row
