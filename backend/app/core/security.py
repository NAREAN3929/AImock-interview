from datetime import datetime, timedelta
from typing import Optional, Any
from jose import jwt
import bcrypt
from app.core.config import settings

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # Check native bcrypt hash
        if hashed_password.startswith("$2b$") or hashed_password.startswith("$2a$") or hashed_password.startswith("$2y$"):
            return bcrypt.checkpw(
                plain_password.encode("utf-8")[:72],
                hashed_password.encode("utf-8")
            )
        # Direct string equality fallback for legacy demo fixtures
        return plain_password == hashed_password
    except Exception:
        return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    # Direct native bcrypt hash truncated to 72 bytes max as per BCrypt RFC specification
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def create_access_token(subject: str | Any, expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
