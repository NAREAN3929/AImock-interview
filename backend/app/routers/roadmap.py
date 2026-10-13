from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List, Dict, Any

from app.database.session import get_db
from app.models.models import User, Profile, CareerRoadmap, RoadmapPhase, RoadmapTopic
from app.schemas.schemas import (
    RoadmapGenerateRequest,
    TopicStatusUpdateRequest,
    RoadmapOut,
    RoadmapPhaseOut,
    RoadmapTopicOut,
    RoadmapRecommendationOut
)
from app.services.roadmap_generator import generate_roadmap_with_ai

router = APIRouter(prefix="/roadmap", tags=["Career Roadmap AI"])

def _resolve_user(db: Session, email_or_username: Optional[str] = None) -> User:
    if email_or_username:
        clean = email_or_username.strip()
        user = db.query(User).filter((User.email == clean) | (User.username == clean)).first()
        if user:
            return user
    
    # Fallback to first user in database
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

def _format_roadmap_response(roadmap: CareerRoadmap) -> Dict[str, Any]:
    phases_out = []
    total_topics = 0
    completed_topics = 0
    next_recommended_topic = None
    current_phase_title = None

    for phase in roadmap.phases:
        phase_completed_count = 0
        topics_out = []

        for topic in phase.topics:
            total_topics += 1
            if topic.status == "completed":
                completed_topics += 1
                phase_completed_count += 1
            elif not next_recommended_topic and topic.status in ["in_progress", "not_started"]:
                next_recommended_topic = topic
                current_phase_title = phase.title

            topics_out.append({
                "id": topic.id,
                "phase_id": topic.phase_id,
                "topic_order": topic.topic_order,
                "title": topic.title,
                "description": topic.description,
                "learning_objectives": topic.learning_objectives or [],
                "prerequisites": topic.prerequisites or [],
                "key_concepts": topic.key_concepts or "",
                "exercises": topic.exercises or [],
                "resources": topic.resources or [],
                "assessment_quiz": topic.assessment_quiz or [],
                "practical_link_tab": topic.practical_link_tab,
                "practical_action_label": topic.practical_action_label,
                "status": topic.status,
                "quiz_score": topic.quiz_score,
                "is_verified": topic.is_verified,
                "completed_at": topic.completed_at.isoformat() if topic.completed_at else None
            })

        phase_total = len(phase.topics)
        phase_pct = round((phase_completed_count / phase_total * 100), 1) if phase_total > 0 else 0.0

        phases_out.append({
            "id": phase.id,
            "roadmap_id": phase.roadmap_id,
            "phase_order": phase.phase_order,
            "title": phase.title,
            "purpose": phase.purpose,
            "estimated_weeks": phase.estimated_weeks,
            "milestone_project": phase.milestone_project,
            "is_completed": phase.is_completed or (phase_completed_count == phase_total and phase_total > 0),
            "topics": topics_out,
            "completed_topics_count": phase_completed_count,
            "total_topics_count": phase_total,
            "progress_percentage": phase_pct
        })

    overall_pct = round((completed_topics / total_topics * 100), 1) if total_topics > 0 else 0.0

    return {
        "id": roadmap.id,
        "user_id": roadmap.user_id,
        "domain": roadmap.domain,
        "skill_level": roadmap.skill_level,
        "target_role": roadmap.target_role,
        "study_time_daily": roadmap.study_time_daily,
        "learning_preference": roadmap.learning_preference,
        "target_date": roadmap.target_date,
        "overall_progress": overall_pct,
        "status": roadmap.status,
        "phases": phases_out,
        "total_phases": len(phases_out),
        "total_topics": total_topics,
        "completed_topics": completed_topics,
        "current_phase_title": current_phase_title or (phases_out[0]["title"] if phases_out else "Phase 1"),
        "next_recommended_topic": {
            "id": next_recommended_topic.id,
            "phase_id": next_recommended_topic.phase_id,
            "topic_order": next_recommended_topic.topic_order,
            "title": next_recommended_topic.title,
            "description": next_recommended_topic.description,
            "learning_objectives": next_recommended_topic.learning_objectives or [],
            "prerequisites": next_recommended_topic.prerequisites or [],
            "key_concepts": next_recommended_topic.key_concepts or "",
            "exercises": next_recommended_topic.exercises or [],
            "resources": next_recommended_topic.resources or [],
            "assessment_quiz": next_recommended_topic.assessment_quiz or [],
            "practical_link_tab": next_recommended_topic.practical_link_tab,
            "practical_action_label": next_recommended_topic.practical_action_label,
            "status": next_recommended_topic.status,
            "quiz_score": next_recommended_topic.quiz_score,
            "is_verified": next_recommended_topic.is_verified,
            "completed_at": next_recommended_topic.completed_at.isoformat() if next_recommended_topic.completed_at else None
        } if next_recommended_topic else None
    }

