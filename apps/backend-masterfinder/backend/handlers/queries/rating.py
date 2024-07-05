import uuid

from sqlalchemy.orm import Session

from backend.database.models import Rating


def create_rating(worker_id: str, client_id: str, rating: int, content: str, db: Session):
    try:
        new_rating = Rating(
            worker_id=uuid.UUID(worker_id),
            client_id=uuid.UUID(client_id),
            rating=rating,
            content=content
        )
        db.add(new_rating)
        db.commit()
        db.refresh(new_rating)
        return new_rating
    except Exception as e:
        db.rollback()
        raise e
