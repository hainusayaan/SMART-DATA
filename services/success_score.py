"""Student Success Score (0-100).

Weights: Academics 30%, Attendance 25%, LMS 20%, Placement readiness 15%, Engagement 10%.
Each component is scored 0-100 first, then combined.
"""

WEIGHTS = {"academics": 0.30, "attendance": 0.25, "lms": 0.20, "placement": 0.15, "engagement": 0.10}


def _clamp(x, lo=0.0, hi=100.0):
    return max(lo, min(hi, x))


def _g(obj, attr, default=0.0):
    v = getattr(obj, attr, None) if obj is not None else None
    return default if v is None else v


def compute_components(student) -> dict:
    att, ac, lms = student.attendance, student.academics, student.lms
    eng, pl = student.engagement, student.placement

    attendance = _clamp(_g(att, "attendance_pct"))
    academics = _clamp(_g(ac, "cgpa") * 10 - 4 * _g(ac, "backlogs"))
    lms_score = _clamp(
        0.45 * _g(lms, "assignments_submitted_pct")
        + 0.25 * min(_g(lms, "logins_per_week") / 10 * 100, 100)
        + 0.15 * min(_g(lms, "time_spent_hours") / 10 * 100, 100)
        + 0.15 * _g(lms, "quiz_avg")
    )
    engagement = _clamp(
        min(_g(eng, "clubs_count") * 20, 40)
        + min(_g(eng, "events_attended") * 8, 40)
        + min(_g(eng, "volunteering_hours") * 1, 20)
    )
    placement = _clamp(
        min(len(student.skills or []) * 10, 40)
        + min(_g(pl, "internships") * 15, 30)
        + 0.3 * _g(pl, "mock_interview_score")
    )
    return {
        "academics": round(academics, 1),
        "attendance": round(attendance, 1),
        "lms": round(lms_score, 1),
        "placement": round(placement, 1),
        "engagement": round(engagement, 1),
    }


def grade_for(score: float) -> str:
    return "A" if score >= 80 else "B" if score >= 65 else "C" if score >= 50 else "D"


def compute_success_score(student) -> dict:
    comps = compute_components(student)
    score = round(sum(comps[k] * w for k, w in WEIGHTS.items()), 1)
    return {"score": score, "grade": grade_for(score), "breakdown": comps, "weights": WEIGHTS}
