from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends

from backend.handlers.queries.worker import get_worker_by_email, get_all_workers
from backend.database.session import get_db


router = APIRouter()


@router.get("/worker", tags=["Workers"])
async def get_worker(email: str, db: Session = Depends(get_db)):
    worker = get_worker_by_email(email, db)
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
                worker_dict[key] = value.decode('utf-8', errors='replace')  # Decodifica bytes a string
        workers_serializable.append(worker_dict)
    return workers_serializable
