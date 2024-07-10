import uuid
import base64

from sqlalchemy.orm import Session
from sqlalchemy.orm import joinedload

from backend.database.models import Posting, Worker


def get_all_postings(db: Session):
    return db.query(
        Posting,
        Worker.location
    ).join(
        Worker, Posting.worker_id == Worker.id
    ).all()


def update_posting_by_id(posting_id: str, job_type: str = None, description: str = None, image: str = None, db: Session = None):
    try:
        posting_uuid = uuid.UUID(posting_id)
        posting = db.query(Posting).filter(Posting.id == posting_uuid).first()

        if not posting:
            return None

        if job_type is not None:
            posting.job_type = job_type
        if description is not None:
            posting.description = description
        if image is not None:
            posting.image = base64.b64decode(image)

        db.commit()
        db.refresh(posting)
        return posting
    except ValueError:
        return None
    except Exception as e:
        db.rollback()
        raise e
