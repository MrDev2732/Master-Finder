import datetime
import json
import uuid

from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Float, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.inspection import inspect


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
    contact_number = Column(String(20), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    subscription = Column(Boolean, default=False)
    profile_description = Column(Text, nullable=True)
    
    postings = relationship('Posting', back_populates='worker')
    ratings = relationship('Rating', back_populates='worker')


class Client(Base, BaseModel):
    __tablename__ = 'client'
    
    name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, nullable=False)
    
    ratings = relationship('Rating', back_populates='client')
    comments = relationship('Comment', back_populates='client')


class Posting(Base, BaseModel):
    __tablename__ = 'posting'
    
    worker_id = Column(UUID(as_uuid=True), ForeignKey('worker.id'), nullable=False)
    job_type = Column(String(150), nullable=False)
    description = Column(Text, nullable=True)
    
    worker = relationship('Worker', back_populates='postings')


class Rating(Base, BaseModel):
    __tablename__ = 'rating'
    
    worker_id = Column(UUID(as_uuid=True), ForeignKey('worker.id'), nullable=False)
    client_id = Column(UUID(as_uuid=True), ForeignKey('client.id'), nullable=False)
    rating = Column(Integer, nullable=False)
    comment_id = Column(UUID(as_uuid=True), ForeignKey('comment.id'), nullable=True)
    
    worker = relationship('Worker', back_populates='ratings')
    client = relationship('Client', back_populates='ratings')
    comment = relationship('Comment', back_populates='rating')


class Comment(Base, BaseModel):
    __tablename__ = 'comment'
    
    client_id = Column(UUID(as_uuid=True), ForeignKey('client.id'), nullable=False)
    worker_id = Column(UUID(as_uuid=True), ForeignKey('worker.id'), nullable=False)
    content = Column(Text, nullable=False)
    
    client = relationship('Client', back_populates='comments')
    rating = relationship('Rating', uselist=False, back_populates='comment')


class Transaction(Base, BaseModel):
    __tablename__ = 'transaction'
    
    amount = Column(Float, nullable=False)
    currency = Column(String(10), nullable=False)
    payer_id = Column(String(150), nullable=False)
    transaction_id = Column(String(150), unique=True, nullable=False)
    payment_status = Column(String(50), nullable=False)
    payment_method = Column(String(50), default='PayPal')
    description = Column(String(500), nullable=True)
