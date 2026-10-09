from collections import Counter, defaultdict
from statistics import mean

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from database import get_db
from routers.auth import auth_guard
from routers.students import all_students, student_summary
from services.recommendations import analyze_student
from services.segmentation import SEGMENTS

router = APIRouter(prefix="/analytics", tags=["Analytics"], dependencies=[Depends(auth_guard)])


def _rows(db: Session):
    """[(student, info, summary)] computed once per request."""
    out = []
    for s in all_students(db):
        info = analyze_student(s)
        out.append((s, info, student_summary(s, info)))
    return out


def _avg(xs):
    xs = [x for x in xs if x is not None]
    return round(mean(xs), 2) if xs else 0


@router.get("/overview")
def overview(db: Session = Depends(get_db)):
    rows = _rows(db)
    n = len(rows)
    placed = sum(1 for s, _, _ in rows if s.placement and s.placement.status == "Placed")
    risk = Counter(i["risk"]["risk_level"] for _, i, _ in rows)
    seg = Counter(i["segment"] for _, i, _ in rows)
    return {
        "total_students": n,
        "avg_success_score": _avg([m["success_score"] for _, _, m in rows]),
        "avg_attendance": _avg([m["attendance_pct"] for _, _, m in rows]),
        "avg_cgpa": _avg([m["cgpa"] for _, _, m in rows]),
        "placement_rate": round(placed / n * 100, 1) if n else 0,
        "risk_distribution": {k: risk.get(k, 0) for k in ["High", "Medium", "Low"]},
        "segment_distribution": {k: seg.get(k, 0) for k in SEGMENTS},
    }


@router.get("/departments")
def department_summary(db: Session = Depends(get_db)):
    g = defaultdict(list)
    for s, i, m in _rows(db):
        g[s.department].append((s, i, m))
    out = []
    for d, items in sorted(g.items()):
        out.append({
            "department": d, "students": len(items),
            "avg_success_score": _avg([m["success_score"] for _, _, m in items]),
            "avg_attendance": _avg([m["attendance_pct"] for _, _, m in items]),
            "avg_cgpa": _avg([m["cgpa"] for _, _, m in items]),
            "high_risk": sum(1 for _, i, _ in items if i["risk"]["risk_level"] == "High"),
            "placed": sum(1 for s, _, _ in items if s.placement and s.placement.status == "Placed"),
        })
    return out


@router.get("/year-wise")
def year_summary(db: Session = Depends(get_db)):
    g = defaultdict(list)
    for s, i, m in _rows(db):
        g[s.year].append(m)
    return [{"year": y, "students": len(v), "avg_success_score": _avg([m["success_score"] for m in v]),
             "avg_cgpa": _avg([m["cgpa"] for m in v])} for y, v in sorted(g.items())]


@router.get("/risk-students")
def risk_students(level: str = Query("High", description="High | Medium | Low"),
                  limit: int = Query(50, le=500), db: Session = Depends(get_db)):
    out = [{**m, "risk_points": i["risk"]["risk_points"], "flags": i["risk"]["flags"],
            "recommendations": i["recommendations"]}
           for _, i, m in _rows(db) if i["risk"]["risk_level"].lower() == level.lower()]
    out.sort(key=lambda x: x["risk_points"], reverse=True)
    return out[:limit]


@router.get("/leaderboard")
def leaderboard(limit: int = Query(10, le=100), department: str | None = None, db: Session = Depends(get_db)):
    ms = [m for _, _, m in _rows(db) if not department or m["department"] == department]
    return sorted(ms, key=lambda m: m["success_score"], reverse=True)[:limit]


@router.get("/score-distribution")
def score_distribution(db: Session = Depends(get_db)):
    buckets = {"0-39": 0, "40-59": 0, "60-79": 0, "80-100": 0}
    for _, _, m in _rows(db):
        sc = m["success_score"]
        buckets["0-39" if sc < 40 else "40-59" if sc < 60 else "60-79" if sc < 80 else "80-100"] += 1
    return [{"range": k, "students": v} for k, v in buckets.items()]


@router.get("/segments")
def segments(include_students: bool = False, db: Session = Depends(get_db)):
    g = defaultdict(list)
    for _, i, m in _rows(db):
        g[i["segment"]].append(m)
    out = []
    for name in SEGMENTS:
        v = g.get(name, [])
        item = {"segment": name, "count": len(v), "avg_success_score": _avg([m["success_score"] for m in v])}
        if include_students:
            item["students"] = v
        out.append(item)
    return out


@router.get("/component-averages")
def component_averages(db: Session = Depends(get_db)):
    """Average of each score component (good for a radar chart)."""
    rows = _rows(db)
    keys = ["academics", "attendance", "lms", "placement", "engagement"]
    return {k: _avg([i["success_score"]["breakdown"][k] for _, i, _ in rows]) for k in keys}


@router.get("/placement-funnel")
def placement_funnel(db: Session = Depends(get_db)):
    c = Counter((s.placement.status if s.placement else "Not Started") for s, _, _ in _rows(db))
    return [{"stage": k, "students": c.get(k, 0)} for k in ["Not Started", "In Process", "Placed"]]
