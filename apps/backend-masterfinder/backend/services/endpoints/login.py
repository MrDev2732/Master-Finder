from os import getenv
from typing import Annotated

from fastapi import APIRouter, Request, Form, HTTPException, Cookie, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session
import jwt
import logging

from backend.handlers.queries.user import get_user
from backend.handlers.auth import create_token, verify_password
from backend.database.session import get_db


router = APIRouter()

SECRET_KEY = getenv("SECRET_KEY")
TOKEN_SCOND_EXP = 60

logger = logging.getLogger(__name__)


@router.get("/dashboard", response_class=HTMLResponse)
def dashboard(request: Request, db: Session = Depends(get_db), access_token: Annotated[str | None, Cookie()] = None):
    if access_token is None:
        return RedirectResponse("/", status_code=302)
    try:
        data_user = jwt.decode(access_token, key=SECRET_KEY, algorithms=["HS256"])
        if get_user(data_user["first_name"], db) is None:
            return RedirectResponse("/", status_code=302)
        logger.info("User accessed the dashboard successfully")
        return HTMLResponse(content="Dashboard access confirmed", status_code=200)
    except jwt.ExpiredSignatureError:
        logger.error("Token has expired")
        return RedirectResponse("/", status_code=302)
    except jwt.InvalidTokenError:
        logger.error("Invalid token")
        return RedirectResponse("/", status_code=302)
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return RedirectResponse("/", status_code=302)


@router.post("/login", tags=["Auth"])
def login(first_name: Annotated[str, Form()], password: Annotated[str, Form()], db: Session = Depends(get_db)):
    try:
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
    except HTTPException as e:
        logger.error(f"HTTP error: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


@router.post("/logout", tags=["Auth"])
def logout():
    return RedirectResponse(
        "/",
        status_code=302,
        headers={"set-cookie": "access_token=; Max-Age=0"}
    )
