from pydantic import BaseModel, ConfigDict
from datetime import datetime, timezone

class ReviewRequest(BaseModel):
    repo_path: str
    branch: str = "HEAD"
    max_diff_size: int = 10000

class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    repo_path: str
    branch: str
    diff: str
    review: str
    issues_found: int
    status: str
    created_at: datetime
    updated_at: datetime
