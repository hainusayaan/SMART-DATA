import os
from contextlib import asynccontextmanager

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

load_dotenv()

import models  # noqa: E402,F401  (register tables)
from database import Base, SessionLocal, engine, seed_from_csv  # noqa: E402
from routers import (academics, analytics, attendance, auth, engagement, lms,  # noqa: E402
                     placement, skills, students)


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        email = os.getenv("DEMO_USER_EMAIL", "admin@campus.edu")
        if not db.query(models.User).filter(models.User.email == email).first():
            db.add(models.User(email=email, full_name=os.getenv("DEMO_USER_NAME", "Campus Admin"),
                               password_hash=auth.hash_password(os.getenv("DEMO_USER_PASSWORD", "admin123")),
                               role="admin"))
            db.commit()
        if os.getenv("SEED_ON_STARTUP", "true").lower() == "true":
            seed_from_csv(db)
    finally:
        db.close()
    yield


app = FastAPI(
    title="Smart Campus Analytics API",
    description="Predict, optimize & improve student success: scores, risk detection, segments, recommendations.",
    version="1.0.0", lifespan=lifespan,
)

origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "*").split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=origins != ["*"],
                   allow_methods=["*"], allow_headers=["*"])

for r in (auth, students, attendance, academics, lms, engagement, placement, skills, analytics):
    app.include_router(r.router)


@app.get("/", tags=["Meta"])
def root():
    return {"name": "Smart Campus Analytics API", "docs": "/docs", "health": "/health"}


@app.get("/health", tags=["Meta"])
def health():
    return {"status": "ok"}
