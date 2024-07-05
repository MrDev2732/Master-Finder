import os
import logging
import uuid
from os import getenv
from typing import Annotated
import base64

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Header
from fastapi.encoders import jsonable_encoder
from pydantic import EmailStr, constr
from sqlalchemy.orm import Session
import jwt

from backend.handlers.auth import hash_password, validate_password, validate_rut
from backend.database.create_db import compress_image
from backend.database.session import get_db
from backend.database.models import Client
from backend.handlers.queries.client import (
    get_all_clients, get_client_by_email, get_client_by_id
)


logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.ERROR)

SECRET_KEY = getenv("SECRET_KEY")

router = APIRouter()


@router.get("/all-clients", tags=["Clients"])
async def get_clients(db: Session = Depends(get_db)):
    clients = get_all_clients(db)
    # Asegúrate de que todos los campos sean serializables
    clients_serializable = []
    for client in clients:
        client_dict = client.__dict__.copy()
        for key, value in client_dict.items():
            if isinstance(value, bytes):
                client_dict[key] = value.decode('utf-8', errors='replace')
        clients_serializable.append(client_dict)
    return clients_serializable


@router.post("/client", tags=["Clients"])
async def create_client(
    name: constr(min_length=1, max_length=150),
    email: EmailStr,
    password: constr(min_length=8),
    db: Session = Depends(get_db)
):
    # Validar la contraseña
    if not validate_password(password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password"
        )

    # Verificar si el cliente ya existe por correo electrónico
    existing_client = get_client_by_email(email, db)

    if existing_client:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Client with this email already exists"
        )

    new_client = Client(
        name=name,
        email=email,
        password=hash_password(password)
    )

    try:
        db.add(new_client)
        db.commit()
        db.refresh(new_client)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

    return {"message": "Cliente creado exitosamente"}


@router.get("/client", tags=["Clients"])
async def get_client(authorization: str = Header(...), db: Session = Depends(get_db)):
    try:
        token = authorization.split(" ")[1]  # Extrae el token del encabezado 'Bearer <token>'
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        id_str = payload.get("id")
        if id_str is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token does not contain id"
            )
        client_id = uuid.UUID(id_str)  # Convertir la cadena de id a un objeto UUID
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid UUID format"
        )

    client = get_client_by_id(client_id, db)
    if client is None:
        return {"error": "Client not found"}

    client_dict = client.__dict__.copy()
    for key, value in client_dict.items():
        if isinstance(value, bytes):
            client_dict[key] = base64.b64encode(value).decode('utf-8')  # Codifica bytes a base64

    return jsonable_encoder(client_dict)


