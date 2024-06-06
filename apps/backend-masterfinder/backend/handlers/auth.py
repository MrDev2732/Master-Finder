import hashlib
from os import getenv
from datetime import datetime, timedelta

from passlib.context import CryptContext
import jwt


SECRET_KEY = getenv("SECRET_KEY")
PWD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto")
TOKEN_SCOND_EXP = 60


def verify_password(plain_password, hashed_password):
    SALT = hashlib.sha256(SECRET_KEY.encode()).hexdigest()
    salted_password = plain_password + SALT
    return PWD_CONTEXT.verify(salted_password, hashed_password)


def create_token(data: dict):
    data_token = data.copy()
    data_token["exp"] = datetime.utcnow() + timedelta(seconds=TOKEN_SCOND_EXP)
    token_jwt = jwt.encode(data_token, key=SECRET_KEY, algorithm="HS256")
    return token_jwt


def hash_password(password: str) -> str:
    SALT = hashlib.sha256(SECRET_KEY.encode()).hexdigest()
    return PWD_CONTEXT.hash(password + SALT)
