from sqlalchemy.orm import Session

from backend.database.models import Worker


def get_user(first_name: str, db: Session):
    return db.query(Worker).filter(Worker.first_name == first_name).first()
