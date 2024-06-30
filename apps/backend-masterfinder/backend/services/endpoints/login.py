import uuid
import logging
from os import getenv
from typing import Annotated

from fastapi import APIRouter, Request, Form, HTTPException, Cookie, Depends, Response
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
import jwt

from backend.handlers.queries.worker import get_worker_by_email, update_reset_pass_token_by_email, get_worker_by_id, update_verify_by_id
from backend.handlers.auth import create_token, verify_password, generate_token, send_email, verify_token
from backend.database.session import get_db


router = APIRouter()

SECRET_KEY = getenv("SECRET_KEY")

logging.basicConfig(level=logging.INFO,
                    format='%(levelname)s:     %(name)s - %(message)s')
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
        token = create_token({"id": str(user_data.id)})
        logger.info(f"Usuario autorizado: {token}")
        return {"access_token": token}
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
    response = Response(content="Logout successful", status_code=200)
    response.delete_cookie(key="access_token")
    return response


@router.put("/password", tags=["Auth"])
def send_request(email: Annotated[str, Form()], db: Session = Depends(get_db)):
    try:
        user_data = get_worker_by_email(email, db)
        if user_data is None:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )
        token, code = generate_token()
        logger.info(code)
        #send_email(email, code)
        update_reset_pass_token_by_email(email, token, db)
        return user_data.id
    except HTTPException as e:
        logger.error(f"HTTP error: {e.detail}")
        raise e
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(
            status_code=500,
            detail="Internal server error"
        )


@router.get("/reset-token", tags=["Auth"])
def get_token(id: str, code: int, db: Session = Depends(get_db)):
    try:
        id = id.strip('"')
        id = uuid.UUID(id)  # Convertir id de str a uuid.UUID
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid UUID format"
        )
    
    user_data = get_worker_by_id(id, db)
    if user_data is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )
    token = str(user_data.reset_pass_token)
    if token is None:
        raise HTTPException(
            status_code=401,
            detail="No reset token found"
        )
    if verify_token(token, code):
        update_verify_by_id(id, db)
        return True
    else:
        raise HTTPException(
            status_code=401,
            detail="Invalid code or expired"
        )
