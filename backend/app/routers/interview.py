from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.database.session import get_db
from app.models.models import Interview, Question, Answer, User, Profile
from app.schemas.schemas import InterviewCreateRequest, QuestionAnswerSubmit, EvaluationResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/interviews", tags=["Interviews"])

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
        count=req.question_count
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

    return {
        "interview_id": new_interview.id,
        "title": new_interview.title,
        "role": new_interview.role,
        "company": new_interview.company,
        "questions": [
            {
                "id": q.id,
                "question_order": q.question_order,
                "category": q.category,
                "question_text": q.question_text,
                "expected_keywords": q.expected_keywords,
                "code_template": q.code_template
            } for q in db_questions
        ]
    }

@router.post("/evaluate-answer", response_model=EvaluationResponse)
def evaluate_answer(submit: QuestionAnswerSubmit, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == submit.question_id).first()
    if not question:
        raise HTTPException(status_code=404, detail="Question not found.")

    # Calculate filler words count
    filler_words = ["um", "uh", "basically", "like", "you know"]
    user_resp_lower = submit.user_response.lower()
    filler_count = sum(user_resp_lower.count(w) for w in filler_words)

    words = len(submit.user_response.split())
    duration_min = max((submit.audio_duration_sec or 30.0) / 60.0, 0.1)
    wpm = round(words / duration_min, 1)

    # Evaluate via Gemini Service
    eval_result = gemini_service.evaluate_response(
        question_text=question.question_text,
        user_answer=submit.user_response,
        code_submission=submit.code_submission
    )

    # Store Answer record
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
        model_answer=eval_result.get("model_answer", "")
    )
    db.add(ans_record)
    db.commit()

    return {
        "question_id": question.id,
        "score": eval_result.get("score", 80.0),
        "technical_accuracy": eval_result.get("technical_accuracy", 80.0),
        "clarity_score": eval_result.get("clarity_score", 80.0),
        "star_method_score": eval_result.get("star_method_score", 80.0),
        "strengths": eval_result.get("strengths", []),
        "improvements": eval_result.get("improvements", []),
        "model_answer": eval_result.get("model_answer", ""),
        "filler_words_detected": filler_count,
        "wpm": wpm
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
    return [
        {
            "id": i.id,
            "title": i.title,
            "role": i.role,
            "company": i.company,
            "difficulty": i.difficulty,
            "interview_type": i.interview_type,
            "overall_score": i.overall_score,
            "hiring_recommendation": i.hiring_recommendation,
            "status": i.status,
            "created_at": i.created_at.isoformat() if i.created_at else ""
        } for i in interviews
    ]
