import uuid

from sqlalchemy.orm import Session

from backend.database.models import Worker, Posting


def get_worker_by_email(email: str, db: Session):
    return db.query(Worker).filter(Worker.email == email).first()


def get_worker_by_id(id: str, db: Session):
    return db.query(Worker).filter(Worker.id == id).first()


def get_all_workers(db: Session):
    return db.query(Worker).all()


def get_subscribed_workers(db: Session):
    return db.query(Worker).filter(Worker.subscription == True).all()


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


def update_reset_pass_token_by_email(email: str, reset_pass_token: str, db: Session):
    worker = db.query(Worker).filter(Worker.email == email).first()
    if not worker:
        return None

    worker.reset_pass_token = reset_pass_token
    db.commit()
    db.refresh(worker)
    return worker


def update_password_by_id(id: uuid.UUID, new_password: str, db: Session):
    worker = db.query(Worker).filter(Worker.id == id).first()
    if not worker:
        return None
    if not worker.reset_pass_verified:
        return False
    worker.password = new_password
    worker.reset_pass_verified = False
    db.commit()
    db.refresh(worker)
    return worker


def update_verify_by_id(id: uuid.UUID, db: Session):
    worker = db.query(Worker).filter(Worker.id == id).first()
    if not worker:
        return None

    worker.reset_pass_verified = True
    db.commit()
    db.refresh(worker)
    return worker


def get_postings_by_subscribed_workers(db: Session):
    return db.query(Posting).join(Posting.worker).filter(Worker.subscription == True).all()
