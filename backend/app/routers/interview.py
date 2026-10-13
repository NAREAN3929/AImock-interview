from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.models.models import Interview, Question, Answer, User, Profile
from app.schemas.schemas import (
    InterviewCreateRequest, 
    QuestionAnswerSubmit, 
    EvaluationResponse,
    QuestionGenerateRequest,
    GeminiStatusResponse
)
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/interviews", tags=["Interviews"])

@router.get("/ai-status", response_model=GeminiStatusResponse)
def get_ai_engine_status():
    """Returns current live Google Gemini AI status and active model."""
    status_info = gemini_service.get_status()
    return status_info

@router.post("/generate-questions")
def generate_questions_on_demand(req: QuestionGenerateRequest):
    """Dynamically generate interview questions using Google Gemini API without requiring persistent session."""
    questions = gemini_service.generate_interview_questions(
        role=req.role,
        experience=req.experience_level,
        company=req.company,
        interview_type=req.interview_type,
        count=req.count,
        difficulty=req.difficulty,
        topic=req.topic
    )
    is_ai = bool(questions[0].get("ai_generated", True)) if questions else False
    src = questions[0].get("source", "gemini") if questions else "unknown"
    mdl = questions[0].get("model", "gemini-3-flash-preview") if questions else "unknown"
    return {
        "role": req.role,
        "company": req.company,
        "difficulty": req.difficulty,
        "ai_generated": is_ai,
        "source": src,
        "model": mdl,
        "questions": questions
    }

@router.post("/create")
def create_interview_session(req: InterviewCreateRequest, db: Session = Depends(get_db)):
    # Fetch or create demo user
    user = db.query(User).first()
    if not user:
        user = User(email="demo@interview.ai", username="demo_user", hashed_password="hashedpassword")
        db.add(user)
        db.commit()
        db.refresh(user)

    # Create Interview model
    new_interview = Interview(
        user_id=user.id,
        title=f"{req.role} Mock Interview ({req.company})",
        role=req.role,
        company=req.company,
        difficulty=req.difficulty,
        interview_type=req.interview_type,
        question_count=req.question_count,
        status="in_progress"
    )
    db.add(new_interview)
    db.commit()
    db.refresh(new_interview)

    # Generate questions via Gemini
    generated_q_list = gemini_service.generate_interview_questions(
        role=req.role,
        experience=req.experience_level,
        company=req.company,
        interview_type=req.interview_type,
        count=req.question_count,
        difficulty=req.difficulty
    )

    db_questions = []
    for item in generated_q_list:
        q = Question(
            interview_id=new_interview.id,
            question_order=item.get("question_order", 1),
            category=item.get("category", "Technical"),
            question_text=item.get("question_text", ""),
            expected_keywords=item.get("expected_keywords", []),
            ideal_answer=item.get("ideal_answer", ""),
            code_template=item.get("code_template", "")
        )
        db.add(q)
        db_questions.append(q)

    db.commit()

    is_ai = bool(generated_q_list[0].get("ai_generated", True)) if generated_q_list else True
    src = generated_q_list[0].get("source", "gemini") if generated_q_list else "gemini"
    mdl = generated_q_list[0].get("model", "gemini-3-flash-preview") if generated_q_list else "gemini-3-flash-preview"

    return {
        "interview_id": new_interview.id,
        "title": new_interview.title,
        "role": new_interview.role,
        "company": new_interview.company,
        "ai_generated": is_ai,
        "source": src,
        "model": mdl,
        "questions": [
            {
                "id": q.id,
                "question_order": q.question_order,
                "category": q.category,
                "question_text": q.question_text,
                "expected_keywords": q.expected_keywords,
                "code_template": q.code_template,
                "ai_generated": is_ai,
                "source": src,
                "model": mdl
            } for q in db_questions
        ]
    }

