import io
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import ResumeAnalyzeRequest, ResumeAnalyzeResponse
from app.services.gemini_service import gemini_service

router = APIRouter(prefix="/resume", tags=["Resume Analyzer"])

def extract_text_from_file(file_bytes: bytes, filename: str) -> str:
    ext = filename.lower().split('.')[-1] if '.' in filename else ''
    text = ""

    if ext == 'pdf':
        try:
            import pypdf
            reader = pypdf.PdfReader(io.BytesIO(file_bytes))
            for page in reader.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        except Exception as e:
            # Fallback text decoding if PDF reader encounters issues
            text = file_bytes.decode('utf-8', errors='ignore')
    elif ext in ['docx', 'doc']:
        try:
            import docx
            doc = docx.Document(io.BytesIO(file_bytes))
            for p in doc.paragraphs:
                if p.text:
                    text += p.text + "\n"
        except Exception as e:
            text = file_bytes.decode('utf-8', errors='ignore')
    else:
        text = file_bytes.decode('utf-8', errors='ignore')

    return text.strip()

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

@router.post("/upload", response_model=ResumeAnalyzeResponse)
async def analyze_resume_file(
    file: UploadFile = File(...),
    target_role: str = Form("Software Engineer"),
    db: Session = Depends(get_db)
):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded.")

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    resume_text = extract_text_from_file(content, file.filename)
    if len(resume_text) < 20:
        raise HTTPException(status_code=400, detail="Could not extract readable text from document. Please ensure it contains readable text.")

    analysis = gemini_service.analyze_resume(
        resume_text=resume_text,
        target_role=target_role
    )

    return {
        "resume_score": analysis.get("resume_score", 85.0),
        "extracted_skills": analysis.get("extracted_skills", []),
        "missing_skills": analysis.get("missing_skills", []),
        "summary": analysis.get("summary", ""),
        "recommended_questions": analysis.get("recommended_questions", [])
    }
