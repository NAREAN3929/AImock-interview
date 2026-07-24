from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import ResumeAnalyzeRequest, ResumeAnalyzeResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/resume", tags=["Resume Analyzer"])

@router.post("/analyze", response_model=ResumeAnalyzeResponse)
def analyze_resume_text(req: ResumeAnalyzeRequest, db: Session = Depends(get_db)):
    if not req.resume_text or len(req.resume_text.strip()) < 20:
        raise HTTPException(status_code=400, detail="Please provide a valid resume text.")

    analysis = gemini_service.analyze_resume(
        resume_text=req.resume_text,
        target_role=req.target_role
    )

    return {
        "resume_score": analysis.get("resume_score", 85.0),
        "extracted_skills": analysis.get("extracted_skills", []),
        "missing_skills": analysis.get("missing_skills", []),
        "summary": analysis.get("summary", ""),
        "recommended_questions": analysis.get("recommended_questions", [])
    }
