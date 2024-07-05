import uuid

from sqlalchemy.orm import Session

from backend.database.models import Client


def get_client_by_email(email: str, db: Session):
    return db.query(Client).filter(Client.email == email).first()


def get_client_by_id(id: str, db: Session):
    return db.query(Client).filter(Client.id == id).first()


def get_all_clients(db: Session):
    return db.query(Client).all()


def update_client_by_id(id: str, db: Session, **kwargs):
    client = db.query(Client).filter(Client.id == id).first()
    if not client:
        return None

    for key, value in kwargs.items():
        if hasattr(client, key):
            setattr(client, key, value)

    db.commit()
    db.refresh(client)
    return client


def update_password_by_id(id: uuid.UUID, new_password: str, db: Session):
    client = db.query(Client).filter(Client.id == id).first()
    if not client:
        return None

    client.password = new_password
    db.commit()
    db.refresh(client)
    return client