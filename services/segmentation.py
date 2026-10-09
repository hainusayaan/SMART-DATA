"""Rule-based student segments (explainable, no ML dependency)."""

SEGMENTS = ["High Achiever", "Engaged Performer", "Steady Performer", "Developing", "Disengaged", "At Risk"]


def assign_segment(score_info: dict) -> str:
    s, b = score_info["score"], score_info["breakdown"]
    if s >= 80:
        return "High Achiever"
    if s >= 65:
        return "Engaged Performer" if b["engagement"] >= 50 else "Steady Performer"
    if s >= 50:
        return "Disengaged" if (b["lms"] < 40 and b["engagement"] < 30) else "Developing"
    return "At Risk"
