"""
Database Configuration
SQLAlchemy setup
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base
import os

# Use SQLite for development if DATABASE_URL not set, otherwise use PostgreSQL
# Force SQLite for development - comment out DATABASE_URL env var if you want to use PostgreSQL
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL or DATABASE_URL == "postgresql://user:pass@localhost:5432/ratedoctor":
    # Use SQLite for development
    DATABASE_URL = "sqlite:///./medrate.db"
    engine = create_engine(
        DATABASE_URL,
        connect_args={"check_same_thread": False, "timeout": 20},  # SQLite specific with timeout
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10
    )
else:
    # Use PostgreSQL for production
    engine = create_engine(
        DATABASE_URL,
        pool_pre_ping=True,
        pool_size=10,
        max_overflow=20,
        connect_args={"connect_timeout": 10}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Session:
    """Database dependency for FastAPI"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

