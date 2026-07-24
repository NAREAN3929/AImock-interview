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

    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    profile = relationship("Profile", back_populates="user", uselist=False)
    interviews = relationship("Interview", back_populates="user")
    resumes = relationship("Resume", back_populates="user")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    target_role = Column(String(100), default="Software Engineer")
    experience_level = Column(String(50), default="Mid-Level")
    bio = Column(Text, nullable=True)
    avatar_url = Column(String(255), nullable=True)
    readiness_score = Column(Float, default=78.5)
    total_interviews = Column(Integer, default=0)
    streak_days = Column(Integer, default=1)
    xp_points = Column(Integer, default=120)
    
    user = relationship("User", back_populates="profile")

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
