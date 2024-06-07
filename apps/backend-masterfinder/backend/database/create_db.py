import os
import io

from faker import Faker
from sqlalchemy.orm import Session
from sqlalchemy import LargeBinary
from PIL import Image

from backend.database.models import Worker, Client, Posting, Rating, Comment, Transaction
from backend.handlers.auth import hash_password


# Create a new Faker instance
fake = Faker()

def read_image_as_binary(image_path):
    with Image.open(image_path) as img:
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG')
        return img_byte_arr.getvalue()

# Path to your image
image_path = os.path.join(os.path.dirname(__file__), 'img', 'EPICO.jpg')
print("Absolute path to image:", os.path.abspath(image_path))
image_binary = read_image_as_binary(image_path)


def populate_workers(session: Session, n=10):
    for _ in range(n):
        worker = Worker(
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            rut=fake.unique.ssn(),
            contact_number=fake.phone_number(),
            email=fake.unique.email(),
            subscription=fake.boolean(),
            profile_description=fake.text(),
            password=hash_password('falopa'),
            image=image_binary
        )
        session.add(worker)
    session.commit()


def populate_clients(session: Session, n=10):
    for _ in range(n):
        client = Client(
            name=fake.name(),
            email=fake.unique.email(),
            password=hash_password(fake.password())
        )
        session.add(client)
    session.commit()


def populate_postings(session: Session, n=10):
    workers = session.query(Worker).all()
    for _ in range(n):
        posting = Posting(
            worker_id=fake.random_element(workers).id,
            job_type=fake.job(),
            description=fake.text(),
            image=image_binary
        )
        session.add(posting)
    session.commit()


def populate_ratings(session: Session, n=10):
    workers = session.query(Worker).all()
    clients = session.query(Client).all()
    for _ in range(n):
        rating = Rating(
            worker_id=fake.random_element(workers).id,
            client_id=fake.random_element(clients).id,
            rating=fake.random_int(min=1, max=5)
        )
        session.add(rating)
    session.commit()


def populate_comments(session: Session, n=10):
    clients = session.query(Client).all()
    workers = session.query(Worker).all()
    for _ in range(n):
        comment = Comment(
            client_id=fake.random_element(clients).id,
            worker_id=fake.random_element(workers).id,
            content=fake.text()
        )
        session.add(comment)
    session.commit()


def populate_transactions(session: Session, n=10):
    for _ in range(n):
        transaction = Transaction(
            amount=fake.random_number(digits=5),
            currency=fake.currency_code(),
            payer_id=fake.uuid4(),
            transaction_id=fake.unique.uuid4(),
            payment_status=fake.random_element(['Completed', 'Pending', 'Failed']),
            payment_method=fake.random_element(['PayPal', 'Credit Card', 'Bank Transfer']),
            description=fake.text()
        )
        session.add(transaction)
    session.commit()


def main(session: Session):
    populate_workers(session)
    populate_clients(session)
    populate_postings(session)
    populate_ratings(session)
    populate_comments(session)
    populate_transactions(session)
