import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from app.core.config import settings

logger = logging.getLogger("db_session")

def create_db_engine():
    db_url = settings.DATABASE_URL
    try:
        if db_url.startswith("sqlite"):
            engine = create_engine(
                db_url,
                connect_args={"check_same_thread": False},
                pool_pre_ping=True
            )
            logger.info("Initialized SQLite database engine.")
            return engine
        else:
            engine = create_engine(
                db_url,
                pool_size=10,
                max_overflow=20,
                pool_recycle=3600,
                pool_pre_ping=True
            )
            # Test connection
            with engine.connect() as conn:
                logger.info("Successfully connected to MySQL database engine!")
            return engine
    except Exception as e:
        logger.warning(f"Unable to connect to MySQL database using current credentials ({e}).")
        logger.info("Falling back to local SQLite engine (interview_app.db) so the platform remains 100% operational.")
        fallback_url = "sqlite:///./interview_app.db"
        return create_engine(
            fallback_url,
            connect_args={"check_same_thread": False},
            pool_pre_ping=True
        )

engine = create_db_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
