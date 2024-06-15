from sqlalchemy.orm import Session

from backend.database.models import Worker


def get_worker_by_email(email: str, db: Session):
    return db.query(Worker).filter(Worker.email == email).first()


def get_worker_by_id(id: str, db: Session):
    return db.query(Worker).filter(Worker.id == id).first()


def get_all_workers(db: Session):
    return db.query(Worker).all()


def get_worker_for_create(email: str, rut: str, db: Session) -> Worker:
    return db.query(Worker).filter((Worker.email == email) | (Worker.rut == rut)).first()


def update_worker_by_id(id: str, db: Session, **kwargs):
    worker = db.query(Worker).filter(Worker.id == id).first()
    if not worker:
        return None

    for key, value in kwargs.items():
        if hasattr(worker, key):
            setattr(worker, key, value)

    db.commit()
    db.refresh(worker)
    return worker
