import logging
from os import getenv

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError, SQLAlchemyError
from sqlalchemy import inspect

from backend.database.models import Base
from backend.database.session import engine, SessionLocal
from backend.database.create_db import main as populate_db
from backend.services.endpoints.login import router as login_worker_router
from backend.services.endpoints.posting import router as posting_router
from backend.services.endpoints.workers import router as worker_router
from backend.services.endpoints.client import router as client_router

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
LOGIN = f"{PREFIX}/login"
POSTINGS = f"{PREFIX}/postings"
WORKERS = f"{PREFIX}/workers"
CLIENTS = f"{PREFIX}/clients"

# LOGIN WORKER
app.include_router(login_worker_router, prefix=f"{LOGIN}")

# POSTINGS
app.include_router(posting_router, prefix=f"{POSTINGS}")

# WORKERS
app.include_router(worker_router, prefix=f"{WORKERS}")

# CLIENTS
app.include_router(client_router, prefix=f"{CLIENTS}")


@app.on_event("startup")
def on_startup():
    try:
        # Verificar si la tabla 'worker' existe
        inspector = inspect(engine)
        if inspector.has_table("worker"):
            logger.info("La base de datos ya existe. No se necesita inicializar.")
        else:
            raise Exception("La base de datos no tiene las tablas necesarias.")
    except (OperationalError, SQLAlchemyError, Exception) as e:
        logger.warning(f"Error al verificar la base de datos: {e}. Inicializando la base de datos...")
        # Crear todas las tablas si la base de datos no existe
        Base.metadata.create_all(bind=engine)
        logger.info("Inicializando la base de datos...")
        with SessionLocal() as session:
            populate_db(session)
        logger.info("La base de datos ya está inicializada.")
