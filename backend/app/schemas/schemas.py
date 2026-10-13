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
    username_or_email: Optional[str] = None
    email_or_username: Optional[str] = None
    password: str

    @property
    def identifier(self) -> str:
        return (self.username_or_email or self.email_or_username or "").strip()

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordWithTokenRequest(BaseModel):
    reset_token: str
    new_password: str

class ChangePasswordRequest(BaseModel):
    email_or_username: Optional[str] = None
    email: Optional[str] = None
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

class QuestionGenerateRequest(BaseModel):
    role: str = "Software Engineer"
    company: str = "Google"
    experience_level: str = "Mid-Level"
    interview_type: str = "Technical"
    difficulty: str = "Medium"
    topic: Optional[str] = None
    count: int = 3

class QuestionAnswerSubmit(BaseModel):
    interview_id: int
    question_id: int
    user_response: str
    code_submission: Optional[str] = None
    question_text: Optional[str] = None
    test_results: Optional[str] = None
    audio_duration_sec: Optional[float] = 0.0
    persona: Optional[str] = "strict-tech-lead"

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
    adaptive_followup_question: Optional[str] = None
    filler_words_detected: int
    wpm: float
    ai_generated: Optional[bool] = True
    source: Optional[str] = "gemini"
    model: Optional[str] = None

# AI Health & Status Output
class GeminiStatusResponse(BaseModel):
    configured: bool
    model: str
    status: str
    message: str

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

# Career Roadmap Schemas
class RoadmapGenerateRequest(BaseModel):
    domain: str
    skill_level: str
    target_role: str
    study_time_daily: str = "1 hour"
    learning_preference: str = "balanced"
    target_date: Optional[str] = None
    user_email: Optional[str] = None

class TopicStatusUpdateRequest(BaseModel):
    status: str # not_started, in_progress, completed
    quiz_score: Optional[float] = None
    user_email: Optional[str] = None

class RoadmapTopicOut(BaseModel):
    id: int
    phase_id: int
    topic_order: int
    title: str
    description: str
    learning_objectives: Optional[List[str]] = []
    prerequisites: Optional[List[str]] = []
    key_concepts: Optional[str] = None
    exercises: Optional[List[str]] = []
    resources: Optional[List[Any]] = []
    assessment_quiz: Optional[List[Any]] = []
    practical_link_tab: Optional[str] = None
    practical_action_label: Optional[str] = None
    status: str
    quiz_score: Optional[float] = None
    is_verified: bool = False
    completed_at: Optional[str] = None

class RoadmapPhaseOut(BaseModel):
    id: int
    roadmap_id: int
    phase_order: int
    title: str
    purpose: str
    estimated_weeks: int
    milestone_project: Optional[str] = None
    is_completed: bool = False
    topics: List[RoadmapTopicOut] = []
    completed_topics_count: int = 0
    total_topics_count: int = 0
    progress_percentage: float = 0.0

class RoadmapOut(BaseModel):
    id: int
    user_id: int
    domain: str
    skill_level: str
    target_role: str
    study_time_daily: str
    learning_preference: str
    target_date: Optional[str] = None
    overall_progress: float
    status: str
    phases: List[RoadmapPhaseOut] = []
    total_phases: int = 0
    total_topics: int = 0
    completed_topics: int = 0
    current_phase_title: Optional[str] = None
    next_recommended_topic: Optional[RoadmapTopicOut] = None

class RoadmapRecommendationOut(BaseModel):
    roadmap_id: int
    recommended_topic: Optional[RoadmapTopicOut] = None
    phase_title: Optional[str] = None
    reason: str
    prerequisites_met: bool = True
    missing_prerequisites: List[str] = []

# ==================== ONBOARDING & STUDY PLAN SCHEMAS ====================

import datetime
from pydantic import field_validator

class OnboardingSubmitRequest(BaseModel):
    target_role: str
    experience_level: str
    interview_date_preset: Optional[str] = "not_scheduled"  # within_7_days, within_14_days, within_30_days, custom, not_scheduled
    interview_date: Optional[datetime.datetime] = None
    target_company: Optional[str] = None
    resume_url: Optional[str] = None
    step: Optional[int] = 3
    skip: Optional[bool] = False

    @field_validator("interview_date")
    @classmethod
    def validate_interview_date(cls, v: Optional[datetime.datetime]) -> Optional[datetime.datetime]:
        if v is not None:
            # Normalize comparison to UTC/naive
            now = datetime.datetime.now(v.tzinfo) if v.tzinfo else datetime.datetime.now()
            # Allow same day by checking if date is before yesterday's end
            if v < now - datetime.timedelta(hours=12):
                raise ValueError("Interview date cannot be in the past.")
        return v

    @field_validator("target_role")
    @classmethod
    def validate_role(cls, v: str) -> str:
        cleaned = v.strip()
        if not cleaned:
            raise ValueError("Target role cannot be empty.")
        return cleaned

class StudyPlanTaskOut(BaseModel):
    id: Optional[int] = None
    week_number: int
    day_number: int
    title: str
    session_type: str
    sessions_count: int
    status: str
    completed_at: Optional[datetime.datetime] = None

class StudyPlanOut(BaseModel):
    role: str
    experience_level: str
    weeks_count: int
    days_until_interview: Optional[int] = None
    interview_date: Optional[datetime.datetime] = None
    total_sessions: int
    remaining_monthly_sessions: int
    quota_capped: bool
    quota_warning: Optional[str] = None
    tasks: List[StudyPlanTaskOut] = []

class OnboardingStatusOut(BaseModel):
    onboarding_completed: bool
    onboarding_completed_at: Optional[datetime.datetime] = None
    onboarding_step: int
    target_role: Optional[str] = None
    experience_level: Optional[str] = None
    interview_date: Optional[datetime.datetime] = None
    interview_date_preset: Optional[str] = None
    target_company: Optional[str] = None
    days_until_interview: Optional[int] = None
    has_active_plan: bool = False

