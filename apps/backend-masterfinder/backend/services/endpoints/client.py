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
    get_all_clients
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
