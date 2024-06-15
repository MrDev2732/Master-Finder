import logging
from os import getenv
from typing import Annotated

from fastapi import APIRouter, Request, Form, HTTPException, Cookie, Depends
from fastapi.responses import HTMLResponse, RedirectResponse
from sqlalchemy.orm import Session
import jwt

from backend.handlers.queries.worker import get_worker_by_email
from backend.handlers.auth import create_token, verify_password
from backend.database.session import get_db


router = APIRouter()

SECRET_KEY = getenv("SECRET_KEY")
TOKEN_SCOND_EXP = 60

logger = logging.getLogger(__name__)


@router.post("/login", tags=["Auth"])
def login(email: Annotated[str, Form()], password: Annotated[str, Form()], db: Session = Depends(get_db)):
    try:
        user_data = get_worker_by_email(email, db)
        if user_data is None or not verify_password(password, user_data.password):
            raise HTTPException(
                status_code=401,
                detail="Username or password no authorization"
            )
        token = create_token({"id": str(user_data.id)})  # Convertir UUID a string
        logger.info(f"Usuario autorizado: {token}")
        response = HTMLResponse(content="Login successful")
        response.set_cookie(key="access_token", value=token, httponly=True, max_age=TOKEN_SCOND_EXP)
        return response
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
