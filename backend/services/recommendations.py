"""Personalised next-best-actions + one-call student analysis."""
from services.risk_detection import detect_risk
from services.segmentation import assign_segment
from services.success_score import _g, compute_success_score


def build_recommendations(student, score_info: dict, risk: dict) -> list[dict]:
    b = score_info["breakdown"]
    codes = {f["code"] for f in risk["flags"]}
    recs = []

    def add(cat, pri, action):
        recs.append({"category": cat, "priority": pri, "action": action})

    if codes & {"ATT_CRITICAL", "ATT_LOW"}:
        add("Attendance", "high", "Schedule a mentor meeting and set a weekly attendance target.")
    if codes & {"CGPA_CRITICAL", "CGPA_LOW", "BACKLOGS_HIGH", "BACKLOG"}:
        add("Academics", "high", "Enrol in remedial/peer-tutoring sessions and a backlog clearance plan.")
    if codes & {"ASSIGN_LOW", "LMS_INACTIVE"}:
        add("LMS", "medium", "Send LMS nudges; set assignment reminders and a weekly study schedule.")
    if b["engagement"] < 30:
        add("Engagement", "medium", "Recommend joining a club or one campus event this month.")
    if b["placement"] < 50:
        skills = {s.name.lower() for s in student.skills or []}
        gap = [s for s in ["Python", "SQL", "Data Structures", "Communication"] if s.lower() not in skills]
        add("Placement", "medium", "Build placement readiness: " + (", ".join(gap[:3]) or "mock interviews")
            + " and take mock interviews.")
    if _g(student.placement, "internships") == 0 and student.year and student.year >= 3:
        add("Placement", "medium", "Apply for an internship this semester.")
    if score_info["score"] >= 80:
        add("Growth", "low", "Nominate for leadership roles, research projects or peer mentoring.")
    if not recs:
        add("General", "low", "On track. Keep up the current momentum.")
    order = {"high": 0, "medium": 1, "low": 2}
    return sorted(recs, key=lambda r: order[r["priority"]])


def analyze_student(student) -> dict:
    score = compute_success_score(student)
    risk = detect_risk(student, score)
    return {
        "success_score": score,
        "risk": risk,
        "segment": assign_segment(score),
        "recommendations": build_recommendations(student, score, risk),
    }
