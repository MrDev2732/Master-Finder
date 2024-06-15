import os
import uuid
from os import getenv
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile, Cookie
from pydantic import EmailStr, constr
from sqlalchemy.orm import Session
import jwt

from backend.handlers.auth import hash_password, validate_password, validate_rut
from backend.database.create_db import compress_image
from backend.database.session import get_db
from backend.database.models import Worker
from backend.handlers.queries.worker import (
    get_worker_by_id, get_all_workers, get_worker_for_create
)

SECRET_KEY = getenv("SECRET_KEY")

router = APIRouter()


@router.get("/worker", tags=["Workers"])
async def get_worker(id: Annotated[str, Cookie()], db: Session = Depends(get_db)):
    worker = get_worker_by_id(id, db)
    if worker is None:
        return {"error": "Worker not found"}

    worker_dict = worker.__dict__.copy()
    for key, value in worker_dict.items():
        if isinstance(value, bytes):
            worker_dict[key] = value.decode('utf-8', errors='replace')  # Decodifica bytes a string

    return worker_dict


@router.get("/all-workers", tags=["Workers"])
async def get_workers(db: Session = Depends(get_db)):
    workers = get_all_workers(db)
    # Asegúrate de que todos los campos sean serializables
    workers_serializable = []
    for worker in workers:
        worker_dict = worker.__dict__.copy()
        for key, value in worker_dict.items():
            if isinstance(value, bytes):
                worker_dict[key] = value.decode('utf-8', errors='replace')
        workers_serializable.append(worker_dict)
    return workers_serializable


@router.post("/worker", tags=["Workers"])
async def create_worker(
    first_name: constr(min_length=1, max_length=50),
    last_name: constr(min_length=1, max_length=50),
    rut: constr(min_length=1, max_length=12),
    contact_number: constr(min_length=7, max_length=15),
    email: EmailStr,
    password: constr(min_length=8),
    specialty: constr(max_length=150),
    location: constr(max_length=150),
    db: Session = Depends(get_db)
):
    # Validar el RUT
    if not validate_rut(rut):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid RUT"
        )

    # Validar la contraseña
    if not validate_password(password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid password"
        )

    # Verificar si el trabajador ya existe por correo electrónico o RUT
    existing_worker = get_worker_for_create(email, rut, db)
    
    if existing_worker:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Worker with this email or RUT already exists"
        )

    with open(os.path.join(os.path.dirname(__file__), 'img', 'EPICO.jpg'), 'rb') as f:
        image_binary = f.read()

    new_worker = Worker(
        first_name=first_name,
        last_name=last_name,
        rut=rut,
        contact_number=contact_number,
        email=email,
        subscription=False,
        password=hash_password(password),
        image=image_binary,
        specialty=specialty,
        location=location
    )

    try:
        db.add(new_worker)
        db.commit()
        db.refresh(new_worker)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )

    return {"message": "Usuario creado exitosamente"}
