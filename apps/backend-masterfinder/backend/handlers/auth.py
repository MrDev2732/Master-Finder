import re
import hashlib
from os import getenv
from datetime import datetime, timedelta

from passlib.context import CryptContext
import jwt


SECRET_KEY = getenv("SECRET_KEY")
PWD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto")
DAYS_TO_EXPIRE = 30


def verify_password(plain_password, hashed_password):
    SALT = hashlib.sha256(SECRET_KEY.encode()).hexdigest()
    salted_password = plain_password + SALT
    return PWD_CONTEXT.verify(salted_password, hashed_password)


def create_token(data: dict):
    data_token = data.copy()
    data_token["exp"] = datetime.utcnow() + timedelta(days=DAYS_TO_EXPIRE)
    token_jwt = jwt.encode(data_token, key=SECRET_KEY, algorithm="HS256")
    return token_jwt


def hash_password(password: str) -> str:
    SALT = hashlib.sha256(SECRET_KEY.encode()).hexdigest()
    return PWD_CONTEXT.hash(password + SALT)


def validate_rut(rut: str) -> bool:
    rut = rut.replace(".", "").replace("-", "")
    if not re.match(r"^\d{7,8}[0-9kK]$", rut):
        return False

    body, dv = rut[:-1], rut[-1].upper()
    
    value = 11 - sum([ int(a) * int(b) for a,b in zip(str(body).zfill(8), '32765432')]) % 11

    return {10: 'K', 11: '0'}.get(value, str(value)) == dv


def validate_password(password: str) -> bool:
    password_regex = r"(?=.*[A-Z]+)(?=.*[a-z]+)(?=.*[0-9]+)(?=.*[!¡?¿@#$%&*+/=.,;:_-]).{8,}"
    if re.search(password_regex, password):
        return True
    else:
        return False