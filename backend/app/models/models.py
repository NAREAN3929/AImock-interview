import datetime
from sqlalchemy import Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    role = Column(String(50), default="candidate") # candidate, admin
    is_active = Column(Boolean, default=True)
    
    # Email OTP & Password Reset Verification Fields
    is_verified = Column(Boolean, default=False)
    otp_code = Column(String(10), nullable=True)
    otp_expires_at = Column(DateTime, nullable=True)
    reset_token = Column(String(255), nullable=True)
    reset_token_expires_at = Column(DateTime, nullable=True)

    # First-login onboarding tracking
    onboarding_completed = Column(Boolean, default=False)
    onboarding_completed_at = Column(DateTime, nullable=True)
    onboarding_step = Column(Integer, default=1)

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False)
    interviews = relationship("Interview", back_populates="user")
    resumes = relationship("Resume", back_populates="user")
    readiness_snapshots = relationship("ReadinessSnapshot", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("CareerRoadmap", back_populates="user", cascade="all, delete-orphan")
    study_plans = relationship("StudyPlanTask", back_populates="user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    target_role = Column(String(100), default="Frontend developer")
    experience_level = Column(String(50), default="Fresher") # Fresher, 1 to 3 years, 3+ years
    interview_date = Column(DateTime, nullable=True)
    interview_date_preset = Column(String(50), nullable=True) # within_7_days, within_14_days, within_30_days, custom, not_scheduled
    target_company = Column(String(100), nullable=True)
    resume_url = Column(String(255), nullable=True)
    onboarding_completed = Column(Boolean, default=False)
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(255), nullable=True)
    readiness_score = Column(Float, default=78.5)
    total_interviews = Column(Integer, default=0)
    streak_days = Column(Integer, default=1)
    xp_points = Column(Integer, default=120)
    
    # Streak Freeze Tracking (1 freeze allowed per calendar week)
    freeze_used_this_week = Column(Boolean, default=False)
    last_freeze_used_at = Column(DateTime, nullable=True)
    last_freeze_reset_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Monthly Session Quota (Enforced server-side)
    monthly_quota = Column(Integer, default=10)
    sessions_used_this_month = Column(Integer, default=0)
    last_quota_reset_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Theme preference
    theme_preference = Column(String(20), default="light")
    
    user = relationship("User", back_populates="profile")

class StudyPlanTask(Base):
    __tablename__ = "study_plans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    week_number = Column(Integer, nullable=False)
    day_number = Column(Integer, default=1)
    title = Column(String(255), nullable=False)
    session_type = Column(String(50), nullable=False) # system_design, dsa, star_behavioral, mock_interview, fundamentals
    sessions_count = Column(Integer, default=1)
    status = Column(String(50), default="pending") # pending, done
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="study_plans")

class ReadinessSnapshot(Base):
    __tablename__ = "readiness_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    week_start_date = Column(DateTime, nullable=False)
    readiness_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="readiness_snapshots")

class Interview(Base):
    __tablename__ = "interviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(255), nullable=False)
    role = Column(String(100), nullable=False)
    company = Column(String(100), default="General Tech")
    difficulty = Column(String(50), default="Medium")
    interview_type = Column(String(50), default="Technical") # Technical, Behavioral, System Design, HR
    question_count = Column(Integer, default=5)
    overall_score = Column(Float, default=0.0)
    technical_score = Column(Float, default=0.0)
    behavioral_score = Column(Float, default=0.0)
    communication_score = Column(Float, default=0.0)
    confidence_score = Column(Float, default=0.0)
    hiring_recommendation = Column(String(50), default="Pending") # Strong Hire, Hire, Lean Hire, No Hire
    status = Column(String(50), default="in_progress") # in_progress, completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="interviews")
    questions = relationship("Question", back_populates="interview", cascade="all, delete-orphan")

class Question(Base):
    __tablename__ = "questions"

    id = Column(Integer, primary_key=True, index=True)
    interview_id = Column(Integer, ForeignKey("interviews.id"))
    question_order = Column(Integer, nullable=False)
    category = Column(String(100), nullable=False)
    question_text = Column(Text, nullable=False)
    expected_keywords = Column(JSON, nullable=True)
    ideal_answer = Column(Text, nullable=True)
    code_template = Column(Text, nullable=True)

    interview = relationship("Interview", back_populates="questions")
    answers = relationship("Answer", back_populates="question", cascade="all, delete-orphan")

