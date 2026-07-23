import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Text, Integer, DateTime
from argus.api.database import Base

def _utcnow():
    return datetime.now(timezone.utc)

class Review(Base):
    __tablename__ = "reviews"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    repo_path = Column(String, nullable=False)
    branch = Column(String, nullable=False)
    diff = Column(Text, nullable=False)
    review = Column(Text, nullable=False)
    issues_found = Column(Integer, default=0)
    status = Column(String, default="pending")
    created_at = Column(DateTime(timezone=True), default=_utcnow)
    updated_at = Column(DateTime(timezone=True), default=_utcnow, onupdate=_utcnow)
