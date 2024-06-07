import logging
from os import getenv

from fastapi import FastAPI, Request, Depends
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.templating import Jinja2Templates

from backend.database.models import Base, Worker
from backend.database.create_db import main as populate_db
from backend.services.endpoints.login import router as login_worker_router
from backend.database.session import get_db, engine, SessionLocal


jinja2_template = Jinja2Templates(directory="templates")

SECRET_KEY = getenv("SECRET_KEY")
TOKEN_SCOND_EXP = 60

logging.basicConfig(level=logging.INFO,
                    format='%(levelname)s:     %(name)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(
    title="API Master Finder",
    docs_url="/docs",
)

origins = [
    "http://localhost:8000",
    "http://localhost:4200"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

PREFIX = "/api"
WORKERS = f"{PREFIX}/workers"


# LOGIN WORKER
app.include_router(login_worker_router, prefix=f"{WORKERS}")


@app.on_event("startup")
def on_startup():
    # Crear todas las tablas
    Base.metadata.create_all(bind=engine)
    logger.info("Inicializando la base de datos...")
    with SessionLocal() as session:
        populate_db(session)
    logger.info("La base de datos ya está inicializada.")


@app.get("/", response_class=HTMLResponse)
def root(request: Request):
    return jinja2_template.TemplateResponse("index.html", {"request": request})


@app.get("/workers")
async def get_workers(db: Session = Depends(get_db)):
    workers = db.query(Worker).all()
    # Asegúrate de que todos los campos sean serializables
    workers_serializable = []
    for worker in workers:
        worker_dict = worker.__dict__.copy()
        for key, value in worker_dict.items():
            if isinstance(value, bytes):
                worker_dict[key] = value.decode('utf-8', errors='replace')  # Decodifica bytes a string
        workers_serializable.append(worker_dict)
    return workers_serializable
