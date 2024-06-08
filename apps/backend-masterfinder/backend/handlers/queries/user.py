from sqlalchemy.orm import Session

from backend.database.models import Worker


def get_user(email: str, db: Session):
    return db.query(Worker).filter(Worker.email == email).first()
