from os import getenv
from typing import Optional
import logging
import base64
import uuid
import jwt

from fastapi import APIRouter, HTTPException, Depends, Header, UploadFile, File, status, Form
from fastapi.encoders import jsonable_encoder
from sqlalchemy.orm import Session

from backend.handlers.queries.posting import get_all_postings
from backend.database.session import get_db
from backend.database.models import Posting
from sqlalchemy.orm import joinedload

SECRET_KEY = getenv("SECRET_KEY")

router = APIRouter()

logger = logging.getLogger(__name__)


@router.get("/all-postings", tags=["Posting"])
def get_postings(db: Session = Depends(get_db)):
    try:
        postings = get_all_postings(db)
        # Convertir los datos a un formato seguro
        safe_postings = []
        for posting in postings:
            safe_posting = {}
            posting_dict = vars(posting)
            for key, value in posting_dict.items():
                if isinstance(value, bytes):
                    safe_posting[key] = base64.b64encode(value).decode('utf-8')
                else:
                    safe_posting[key] = value
            safe_postings.append(safe_posting)
        return jsonable_encoder(safe_postings)
    except Exception as e:
        logger.error(f"Error fetching postings: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")

@router.get("/posting/{posting_id}", tags=["Posting"])
def get_posting_by_id(posting_id: str, db: Session = Depends(get_db)):
    try:
        # Convertir posting_id a UUID
        posting_uuid = uuid.UUID(posting_id)
        
        # Usar joinedload para incluir la relación worker
        posting = db.query(Posting).options(joinedload(Posting.worker)).filter(Posting.id == posting_uuid).first()
        
        if not posting:
            raise HTTPException(status_code=404, detail="Posting not found")
        
        # Preparar el diccionario de la respuesta
        posting_dict = {
            "id": str(posting.id),
            "job_type": posting.job_type,
            "description": posting.description,
            "image": None,  # Inicializar como None por defecto
            "worker": {
                "id": str(posting.worker.id),
                "first_name": posting.worker.first_name,
                "last_name": posting.worker.last_name,
                "email": posting.worker.email,
                "location": posting.worker.location,
                "contact_number": posting.worker.contact_number,
                "specialty": posting.worker.specialty,
                "ratings": posting.worker.ratings
                # Agrega aquí más campos de worker si los necesitas
            }
        }
        
        # Codificar la imagen en base64 si está presente
        if posting.image:
            posting_dict["image"] = base64.b64encode(posting.image).decode('utf-8')
        
        return posting_dict
    
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid UUID format")
    
    except Exception as e:
        logger.error(f"Error fetching posting by ID: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")


@router.post("/posting", tags=["Posting"])
async def create_posting(
    authorization: str = Header(...),
    job_type: str = Form(...),
    description: Optional[str] = Form(None),
    image: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        token = authorization.split(" ")[1]  # Extraer el token del encabezado
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

    try:
        logger.info(f"Creating posting for worker_id: {worker_id}, job_type: {job_type}, description: {description}")
        new_posting = Posting(
            worker_id=worker_id,
            job_type=job_type,
            description=description,
            image=image_data  # Almacenar los bytes de la imagen
        )
        db.add(new_posting)
        db.commit()
        db.refresh(new_posting)
        return {"message": "Posting creado exitosamente"}
    except Exception as e:
        logger.error(f"Error creating posting: {e}")
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )
