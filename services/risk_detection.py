"""Rule-based early-warning system. Returns risk level + the reasons (flags)."""
from services.success_score import _g, compute_success_score


def detect_risk(student, score_info: dict | None = None) -> dict:
    score_info = score_info or compute_success_score(student)
    att, ac, lms, eng = student.attendance, student.academics, student.lms, student.engagement
    flags, pts = [], 0

    def flag(code, msg, sev, p):
        nonlocal pts
        flags.append({"code": code, "message": msg, "severity": sev})
        pts += p

    a = _g(att, "attendance_pct", 100)
    if a < 65:
        flag("ATT_CRITICAL", f"Attendance critically low ({a:.0f}%)", "high", 40)
    elif a < 75:
        flag("ATT_LOW", f"Attendance below 75% ({a:.0f}%)", "medium", 25)

    cg, bl = _g(ac, "cgpa", 10), _g(ac, "backlogs")
    if cg < 5:
        flag("CGPA_CRITICAL", f"CGPA very low ({cg:.1f})", "high", 35)
    elif cg < 6:
        flag("CGPA_LOW", f"CGPA below 6.0 ({cg:.1f})", "medium", 20)
    if bl >= 2:
        flag("BACKLOGS_HIGH", f"{int(bl)} active backlogs", "high", 20)
    elif bl == 1:
        flag("BACKLOG", "1 active backlog", "medium", 10)

    asg = _g(lms, "assignments_submitted_pct", 100)
    if asg < 50:
        flag("ASSIGN_LOW", f"Only {asg:.0f}% assignments submitted", "medium", 15)
    if _g(lms, "logins_per_week", 10) < 2:
        flag("LMS_INACTIVE", "Rarely logs in to LMS (<2/week)", "medium", 10)

    if eng is not None and _g(eng, "clubs_count") == 0 and _g(eng, "events_attended") == 0:
        flag("NO_ENGAGEMENT", "No clubs or events participation", "low", 5)

    if score_info["score"] < 50:
        flag("SCORE_LOW", f"Success score low ({score_info['score']})", "high", 15)

    level = "High" if pts >= 60 else "Medium" if pts >= 30 else "Low"
    return {"risk_level": level, "risk_points": pts, "flags": flags}
