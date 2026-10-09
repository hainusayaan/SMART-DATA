# Smart Campus Analytics: Backend API

FastAPI + SQLAlchemy + SQLite. Predicts and tracks **Student Success** with a score, early-warning risk detection, student segments and recommendations.

## Run
```bash
python -m venv venv && source venv/bin/activate      # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
- Swagger UI (try every endpoint): http://localhost:8000/docs
- First start auto-loads `data/students.csv` (60 sample students) into `database/campus.db`.
- Demo login: `admin@campus.edu` / `admin123` (see `.env`).

## For the frontend
- Base URL: `http://localhost:8000`. CORS is open (`CORS_ORIGINS=*` in `.env`).
- Auth is **off** by default (`REQUIRE_AUTH=false`) so you can build without tokens. When on, send `Authorization: Bearer <token>` from `POST /auth/login`.
- `student_id` (roll number, e.g. `20KE1A0221`) is the identifier in every URL.

### Endpoints
| Area | Endpoints |
|---|---|
| Auth | `POST /auth/login` `POST /auth/register` `GET /auth/me` |
| Students | `GET /students` (search, department, year, risk_level, segment, sort_by, order, skip, limit) · `GET /students/meta/filters` · `GET /students/{id}` · **`GET /students/{id}/profile`** (everything for one student) · `POST /students` · `PUT /students/{id}` · `DELETE /students/{id}` |
| Attendance | `GET /attendance` · `/attendance/low?threshold=75` · `/attendance/summary/departments` · `GET/PUT /attendance/{id}` |
| Academics | `GET /academics` · `/academics/at-risk` · `/academics/summary/departments` · `GET/PUT /academics/{id}` |
| LMS | `GET /lms` · `/lms/low-engagement` · `/lms/summary` · `GET/PUT /lms/{id}` |
| Engagement | `GET /engagement` · `/engagement/summary` · `/engagement/by-department` · `GET/PUT /engagement/{id}` |
| Placement | `GET /placement?status=` · `/placement/stats` · `/placement/eligible` · `/placement/by-department` · `GET/PUT /placement/{id}` |
| Skills | `GET /skills` · `/skills/top` · `/skills/gaps` · `GET/POST /skills/{student_id}` · `DELETE /skills/item/{skill_id}` |
| Analytics | `/analytics/overview` · `/departments` · `/year-wise` · `/risk-students?level=High` · `/leaderboard` · `/score-distribution` · `/segments` · `/component-averages` · `/placement-funnel` |

### Dashboard mapping
- KPI cards → `/analytics/overview`
- Risk donut → `overview.risk_distribution`; segment chart → `/analytics/segments`
- Department bars → `/analytics/departments`; score histogram → `/analytics/score-distribution`
- Radar of components → `/analytics/component-averages`
- At-risk table with reasons + actions → `/analytics/risk-students`
- Student table → `/students`; student detail page → `/students/{id}/profile`
- Placement funnel → `/analytics/placement-funnel`

### Sample: `GET /students/{id}/profile` (shape)
```json
{
  "student": {"student_id": "...", "name": "...", "department": "CSE", "year": 3},
  "attendance": {"attendance_pct": 72.5}, "academics": {"cgpa": 6.8, "backlogs": 1},
  "lms": {}, "engagement": {}, "placement": {}, "skills": [{"name": "Python", "level": "Advanced"}],
  "success_score": {"score": 64.2, "grade": "C", "breakdown": {"academics": 0, "attendance": 0, "lms": 0, "placement": 0, "engagement": 0}},
  "risk": {"risk_level": "Medium", "risk_points": 35, "flags": [{"code": "ATT_LOW", "message": "...", "severity": "medium"}]},
  "segment": "Developing",
  "recommendations": [{"category": "Attendance", "priority": "high", "action": "..."}]
}
```

## Student Success Score (0-100)
`Academics 30% + Attendance 25% + LMS 20% + Placement readiness 15% + Engagement 10%`. Each component is scored 0-100 first. Grades: A ≥ 80, B ≥ 65, C ≥ 50, else D.
Risk (`services/risk_detection.py`): rule points → **High ≥ 60**, **Medium ≥ 30**, else **Low**.
Segments (`services/segmentation.py`): High Achiever · Engaged Performer · Steady Performer · Developing · Disengaged · At Risk.

## Structure
```
main.py  database.py  models.py  schemas.py
routers/   auth students attendance academics lms engagement placement skills analytics
services/  success_score risk_detection segmentation recommendations
data/students.csv   database/campus.db   .env   requirements.txt
```
To reset data: delete `database/campus.db` and restart.
