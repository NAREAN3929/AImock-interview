from pydantic import BaseModel, EmailStr
from typing import Optional, List, Any

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    username: str
    password: str
    full_name: Optional[str] = None

class VerifyOTPRequest(BaseModel):
    email: EmailStr
    otp_code: str

class ResendOTPRequest(BaseModel):
    email: EmailStr

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordWithTokenRequest(BaseModel):
    reset_token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    email_or_username: str
    current_password: str
    new_password: str

class Token(BaseModel):
    access_token: str
    token_type: str
    user_id: int
    username: str
    role: str
    is_verified: bool

class UserProfileOut(BaseModel):
    id: int
    email: str
    username: str
    full_name: Optional[str]
    target_role: str
    experience_level: str
    readiness_score: float
    total_interviews: int
    streak_days: int
    xp_points: int
    is_verified: bool

# Interview Setup & Generation Request
class InterviewCreateRequest(BaseModel):
    role: str
    experience_level: str
    company: str
    interview_type: str
    question_count: int = 5
    difficulty: str = "Medium"

class QuestionAnswerSubmit(BaseModel):
    interview_id: int
    question_id: int
    user_response: str
    code_submission: Optional[str] = None
    audio_duration_sec: Optional[float] = 0.0

# Evaluation Output
class EvaluationResponse(BaseModel):
    question_id: int
    score: float
    technical_accuracy: float
    clarity_score: float
    star_method_score: float
    strengths: List[str]
    improvements: List[str]
    model_answer: str
    filler_words_detected: int
    wpm: float

# Resume Upload / Analysis
class ResumeAnalyzeRequest(BaseModel):
    resume_text: str
    target_role: str

class ResumeAnalyzeResponse(BaseModel):
    resume_score: float
    extracted_skills: List[str]
    missing_skills: List[str]
    summary: str
    recommended_questions: List[str]
