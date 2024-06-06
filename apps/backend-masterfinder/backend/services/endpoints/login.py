from os import getenv

from typing import Annotated

from fastapi import APIRouter, Request, Form, HTTPException, Cookie, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import sessionmaker, Session
from fastapi.templating import Jinja2Templates
from sqlalchemy import create_engine
import jwt

from backend.handlers.queries.user import get_user
from backend.handlers.auth import create_token, verify_password

jinja2_template = Jinja2Templates(directory="templates")

router = APIRouter()

engine = create_engine("sqlite:///db.sqlite3")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

SECRET_KEY = getenv("SECRET_KEY")
TOKEN_SCOND_EXP = 60


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/dashboard", response_class=HTMLResponse)
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


@router.post("/login", tags=["Auth"])
def login(first_name: Annotated[str, Form()], password: Annotated[str, Form()], db: Session = Depends(get_db)):
    user_data = get_user(first_name, db)
    if user_data is None or not verify_password(password, user_data.password):
        raise HTTPException(
            status_code=401,
            detail="Username or password no authorization"
        )
    token = create_token({"first_name": user_data.first_name})
    return RedirectResponse(
        "/api/workers/dashboard",
        status_code=302,
        headers={"set-cookie": f"access_token={token}; Max-Age={TOKEN_SCOND_EXP}"}
    )


@router.post("/logout", tags=["Auth"])
def logout():
    return RedirectResponse(
        "/",
        status_code=302,
        headers={"set-cookie": "access_token=; Max-Age=0"}
    )
