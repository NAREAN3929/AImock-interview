import random
import uuid
import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.models import User, Profile
from app.schemas.schemas import (
    UserCreate, 
    VerifyOTPRequest, 
    ResendOTPRequest, 
    UserLogin, 
    ForgotPasswordRequest, 
    ResetPasswordWithTokenRequest, 
    ChangePasswordRequest, 
    Token, 
    UserProfileOut
)
from app.core.security import get_password_hash, verify_password, create_access_token
from app.services.email_service import email_service

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/signup")
@router.post("/register")
def signup(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter((User.email == user_in.email) | (User.username == user_in.username)).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username or Email already registered.")
    
    hashed_pwd = get_password_hash(user_in.password)
    
    # Generate 6-digit OTP valid for 5 minutes
    otp_code = str(random.randint(100000, 999999))
    otp_expires = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)

    new_user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name or user_in.username,
        is_verified=False,
        otp_code=otp_code,
        otp_expires_at=otp_expires
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create default profile
    new_profile = Profile(user_id=new_user.id)
    db.add(new_profile)
    db.commit()

    # Dispatch OTP via email service
    email_service.send_otp_email(new_user.email, otp_code)

    return {
        "message": "Signup successful! OTP code sent to your email (valid for 5 minutes).",
        "email": new_user.email,
        "require_otp": True
    }

@router.post("/verify-otp", response_model=Token)
def verify_otp(req: VerifyOTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User email not found.")
    
    if user.is_verified:
        # Already verified
        access_token = create_access_token(subject=user.username)
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "username": user.username,
            "role": user.role,
            "is_verified": True
        }

    # Verify expiration (5 minutes)
    if not user.otp_expires_at or datetime.datetime.utcnow() > user.otp_expires_at:
        raise HTTPException(status_code=400, detail="OTP has expired (valid for 5 minutes). Please request a new OTP.")

    if user.otp_code != req.otp_code.strip():
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please check your email and try again.")

    # Mark as verified
    user.is_verified = True
    user.otp_code = None
    user.otp_expires_at = None
    db.commit()

    access_token = create_access_token(subject=user.username)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "is_verified": True
    }

@router.post("/resend-otp")
def resend_otp(req: ResendOTPRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User email not found.")

    otp_code = str(random.randint(100000, 999999))
    user.otp_code = otp_code
    user.otp_expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
    db.commit()

    email_service.send_otp_email(user.email, otp_code)

    return {
        "message": "New OTP sent to your email (valid for 5 minutes).",
        "email": user.email
    }

@router.post("/login", response_model=Token)
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    identifier = login_in.identifier
    user = db.query(User).filter(
        (User.username == identifier) | (User.email == identifier)
    ).first()
    
    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect credentials.")

    if not user.is_verified:
        # Resend OTP if not verified yet
        otp_code = str(random.randint(100000, 999999))
        user.otp_code = otp_code
        user.otp_expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=5)
        db.commit()
        email_service.send_otp_email(user.email, otp_code)
        
        raise HTTPException(
            status_code=403, 
            detail=f"Email not verified yet. A new OTP has been sent to {user.email} (valid for 5 minutes)."
        )
    
    access_token = create_access_token(subject=user.username)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "is_verified": user.is_verified
    }

@router.post("/forgot-password")
def forgot_password(req: ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == req.email).first()
    if not user:
        # For security, return success message even if email not found
        return {"message": "If an account exists with this email, a password reset link has been sent."}

    reset_token = str(uuid.uuid4())
    user.reset_token = reset_token
    user.reset_token_expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    db.commit()

    email_service.send_password_reset_email(user.email, reset_token)

    return {"message": f"Password reset link sent to {user.email} (valid for 15 minutes)."}

@router.post("/reset-password")
def reset_password(req: ResetPasswordWithTokenRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.reset_token == req.reset_token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired reset token.")

    if not user.reset_token_expires_at or datetime.datetime.utcnow() > user.reset_token_expires_at:
        raise HTTPException(status_code=400, detail="Reset token has expired (valid for 15 minutes). Please request a new reset link.")

    user.hashed_password = get_password_hash(req.new_password)
    user.reset_token = None
    user.reset_token_expires_at = None
    db.commit()

    return {"message": "Password reset successful! You can now log in with your new password."}

@router.post("/change-password")
def change_password(req: ChangePasswordRequest, db: Session = Depends(get_db)):
    identifier = (req.email_or_username or req.email or "").strip()
    user = db.query(User).filter(
        (User.username == identifier) | (User.email == identifier)
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User account not found.")

    if not verify_password(req.current_password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Current password incorrect.")

    user.hashed_password = get_password_hash(req.new_password)
    db.commit()

    return {"message": "Password changed successfully!"}

@router.get("/me", response_model=UserProfileOut)
def get_current_user_profile(username: str = "demo_candidate", db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == username).first()
    if not user:
        user = User(
            email="candidate@interview.ai",
            username=username,
            hashed_password=get_password_hash("password123"),
            full_name="Alex Developer",
            is_verified=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)

        profile = Profile(user_id=user.id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    else:
        profile = user.profile

    return {
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "full_name": user.full_name,
        "target_role": profile.target_role if profile else "Software Engineer",
        "experience_level": profile.experience_level if profile else "Mid-Level",
        "readiness_score": profile.readiness_score if profile else 82.5,
        "total_interviews": profile.total_interviews if profile else 4,
        "streak_days": profile.streak_days if profile else 3,
        "xp_points": profile.xp_points if profile else 340,
        "is_verified": user.is_verified
    }
