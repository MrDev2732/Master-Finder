from sqlalchemy.orm import Session

from backend.database.models import Posting


def get_all_postings(db: Session):
    return db.query(Posting).all()
