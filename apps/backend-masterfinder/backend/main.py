import logging
import hashlib
from os import getenv
from typing import Annotated
from datetime import datetime, timedelta

from fastapi import FastAPI, Request, Form, HTTPException, Cookie, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import sessionmaker, Session
from fastapi.templating import Jinja2Templates
from passlib.context import CryptContext
from sqlalchemy import create_engine
import jwt

from backend.database.models import Base, Worker
from backend.database.create_db import main as populate_db


jinja2_template = Jinja2Templates(directory="templates")

SECRET_KEY = getenv("SECRET_KEY")
PWD_CONTEXT = CryptContext(schemes=["bcrypt"], deprecated="auto")
TOKEN_SCOND_EXP = 60

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
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@app.on_event("startup")
def on_startup():
    with SessionLocal() as session:
        try:
            session.query(Worker).first()
            logger.info("La base de datos ya está inicializada.")
        except Exception as e:
            Base.metadata.create_all(bind=engine)
            logger.info("Inicializando la base de datos...")
            populate_db(session)

@app.get("/test")
async def test():
    return {"detail": "Hello World"}


def get_user(first_name: str, db: Session):
    return db.query(Worker).filter(Worker.first_name == first_name).first()


def verify_password(plain_password, hashed_password):
    SALT = hashlib.sha256(SECRET_KEY.encode()).hexdigest()
    salted_password = plain_password + SALT
    return PWD_CONTEXT.verify(salted_password, hashed_password)


def create_token(data: dict):
    data_token = data.copy()
    data_token["exp"] = datetime.utcnow() + timedelta(seconds=TOKEN_SCOND_EXP)
    token_jwt = jwt.encode(data_token, key=SECRET_KEY, algorithm="HS256")
    return token_jwt


@app.get("/", response_class=HTMLResponse)
def root(request: Request):
    return jinja2_template.TemplateResponse("index.html", {"request": request})


@app.get("/workers/dashboard", response_class=HTMLResponse)
def dashboard(request: Request, db: Session = Depends(get_db), access_token: Annotated[str | None, Cookie()] = None):
    if access_token is None:
        return RedirectResponse("/", status_code=302)
    try:
        data_user = jwt.decode(access_token, key=SECRET_KEY, algorithms=["HS256"])
        if get_user(data_user["first_name"], db) is None:
            return RedirectResponse("/", status_code=302)
        return jinja2_template.TemplateResponse("dashboard.html", {"request": request})
    except jwt.ExpiredSignatureError:
        return RedirectResponse("/", status_code=302)
    except jwt.InvalidTokenError:
        return RedirectResponse("/", status_code=302)


@app.post("/workers/login")
def login(first_name: Annotated[str, Form()], password: Annotated[str, Form()], db: Session = Depends(get_db)):
    user_data = get_user(first_name, db)
    if user_data is None or not verify_password(password, user_data.password):
        raise HTTPException(
            status_code=401,
            detail="Username or password no authorization"
        )
    token = create_token({"first_name": user_data.first_name})
    return RedirectResponse(
        "/workers/dashboard",
        status_code=302,
        headers={"set-cookie": f"access_token={token}; Max-Age={TOKEN_SCOND_EXP}"}
    )


@app.post("/workers/logout")
def logout():
    return RedirectResponse(
        "/",
        status_code=302,
        headers={"set-cookie": "access_token=; Max-Age=0"}
    )


@app.get("/workers")
async def get_workers(db: Session = Depends(get_db)):
    workers = db.query(Worker).all()
    return workers
