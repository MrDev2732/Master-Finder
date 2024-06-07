

from fastapi import APIRouter
from sqlalchemy.orm import Session

from backend.handlers.queries.user import get_user


router = APIRouter()


@router.get("/worker")
async def get_worker(db: Session = Depends(get_db)):
    workers = get_user()
    # Asegúrate de que todos los campos sean serializables
    workers_serializable = []
    for worker in workers:
        worker_dict = worker.__dict__.copy()
        for key, value in worker_dict.items():
            if isinstance(value, bytes):
                worker_dict[key] = value.decode('utf-8', errors='replace')  # Decodifica bytes a string
        workers_serializable.append(worker_dict)
    return workers_serializable
