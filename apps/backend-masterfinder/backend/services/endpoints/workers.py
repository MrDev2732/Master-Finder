import os
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
from backend.database.models import Worker
from backend.handlers.queries.worker import (
    get_worker_by_id, get_subscribed_workers, get_worker_for_create, update_worker_by_id, get_all_workers, update_password_by_id
)


SECRET_KEY = getenv("SECRET_KEY")

router = APIRouter()


@router.get("/worker", tags=["Workers"])
async def get_worker(authorization: str = Header(...), db: Session = Depends(get_db)):
    try:
        token = authorization.split(" ")[1]  # Extrae el token del encabezado 'Bearer <token>'
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        id_str = payload.get("id")
        if id_str is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Token does not contain id"
            )
        worker_id = uuid.UUID(id_str)  # Convertir la cadena de id a un objeto UUID
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

    worker = get_worker_by_id(worker_id, db)
    if worker is None:
        return {"error": "Worker not found"}

    worker_dict = worker.__dict__.copy()
    for key, value in worker_dict.items():
        if isinstance(value, bytes):
            worker_dict[key] = base64.b64encode(value).decode('utf-8')  # Codifica bytes a base64

    return jsonable_encoder(worker_dict)

@router.get("/worker/{id}", tags=["Workers"])
async def get_worker_by_id_endpoint(id: uuid.UUID, db: Session = Depends(get_db)):
    worker = get_worker_by_id(id, db)
    if worker is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker not found"
        )

    worker_dict = worker.__dict__.copy()
    for key, value in worker_dict.items():
        if isinstance(value, bytes):
            worker_dict[key] = base64.b64encode(value).decode('utf-8')  # Codifica bytes a base64

    return jsonable_encoder(worker_dict)


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


@router.get("/subscribed-workers", tags=["Workers"])
async def get_workers_subscribed(db: Session = Depends(get_db)):
    workers = get_subscribed_workers(db)
    # Asegúrate de que todos los campos sean serializables
    workers_serializable = []
    for worker in workers:
        worker_dict = worker.__dict__.copy()
        for key, value in worker_dict.items():
            if isinstance(value, bytes):
                worker_dict[key] = base64.b64encode(value).decode('utf-8')
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

    with open(os.path.join(os.path.dirname(__file__), 'img', 'unknown.jpg'), 'rb') as f:
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


@router.put("/worker", tags=["Workers"])
async def update_worker(
    access_token: Annotated[str, Header()],
    first_name: constr(min_length=1, max_length=50) = None,
    last_name: constr(min_length=1, max_length=50) = None,
    rut: constr(min_length=1, max_length=12) = None,
    contact_number: constr(min_length=7, max_length=15) = None,
    email: EmailStr = None,
    password: constr(min_length=8) = None,
    image: UploadFile = File(None),
    specialty: constr(max_length=150) = None,
    location: constr(max_length=150) = None,
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=["HS256"])
        id_str = payload.get("id")
        if id_str is None:
            raise HTTPException(
                status_code=400,
                detail="Token does not contain id"
            )
        worker_id = uuid.UUID(id_str)  # Convertir la cadena de id a un objeto UUID
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=401,
            detail="Token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=401,
            detail="Invalid token"
        )
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid UUID format"
        )

    update_data = {}

    if first_name is not None:
        update_data["first_name"] = first_name
    if last_name is not None:
        update_data["last_name"] = last_name
    if rut is not None:
        if not validate_rut(rut):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid RUT"
            )
        update_data["rut"] = rut
    if contact_number is not None:
        update_data["contact_number"] = contact_number
    if email is not None:
        update_data["email"] = email
    if password is not None:
        if not validate_password(password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid password"
            )
        update_data["password"] = hash_password(password)
    if image is not None:
        if image.content_type not in ["image/jpeg", "image/png"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid image format"
            )
        image_data = await image.read()
        if len(image_data) > 2 * 1024 * 1024:  # Limitar a 2MB
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Image size exceeds 2MB"
            )
        update_data["image"] = compress_image(image_data)
    if specialty is not None:
        update_data["specialty"] = specialty
    if location is not None:
        update_data["location"] = location

    updated_worker = update_worker_by_id(worker_id, db, **update_data)
    if updated_worker is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Worker not found"
        )

    worker_dict = updated_worker.__dict__.copy()
    for key, value in worker_dict.items():
        if isinstance(value, bytes):
            worker_dict[key] = value.decode('utf-8', errors='replace')  # Decodifica bytes a string

    return worker_dict


@router.put("/password-worker", tags=["Workers"])
async def update_password(
    id: str,
    new_password: constr(min_length=8),
    db: Session = Depends(get_db)
):
    try:
        id = uuid.UUID(id)  # Convertir id de str a uuid.UUID
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid UUID format"
        )
    
    try:
        # Validar la nueva contraseña
        if not validate_password(new_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid password"
            )

        # Actualizar la contraseña en la base de datos
        hashed_password = hash_password(new_password)
        updated_worker = update_password_by_id(id, hashed_password, db)

        if updated_worker is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Worker not found"
            )

        if updated_worker is False:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Password change not verified"
            )

        return {"message": "Password updated successfully"}

    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
