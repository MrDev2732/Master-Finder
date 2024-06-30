import re
import random
import hashlib
import smtplib
import logging
from os import getenv
from datetime import datetime, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.header import Header
from email.utils import formataddr

from passlib.context import CryptContext
from dotenv import load_dotenv
import jwt

# Configuración del logger
logging.basicConfig(level=logging.INFO,
                    format='%(levelname)s:     %(name)s - %(message)s')
logger = logging.getLogger(__name__)

load_dotenv()
CORREO = getenv("CORREO")
PASSWORD = getenv("PASSWORD")
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


def send_email(destinatario, codigo):
    # Configuración del servidor SMTP
    smtp_server = "smtp.gmail.com"
    smtp_port = 587  # Usando STARTTLS

    # Crear el objeto del mensaje
    msg = MIMEMultipart()
    msg["From"] = formataddr(
        (str(Header("Master Finder", "utf-8")), CORREO)
    )
    msg["To"] = destinatario
    msg["Subject"] = Header(
        f"Restablecimiento de contraseña",
        "utf-8",
    )

    # Cuerpo del correo en HTML
    cuerpo = f"""
<html>
<body>
<p>Estimado usuario,</p>
<p>Hemos recibido una solicitud para restablecer su contraseña. Si usted no solicitó este cambio, por favor ignore este correo.</p>
<p>Para restablecer su contraseña, ingrese el siguiente código en la aplicación:</p>
<p>{codigo}</p>
<p>Este código será válido por 30 minutos.</p>
<p>Saludos cordiales,</p>
<p>Equipo de Soporte</p>
</body>
</html>
"""
    msg.attach(MIMEText(cuerpo, "html"))

    # Enviar el correo usando STARTTLS
    with smtplib.SMTP(smtp_server, smtp_port) as server:
        server.starttls()  # Iniciar TLS
        server.login(CORREO, PASSWORD)
        server.sendmail(CORREO, destinatario, msg.as_string())


def generate_token():
    code = random.randint(100000, 999999)
    hashed_code = hash_password(str(code))
    data_token = {
        "code": hashed_code,
        "exp": datetime.utcnow() + timedelta(minutes=10)
    }
    token_jwt = jwt.encode(data_token, key=SECRET_KEY, algorithm="HS256")
    return token_jwt, code


def verify_token(token: str, code: int) -> bool:
    try:
        data = jwt.decode(token, key=SECRET_KEY, algorithms=["HS256"])

        return PWD_CONTEXT.verify(str(code) + hashlib.sha256(SECRET_KEY.encode()).hexdigest(), data.get('code'))
    except jwt.ExpiredSignatureError:
        return False
    except jwt.InvalidTokenError:
        return False