@router.post("/evaluate-answer", response_model=EvaluationResponse)
def evaluate_answer(submit: QuestionAnswerSubmit, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == submit.question_id).first()
    question_text = question.question_text if question else (submit.question_text or "Technical Coding Assessment")

    # Calculate filler words count
    filler_words = ["um", "uh", "basically", "like", "you know"]
    user_resp_lower = submit.user_response.lower()
    filler_count = sum(user_resp_lower.count(w) for w in filler_words)

    words = len(submit.user_response.split())
    duration_min = max((submit.audio_duration_sec or 30.0) / 60.0, 0.1)
    wpm = round(words / duration_min, 1)

    # Evaluate via Gemini Service with Persona & Test Results
    eval_result = gemini_service.evaluate_response(
        question_text=question_text,
        user_answer=submit.user_response,
        code_submission=submit.code_submission,
        test_results=submit.test_results,
        persona=submit.persona or "strict-tech-lead"
    )

    followup_q = eval_result.get("adaptive_followup_question", "")

    # Store Answer record if question exists in DB
    if question:
        ans_record = Answer(
            question_id=question.id,
            user_response=submit.user_response,
            code_submission=submit.code_submission,
            audio_duration_sec=submit.audio_duration_sec,
            filler_word_count=filler_count,
            words_per_minute=wpm,
            score=eval_result.get("score", 80.0),
            technical_accuracy=eval_result.get("technical_accuracy", 80.0),
            clarity_score=eval_result.get("clarity_score", 80.0),
            star_method_score=eval_result.get("star_method_score", 80.0),
            strengths=eval_result.get("strengths", []),
            improvements=eval_result.get("improvements", []),
            model_answer=eval_result.get("model_answer", ""),
            adaptive_followup_question=followup_q
        )
        db.add(ans_record)
        db.commit()

    return {
        "question_id": submit.question_id,
        "score": eval_result.get("score", 80.0),
        "technical_accuracy": eval_result.get("technical_accuracy", 80.0),
        "clarity_score": eval_result.get("clarity_score", 80.0),
        "star_method_score": eval_result.get("star_method_score", 80.0),
        "strengths": eval_result.get("strengths", []),
        "improvements": eval_result.get("improvements", []),
        "model_answer": eval_result.get("model_answer", ""),
        "adaptive_followup_question": followup_q,
        "filler_words_detected": filler_count,
        "wpm": wpm,
        "ai_generated": eval_result.get("ai_generated", True),
        "source": eval_result.get("source", "gemini"),
        "model": eval_result.get("model", "gemini-3-flash-preview")
    }

@router.post("/complete/{interview_id}")
def complete_interview(interview_id: int, db: Session = Depends(get_db)):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found.")

    # Calculate average scores
    scores = []
    tech_scores = []
    clarity_scores = []

    for q in interview.questions:
        for a in q.answers:
            scores.append(a.score)
            tech_scores.append(a.technical_accuracy)
            clarity_scores.append(a.clarity_score)

    avg_score = round(sum(scores) / max(len(scores), 1), 1) if scores else 82.0
    avg_tech = round(sum(tech_scores) / max(len(tech_scores), 1), 1) if tech_scores else 85.0
    avg_clarity = round(sum(clarity_scores) / max(len(clarity_scores), 1), 1) if clarity_scores else 80.0

    if avg_score >= 88.0:
        rec = "Strong Hire"
    elif avg_score >= 78.0:
        rec = "Hire"
    elif avg_score >= 68.0:
        rec = "Lean Hire"
    else:
        rec = "Needs Improvement"

    interview.overall_score = avg_score
    interview.technical_score = avg_tech
    interview.communication_score = avg_clarity
    interview.confidence_score = round(avg_score * 0.95, 1)
    interview.hiring_recommendation = rec
    interview.status = "completed"

    db.commit()

    return {
        "interview_id": interview.id,
        "overall_score": avg_score,
        "technical_score": avg_tech,
        "communication_score": avg_clarity,
        "hiring_recommendation": rec,
        "status": "completed"
    }

@router.get("/history")
def get_interview_history(db: Session = Depends(get_db)):
    interviews = db.query(Interview).order_by(Interview.created_at.desc()).all()
    result = []
    for i in interviews:
        total_duration_sec = 0
        strengths_list = []
        improvements_list = []
        for q in i.questions:
            for a in q.answers:
                if a.audio_duration_sec:
                    total_duration_sec += a.audio_duration_sec
                if a.strengths:
                    strengths_list.extend(a.strengths if isinstance(a.strengths, list) else [])
                if a.improvements:
                    improvements_list.extend(a.improvements if isinstance(a.improvements, list) else [])
        
        duration_min = max(round(total_duration_sec / 60), 1) if total_duration_sec > 0 else (len(i.questions) * 3 or 12)
        
        result.append({
            "id": i.id,
            "title": i.title,
            "role": i.role,
            "company": i.company,
            "difficulty": i.difficulty,
            "interview_type": i.interview_type,
            "overall_score": i.overall_score or 82.0,
            "technical_score": i.technical_score or round((i.overall_score or 82.0) * 1.02, 1),
            "communication_score": i.communication_score or round((i.overall_score or 82.0) * 0.98, 1),
            "behavioral_score": i.behavioral_score or round((i.overall_score or 82.0) * 0.96, 1),
            "confidence_score": i.confidence_score or round((i.overall_score or 82.0) * 0.95, 1),
            "hiring_recommendation": i.hiring_recommendation or "Hire",
            "status": i.status or "completed",
            "created_at": i.created_at.isoformat() if i.created_at else "",
            "duration_minutes": duration_min,
            "question_count": len(i.questions) if i.questions else i.question_count,
            "strengths": strengths_list[:3] if strengths_list else [
                "Strong foundational system architecture reasoning",
                "Concise, structured problem framing"
            ],
            "improvements": improvements_list[:2] if improvements_list else [
                "Quantify scale metrics and latency bounds earlier in responses"
            ]
        })
    return result