class Answer(Base):
    __tablename__ = "answers"

    id = Column(Integer, primary_key=True, index=True)
    question_id = Column(Integer, ForeignKey("questions.id"))
    user_response = Column(Text, nullable=False)
    code_submission = Column(Text, nullable=True)
    audio_duration_sec = Column(Float, default=0.0)
    filler_word_count = Column(Integer, default=0)
    words_per_minute = Column(Float, default=0.0)
    
    # Evaluation
    score = Column(Float, default=0.0)
    technical_accuracy = Column(Float, default=0.0)
    clarity_score = Column(Float, default=0.0)
    star_method_score = Column(Float, default=0.0)
    strengths = Column(JSON, nullable=True)
    improvements = Column(JSON, nullable=True)
    model_answer = Column(Text, nullable=True)
    adaptive_followup_question = Column(Text, nullable=True)

    question = relationship("Question", back_populates="answers")

class Resume(Base):
    __tablename__ = "resumes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    file_name = Column(String(255), nullable=False)
    extracted_skills = Column(JSON, nullable=True)
    missing_skills = Column(JSON, nullable=True)
    resume_score = Column(Float, default=80.0)
    summary = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="resumes")

class AdminLog(Base):
    __tablename__ = "admin_logs"

    id = Column(Integer, primary_key=True, index=True)
    action = Column(String(255), nullable=False)
    detail = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class CareerRoadmap(Base):
    __tablename__ = "career_roadmaps"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), index=True, nullable=False)
    domain = Column(String(100), nullable=False)
    skill_level = Column(String(50), nullable=False)
    target_role = Column(String(100), nullable=False)
    study_time_daily = Column(String(50), default="1 hour")
    learning_preference = Column(String(50), default="balanced")
    target_date = Column(String(50), nullable=True)
    overall_progress = Column(Float, default=0.0)
    status = Column(String(50), default="active") # active, completed, archived
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user = relationship("User", back_populates="roadmaps")
    phases = relationship("RoadmapPhase", back_populates="roadmap", cascade="all, delete-orphan", order_by="RoadmapPhase.phase_order")

class RoadmapPhase(Base):
    __tablename__ = "roadmap_phases"

    id = Column(Integer, primary_key=True, index=True)
    roadmap_id = Column(Integer, ForeignKey("career_roadmaps.id"), index=True, nullable=False)
    phase_order = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    purpose = Column(Text, nullable=False)
    estimated_weeks = Column(Integer, default=2)
    milestone_project = Column(String(255), nullable=True)
    is_completed = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    roadmap = relationship("CareerRoadmap", back_populates="phases")
    topics = relationship("RoadmapTopic", back_populates="phase", cascade="all, delete-orphan", order_by="RoadmapTopic.topic_order")

class RoadmapTopic(Base):
    __tablename__ = "roadmap_topics"

    id = Column(Integer, primary_key=True, index=True)
    phase_id = Column(Integer, ForeignKey("roadmap_phases.id"), index=True, nullable=False)
    topic_order = Column(Integer, nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    learning_objectives = Column(JSON, nullable=True) # List[str]
    prerequisites = Column(JSON, nullable=True) # List[str]
    key_concepts = Column(Text, nullable=True) # Detailed explanation & code snippets
    exercises = Column(JSON, nullable=True) # List[str]
    resources = Column(JSON, nullable=True) # List[{"title": str, "url": str, "type": str}]
    assessment_quiz = Column(JSON, nullable=True) # List[{"question": str, "options": List[str], "correct": int, "explanation": str}]
    practical_link_tab = Column(String(50), nullable=True) # 'question-bank' | 'setup' | 'company-oa' | 'aptitude' | 'communication'
    practical_action_label = Column(String(100), nullable=True)
    status = Column(String(50), default="not_started") # not_started, in_progress, completed
    quiz_score = Column(Float, nullable=True)
    is_verified = Column(Boolean, default=False)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    phase = relationship("RoadmapPhase", back_populates="topics")

class CollegeDrive(Base):
    __tablename__ = "college_drives"

    id = Column(Integer, primary_key=True, index=True)
    company_name = Column(String(255), nullable=False)
    role_offered = Column(String(255), nullable=False)
    drive_date = Column(String(100), nullable=False)
    status = Column(String(50), default="Scheduled") # Scheduled, Active, Completed
    min_cgpa = Column(Float, default=7.0)
    eligible_students_count = Column(Integer, default=120)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class PlacementMetric(Base):
    __tablename__ = "placement_metrics"

    id = Column(Integer, primary_key=True, index=True)
    batch_year = Column(String(20), default="2026")
    total_enrolled = Column(Integer, default=320)
    total_placed = Column(Integer, default=245)
    average_readiness_score = Column(Float, default=83.4)
    highest_package_lpa = Column(Float, default=44.0)
    average_package_lpa = Column(Float, default=14.5)
