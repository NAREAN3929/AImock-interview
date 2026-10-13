from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List, Dict, Any

from app.database.session import get_db
from app.models.models import User, Profile, StudyPlanTask
from app.schemas.schemas import (
    OnboardingSubmitRequest,
    OnboardingStatusOut,
    StudyPlanOut,
    StudyPlanTaskOut
)
from app.services.study_plan_generator import generate_study_plan

router = APIRouter(prefix="/onboarding", tags=["Onboarding & Study Plan"])

def _resolve_user(db: Session, email_or_username: Optional[str] = None) -> User:
    if email_or_username:
        clean = email_or_username.strip()
        user = db.query(User).filter((User.email == clean) | (User.username == clean)).first()
        if user:
            return user
    
    # Fallback to demo user
    user = db.query(User).first()
    if not user:
        user = User(
            email="candidate@interview.ai",
            username="candidate",
            hashed_password="hashedpassword123",
            full_name="Candidate User",
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        profile = Profile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    return user

@router.get("/status", response_model=OnboardingStatusOut)
def get_onboarding_status(
    user_email: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    user = _resolve_user(db, user_email)
    profile = user.profile
    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)

    days_left = None
    if profile.interview_date:
        delta = (profile.interview_date - datetime.utcnow()).total_seconds() / 86400
        days_left = max(0, int(round(delta)))

    tasks_count = db.query(StudyPlanTask).filter(StudyPlanTask.user_id == user.id).count()

    return {
        "onboarding_completed": bool(user.onboarding_completed or profile.onboarding_completed),
        "onboarding_completed_at": user.onboarding_completed_at,
        "onboarding_step": user.onboarding_step or 1,
        "target_role": profile.target_role,
        "experience_level": profile.experience_level,
        "interview_date": profile.interview_date,
        "interview_date_preset": profile.interview_date_preset,
        "target_company": profile.target_company,
        "days_until_interview": days_left,
        "has_active_plan": tasks_count > 0
    }

@router.post("/save-step")
def save_onboarding_step(
    step_data: Dict[str, Any],
    user_email: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    user = _resolve_user(db, user_email)
    profile = user.profile or Profile(user_id=user.id)
    if not user.profile:
        db.add(profile)

    step = step_data.get("step", 1)
    user.onboarding_step = step

    if "target_role" in step_data and step_data["target_role"]:
        profile.target_role = step_data["target_role"].strip()
    if "experience_level" in step_data and step_data["experience_level"]:
        profile.experience_level = step_data["experience_level"].strip()
    if "interview_date_preset" in step_data:
        profile.interview_date_preset = step_data["interview_date_preset"]
    if "interview_date" in step_data and step_data["interview_date"]:
        try:
            profile.interview_date = datetime.fromisoformat(step_data["interview_date"].replace("Z", "+00:00"))
        except Exception:
            pass
    if "target_company" in step_data:
        profile.target_company = step_data["target_company"]

    db.commit()
    return {"status": "saved", "step": user.onboarding_step}

@router.post("/complete", response_model=StudyPlanOut)
def complete_onboarding(
    payload: OnboardingSubmitRequest,
    user_email: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    user = _resolve_user(db, user_email)
    profile = user.profile or Profile(user_id=user.id)
    if not user.profile:
        db.add(profile)

    now = datetime.utcnow()

    # Update profile fields
    profile.target_role = payload.target_role
    profile.experience_level = payload.experience_level
    profile.interview_date_preset = payload.interview_date_preset
    profile.interview_date = payload.interview_date
    profile.target_company = payload.target_company
    profile.resume_url = payload.resume_url
    profile.onboarding_completed = True

    # Update user flags
    user.onboarding_completed = True
    user.onboarding_completed_at = now
    user.onboarding_step = 4

    # Calculate remaining quota
    quota = profile.monthly_quota or 10
    used = profile.sessions_used_this_month or 0
    rem_sessions = max(1, quota - used)

    # Generate plan
    plan_data = generate_study_plan(
        role=payload.target_role,
        experience_level=payload.experience_level,
        interview_date=payload.interview_date,
        interview_date_preset=payload.interview_date_preset,
        remaining_monthly_sessions=rem_sessions,
        target_company=payload.target_company
    )

    # Remove existing study plans if any and store fresh tasks
    db.query(StudyPlanTask).filter(StudyPlanTask.user_id == user.id).delete()
    
    db_tasks = []
    for t in plan_data["tasks"]:
        task_record = StudyPlanTask(
            user_id=user.id,
            week_number=t["week_number"],
            day_number=t["day_number"],
            title=t["title"],
            session_type=t["session_type"],
            sessions_count=t["sessions_count"],
            status="pending"
        )
        db.add(task_record)
        db_tasks.append(task_record)

    db.commit()

    for idx, dt in enumerate(db_tasks):
        plan_data["tasks"][idx]["id"] = dt.id

    return plan_data

@router.post("/skip", response_model=StudyPlanOut)
def skip_onboarding(
    user_email: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    default_req = OnboardingSubmitRequest(
        target_role="Frontend developer",
        experience_level="Fresher",
        interview_date_preset="within_14_days",
        skip=True
    )
    return complete_onboarding(default_req, user_email=user_email, db=db)

@router.get("/study-plan", response_model=StudyPlanOut)
def get_user_study_plan(
    user_email: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    user = _resolve_user(db, user_email)
    profile = user.profile

    tasks = db.query(StudyPlanTask).filter(StudyPlanTask.user_id == user.id).order_by(
        StudyPlanTask.week_number.asc(),
        StudyPlanTask.day_number.asc()
    ).all()

    if not tasks:
        # Generate default plan if none exists
        default_req = OnboardingSubmitRequest(
            target_role=profile.target_role if profile else "Frontend developer",
            experience_level=profile.experience_level if profile else "Fresher",
            interview_date_preset=profile.interview_date_preset if profile else "within_14_days"
        )
        return complete_onboarding(default_req, user_email=user_email, db=db)

    quota = profile.monthly_quota if profile else 10
    used = profile.sessions_used_this_month if profile else 0
    rem_sessions = max(0, quota - used)

    days_left = None
    if profile and profile.interview_date:
        delta = (profile.interview_date - datetime.utcnow()).total_seconds() / 86400
        days_left = max(0, int(round(delta)))

    weeks_count = max((t.week_number for t in tasks), default=2)

    return {
        "role": profile.target_role if profile else "Frontend developer",
        "experience_level": profile.experience_level if profile else "Fresher",
        "weeks_count": weeks_count,
        "days_until_interview": days_left,
        "interview_date": profile.interview_date if profile else None,
        "total_sessions": sum(t.sessions_count for t in tasks),
        "remaining_monthly_sessions": rem_sessions,
        "quota_capped": False,
        "quota_warning": None,
        "tasks": [
            {
                "id": t.id,
                "week_number": t.week_number,
                "day_number": t.day_number,
                "title": t.title,
                "session_type": t.session_type,
                "sessions_count": t.sessions_count,
                "status": t.status,
                "completed_at": t.completed_at
            } for t in tasks
        ]
    }

@router.put("/study-plan/task/{task_id}/status")
def update_task_status(
    task_id: int,
    status_data: Dict[str, str],
    user_email: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    user = _resolve_user(db, user_email)
    task = db.query(StudyPlanTask).filter(
        StudyPlanTask.id == task_id,
        StudyPlanTask.user_id == user.id
    ).first()

    if not task:
        raise HTTPException(status_code=404, detail="Study plan task not found.")

    new_status = status_data.get("status", "done")
    task.status = new_status
    if new_status == "done":
        task.completed_at = datetime.utcnow()
    else:
        task.completed_at = None

    db.commit()
    return {"id": task.id, "status": task.status, "completed_at": task.completed_at}
