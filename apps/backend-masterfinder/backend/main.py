import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

from backend.database.models import Base, Worker
from backend.database.create_db import main as populate_db


logging.basicConfig(level=logging.INFO,
                    format='%(levelname)s:     %(name)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(
    title="API Master Finder",
    docs_url="/api/docs",
)

origins = [
    "http://localhost:4200"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = create_engine("sqlite:///db.sqlite3")
Session = sessionmaker(bind=engine)


@app.on_event("startup")
def on_startup():
    with Session() as session:
        try:
            session.query(Worker).first()
            logger.info("La base de datos ya está inicializada.")
        except Exception as e:
            Base.metadata.create_all(engine)
            logger.info("Inicializando la base de datos...")
            populate_db(session)


@app.get("/test")
async def test():
    return {"detail": "Hello World"}


@app.get("/workers")
async def get_workers():
    with Session() as session:
        workers = session.query(Worker).all()
        return workers
