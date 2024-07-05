import datetime
import json
import uuid

from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.inspection import inspect
from sqlalchemy.orm import relationship
from sqlalchemy import (
    Column, Integer, 
    String, DateTime, 
    Boolean, ForeignKey, 
    Float, LargeBinary
    )


Base = declarative_base()


class BaseModel:
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    enabled = Column(Boolean, default=True)
    created_date = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    modified_date = Column(DateTime, nullable=False, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    def to_dict(self) -> dict:
        return {
            c.key: (
                getattr(self, c.key).isoformat()
                if isinstance(getattr(self, c.key), datetime.datetime)
                else (
                    str(getattr(self, c.key))
                    if isinstance(getattr(self, c.key), uuid.UUID)
                    else getattr(self, c.key)
                )
            )
            for c in inspect(self).mapper.column_attrs
        }

    def to_json(self) -> str:
        return json.dumps(self.to_dict(), default=str, indent=4, sort_keys=True)


class Worker(Base, BaseModel):
    __tablename__ = 'worker'

    first_name = Column(String(150), nullable=False)
    last_name = Column(String(150), nullable=False)
    rut = Column(String(20), unique=True, nullable=False)
    contact_number = Column(String(20), unique=True, nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    subscription = Column(Boolean, default=False)
    profile_description = Column(String, nullable=True)
    password = Column(String(256), nullable=False)
    image = Column(LargeBinary, nullable=True)
    specialty = Column(String(150), nullable=False)
    location = Column(String(50), nullable=False)
    reset_pass_token = Column(String(256), nullable=True)
    reset_pass_verified = Column(Boolean, default=False)

    postings = relationship('Posting', back_populates='worker')
    ratings = relationship('Rating', back_populates='worker')


class Client(Base, BaseModel):
    __tablename__ = 'client'

    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    password = Column(String(256), nullable=False)
    image = Column(LargeBinary, nullable=True)

    ratings = relationship('Rating', back_populates='client')


class Posting(Base, BaseModel):
    __tablename__ = 'posting'

    worker_id = Column(UUID(as_uuid=True), ForeignKey('worker.id'), nullable=False)
    job_type = Column(String(150), nullable=False)
    description = Column(String(300), nullable=True)
    image = Column(LargeBinary, nullable=False)

    worker = relationship('Worker', back_populates='postings')


class Rating(Base, BaseModel):
    __tablename__ = 'rating'

    worker_id = Column(UUID(as_uuid=True), ForeignKey('worker.id'), nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey('client.id'), nullable=False)
    rating = Column(Integer, nullable=False)
    content = Column(String, nullable=False)  # Campo de contenido del comentario

    worker = relationship('Worker', back_populates='ratings')
    client = relationship('Client', back_populates='ratings')

    def to_dict(self) -> dict:
        data = super().to_dict()
        data['content'] = self.content  # Añadir contenido del comentario al diccionario
        return data


class Transaction(Base, BaseModel):
    __tablename__ = 'transaction'

    amount = Column(Float, nullable=False)
    currency = Column(String(10), nullable=False)
    payer_id = Column(String(150), nullable=False)
    transaction_id = Column(String(150), unique=True, nullable=False)
    payment_status = Column(String(50), nullable=False)
    payment_method = Column(String(50), default='PayPal')
    description = Column(String(500), nullable=True)