@router.get("/{interview_id}")
def get_interview_detail(interview_id: int, db: Session = Depends(get_db)):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found.")

    questions_data = []
    all_strengths = []
    all_improvements = []
    total_duration_sec = 0
    total_fillers = 0
    wpm_list = []

    for q in interview.questions:
        q_answers = []
        for a in q.answers:
            if a.strengths and isinstance(a.strengths, list):
                all_strengths.extend(a.strengths)
            if a.improvements and isinstance(a.improvements, list):
                all_improvements.extend(a.improvements)
            if a.audio_duration_sec:
                total_duration_sec += a.audio_duration_sec
            if a.filler_word_count:
                total_fillers += a.filler_word_count
            if a.words_per_minute:
                wpm_list.append(a.words_per_minute)

            q_answers.append({
                "id": a.id,
                "user_response": a.user_response,
                "code_submission": a.code_submission,
                "score": a.score,
                "technical_accuracy": a.technical_accuracy,
                "clarity_score": a.clarity_score,
                "star_method_score": a.star_method_score,
                "strengths": a.strengths or [],
                "improvements": a.improvements or [],
                "model_answer": a.model_answer or "",
                "adaptive_followup_question": a.adaptive_followup_question or "",
                "words_per_minute": a.words_per_minute or 135,
                "filler_word_count": a.filler_word_count or 0
            })

        questions_data.append({
            "id": q.id,
            "question_order": q.question_order,
            "category": q.category,
            "question_text": q.question_text,
            "expected_keywords": q.expected_keywords or [],
            "ideal_answer": q.ideal_answer or "",
            "code_template": q.code_template or "",
            "answers": q_answers
        })

    avg_wpm = round(sum(wpm_list) / max(len(wpm_list), 1)) if wpm_list else 138
    duration_min = max(round(total_duration_sec / 60), 1) if total_duration_sec > 0 else (len(interview.questions) * 3 or 15)

    return {
        "id": interview.id,
        "title": interview.title,
        "role": interview.role,
        "company": interview.company,
        "difficulty": interview.difficulty,
        "interview_type": interview.interview_type,
        "overall_score": interview.overall_score or 82.0,
        "technical_score": interview.technical_score or round((interview.overall_score or 82.0) * 1.02, 1),
        "communication_score": interview.communication_score or round((interview.overall_score or 82.0) * 0.98, 1),
        "behavioral_score": interview.behavioral_score or round((interview.overall_score or 82.0) * 0.96, 1),
        "confidence_score": interview.confidence_score or round((interview.overall_score or 82.0) * 0.95, 1),
        "hiring_recommendation": interview.hiring_recommendation or "Hire",
        "status": interview.status or "completed",
        "created_at": interview.created_at.isoformat() if interview.created_at else "",
        "duration_minutes": duration_min,
        "total_fillers": total_fillers,
        "average_wpm": avg_wpm,
        "questions": questions_data,
        "strengths": list(dict.fromkeys(all_strengths))[:4] if all_strengths else [
            "Clear articulation of system trade-offs and edge cases",
            "Effective structured STAR response formatting"
        ],
        "improvements": list(dict.fromkeys(all_improvements))[:3] if all_improvements else [
            "State operational constraints and SLA expectations before presenting design"
        ]
    }

@router.delete("/{interview_id}")
def delete_interview(interview_id: int, db: Session = Depends(get_db)):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview session not found.")
    db.delete(interview)
    db.commit()
    return {"status": "success", "message": f"Interview session {interview_id} deleted successfully."}