@router.get("", response_model=RoadmapOut)
def get_user_roadmap(
    user_email: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Fetches the active Career Roadmap for the authenticated/current user."""
    user = _resolve_user(db, user_email)
    
    roadmap = db.query(CareerRoadmap).filter(
        CareerRoadmap.user_id == user.id,
        CareerRoadmap.status == "active"
    ).order_by(CareerRoadmap.id.desc()).first()

    if not roadmap:
        target_role = (user.profile.target_role if (user.profile and user.profile.target_role) else "Software Engineer")
        skill_lvl = (user.profile.experience_level if (user.profile and user.profile.experience_level) else "Mid-Level")
        phases_data = generate_roadmap_with_ai(
            domain=target_role,
            skill_level=skill_lvl,
            target_role=target_role,
            study_time_daily="1-2 hours",
            learning_preference="Interactive Projects"
        )
        roadmap = CareerRoadmap(
            user_id=user.id,
            domain=target_role,
            skill_level=skill_lvl,
            target_role=target_role,
            study_time_daily="1-2 hours",
            learning_preference="Interactive Projects",
            overall_progress=0.0,
            status="active"
        )
        db.add(roadmap)
        db.commit()
        db.refresh(roadmap)

        for p_idx, p_data in enumerate(phases_data):
            phase = RoadmapPhase(
                roadmap_id=roadmap.id,
                phase_order=p_data.get("phase_order", p_idx + 1),
                title=p_data.get("title", f"Phase {p_idx + 1}"),
                purpose=p_data.get("purpose", "Core learning objectives and mastery."),
                estimated_weeks=p_data.get("estimated_weeks", 2),
                milestone_project=p_data.get("milestone_project", "Milestone Capstone")
            )
            db.add(phase)
            db.commit()
            db.refresh(phase)

            for t_idx, t_data in enumerate(p_data.get("topics", [])):
                topic = RoadmapTopic(
                    phase_id=phase.id,
                    topic_order=t_data.get("topic_order", t_idx + 1),
                    title=t_data.get("title", f"Topic {t_idx + 1}"),
                    description=t_data.get("description", ""),
                    learning_objectives=t_data.get("learning_objectives", []),
                    prerequisites=t_data.get("prerequisites", []),
                    key_concepts=t_data.get("key_concepts", ""),
                    exercises=t_data.get("exercises", []),
                    resources=t_data.get("resources", []),
                    assessment_quiz=t_data.get("assessment_quiz", []),
                    practical_link_tab=t_data.get("practical_link_tab", "question-bank"),
                    practical_action_label=t_data.get("practical_action_label", "Practice in Coding Bank"),
                    status="pending"
                )
                db.add(topic)
            db.commit()
        db.refresh(roadmap)

    return _format_roadmap_response(roadmap)

@router.post("/generate", response_model=RoadmapOut)
def generate_roadmap(
    req: RoadmapGenerateRequest,
    db: Session = Depends(get_db)
):
    """Generates a personalized AI career roadmap tailored to user domain, skill level, and pace."""
    if not req.domain or len(req.domain.strip()) < 2:
        raise HTTPException(status_code=400, detail="Career domain is required.")
    if not req.skill_level:
        raise HTTPException(status_code=400, detail="Skill level is required.")
    if not req.target_role or len(req.target_role.strip()) < 2:
        raise HTTPException(status_code=400, detail="Target role is required.")

    user = _resolve_user(db, req.user_email)

    # Archive/remove prior active roadmaps to avoid duplicate collisions
    prior_roadmaps = db.query(CareerRoadmap).filter(
        CareerRoadmap.user_id == user.id,
        CareerRoadmap.status == "active"
    ).all()
    for prior in prior_roadmaps:
        db.delete(prior)
    db.commit()

    # Generate structured phases via AI or rich fallback generator
    phases_data = generate_roadmap_with_ai(
        domain=req.domain,
        skill_level=req.skill_level,
        target_role=req.target_role,
        study_time_daily=req.study_time_daily,
        learning_preference=req.learning_preference,
        target_date=req.target_date
    )

    # Create Roadmap entity
    new_roadmap = CareerRoadmap(
        user_id=user.id,
        domain=req.domain,
        skill_level=req.skill_level,
        target_role=req.target_role,
        study_time_daily=req.study_time_daily,
        learning_preference=req.learning_preference,
        target_date=req.target_date,
        overall_progress=0.0,
        status="active"
    )
    db.add(new_roadmap)
    db.commit()
    db.refresh(new_roadmap)

    # Persist phases and topics
    for p_idx, p_data in enumerate(phases_data):
        phase = RoadmapPhase(
            roadmap_id=new_roadmap.id,
            phase_order=p_data.get("phase_order", p_idx + 1),
            title=p_data.get("title", f"Phase {p_idx + 1}"),
            purpose=p_data.get("purpose", "Core learning objectives and mastery."),
            estimated_weeks=p_data.get("estimated_weeks", 2),
            milestone_project=p_data.get("milestone_project"),
            is_completed=False
        )
        db.add(phase)
        db.commit()
        db.refresh(phase)

        topics_list = p_data.get("topics", [])
        for t_idx, t_data in enumerate(topics_list):
            topic = RoadmapTopic(
                phase_id=phase.id,
                topic_order=t_data.get("topic_order", t_idx + 1),
                title=t_data.get("title", f"Topic {t_idx + 1}"),
                description=t_data.get("description", ""),
                learning_objectives=t_data.get("learning_objectives", []),
                prerequisites=t_data.get("prerequisites", []),
                key_concepts=t_data.get("key_concepts", ""),
                exercises=t_data.get("exercises", []),
                resources=t_data.get("resources", []),
                assessment_quiz=t_data.get("assessment_quiz", []),
                practical_link_tab=t_data.get("practical_link_tab", "question-bank"),
                practical_action_label=t_data.get("practical_action_label", "Practice in Coding Bank"),
                status="not_started",
                quiz_score=None,
                is_verified=False
            )
            db.add(topic)

    db.commit()
    db.refresh(new_roadmap)

    return _format_roadmap_response(new_roadmap)

@router.put("/topic/{topic_id}/status")
def update_topic_status(
    topic_id: int,
    req: TopicStatusUpdateRequest,
    db: Session = Depends(get_db)
):
    """Updates learning progress, status, and quiz verification score for a topic."""
    topic = db.query(RoadmapTopic).filter(RoadmapTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Roadmap topic not found.")

    phase = db.query(RoadmapPhase).filter(RoadmapPhase.id == topic.phase_id).first()
    roadmap = db.query(CareerRoadmap).filter(CareerRoadmap.id == phase.roadmap_id).first()

    topic.status = req.status
    if req.quiz_score is not None:
        topic.quiz_score = req.quiz_score
        # Verified if score is >= 70%
        if req.quiz_score >= 70.0:
            topic.is_verified = True
            topic.status = "completed"

    if topic.status == "completed":
        topic.completed_at = datetime.utcnow()
        # Award gamified XP points to user profile
        if roadmap.user and roadmap.user.profile:
            roadmap.user.profile.xp_points = (roadmap.user.profile.xp_points or 0) + 50
    else:
        topic.completed_at = None

    db.commit()

    # Recalculate phase completion
    sibling_topics = db.query(RoadmapTopic).filter(RoadmapTopic.phase_id == phase.id).all()
    all_completed = all(t.status == "completed" for t in sibling_topics) if sibling_topics else False
    if all_completed and not phase.is_completed:
        phase.is_completed = True
        # Bonus XP for completing an entire phase
        if roadmap.user and roadmap.user.profile:
            roadmap.user.profile.xp_points = (roadmap.user.profile.xp_points or 0) + 100
    elif not all_completed:
        phase.is_completed = False

    # Recalculate overall roadmap progress
    all_roadmap_topics = (
        db.query(RoadmapTopic)
        .join(RoadmapPhase, RoadmapTopic.phase_id == RoadmapPhase.id)
        .filter(RoadmapPhase.roadmap_id == roadmap.id)
        .all()
    )
    total_cnt = len(all_roadmap_topics)
    completed_cnt = sum(1 for t in all_roadmap_topics if t.status == "completed")
    roadmap.overall_progress = round((completed_cnt / total_cnt * 100), 1) if total_cnt > 0 else 0.0

    db.commit()
    db.refresh(roadmap)

    return _format_roadmap_response(roadmap)

@router.post("/reset-progress")
def reset_roadmap_progress(
    roadmap_id: int = Query(...),
    user_email: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Resets all topic progress to not_started for the roadmap."""
    roadmap = db.query(CareerRoadmap).filter(CareerRoadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found.")

    for phase in roadmap.phases:
        phase.is_completed = False
        for topic in phase.topics:
            topic.status = "not_started"
            topic.quiz_score = None
            topic.is_verified = False
            topic.completed_at = None

    roadmap.overall_progress = 0.0
    db.commit()
    db.refresh(roadmap)

    return _format_roadmap_response(roadmap)

@router.delete("")
def delete_roadmap(
    roadmap_id: int = Query(...),
    user_email: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Deletes a career roadmap so user can start fresh."""
    roadmap = db.query(CareerRoadmap).filter(CareerRoadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found.")

    db.delete(roadmap)
    db.commit()

    return {"message": "Roadmap deleted successfully."}

@router.get("/recommendation", response_model=RoadmapRecommendationOut)
def get_recommendation(
    roadmap_id: int = Query(...),
    db: Session = Depends(get_db)
):
    """Returns AI-guided next topic recommendation and prerequisite checks."""
    roadmap = db.query(CareerRoadmap).filter(CareerRoadmap.id == roadmap_id).first()
    if not roadmap:
        raise HTTPException(status_code=404, detail="Roadmap not found.")

    formatted = _format_roadmap_response(roadmap)
    rec_topic = formatted.get("next_recommended_topic")

    if not rec_topic:
        return {
            "roadmap_id": roadmap_id,
            "recommended_topic": None,
            "phase_title": None,
            "reason": "Congratulations! You have completed all topics in this roadmap. Ready to take full technical mock assessments!",
            "prerequisites_met": True,
            "missing_prerequisites": []
        }

    # Check if prerequisites are met
    completed_titles = {
        t["title"] for p in formatted["phases"] for t in p["topics"] if t["status"] == "completed"
    }
    prereqs = rec_topic.get("prerequisites", [])
    missing = [p for p in prereqs if p not in completed_titles and p != "Basic terminal and text editor familiarity"]

    if missing:
        reason = f"Recommended based on your {roadmap.domain} trajectory, but review prerequisite: {missing[0]} for optimal grasp."
    else:
        reason = f"Next optimal step in {formatted.get('current_phase_title')}. Builds directly upon your completed foundations."

    return {
        "roadmap_id": roadmap_id,
        "recommended_topic": rec_topic,
        "phase_title": formatted.get("current_phase_title"),
        "reason": reason,
        "prerequisites_met": len(missing) == 0,
        "missing_prerequisites": missing
    }
