from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
from contextlib import asynccontextmanager

from backend.api.database import get_db, Base, engine
from backend.api.models import Review
from backend.api.schemas import ReviewRequest, ReviewResponse
from backend.core import git_utils
from backend.core import agent

@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield

app = FastAPI(lifespan=lifespan)

@app.post("/api/review", response_model=ReviewResponse)
def create_review(req: ReviewRequest, db: Session = Depends(get_db)):
    if not req.repo_path.strip():
        raise HTTPException(status_code=400, detail="repo_path cannot be empty")

    try:
        diff_text = git_utils.get_diff(req.repo_path, max_lines=req.max_diff_size, base_ref=req.base_ref)
    except ValueError as e:
        if "exceeds" in str(e).lower():
            raise HTTPException(status_code=413, detail=str(e))
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except TimeoutError as e:
        raise HTTPException(status_code=504, detail=str(e))

    if not diff_text.strip():
        raise HTTPException(status_code=400, detail=f"No changes found between HEAD and {req.base_ref}")

    try:
        review_text = agent.review_code(diff_text)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))

    issues_found = agent.count_issues(review_text)

    db_review = Review(
        repo_path=req.repo_path,
        branch=req.base_ref,
        diff=diff_text,
        review=review_text,
        issues_found=issues_found,
        status="pending"
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)

    return db_review

@app.get("/api/reviews")
def get_reviews(db: Session = Depends(get_db)):
    reviews = db.query(Review).order_by(desc(Review.created_at)).all()
    return {"reviews": [ReviewResponse.model_validate(r) for r in reviews]}

@app.get("/api/reviews/{review_id}", response_model=ReviewResponse)
def get_review(review_id: str, db: Session = Depends(get_db)):
    db_review = db.query(Review).filter(Review.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")
    return db_review

@app.put("/api/reviews/{review_id}", response_model=ReviewResponse)
def update_review(review_id: str, status: str, db: Session = Depends(get_db)):
    valid_statuses = {"pending", "approved", "edited", "ignored"}
    if status not in valid_statuses:
        raise HTTPException(status_code=400, detail="Invalid status")

    db_review = db.query(Review).filter(Review.id == review_id).first()
    if not db_review:
        raise HTTPException(status_code=404, detail="Review not found")

    db_review.status = status
    db.commit()
    db.refresh(db_review)
    return db_review
