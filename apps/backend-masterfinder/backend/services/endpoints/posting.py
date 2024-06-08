import logging

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from fastapi.encoders import jsonable_encoder
import base64

from backend.handlers.queries.posting import get_all_postings
from backend.database.session import get_db


router = APIRouter()

logger = logging.getLogger(__name__)


@router.get("/all-postings", tags=["Posting"])
def get_postings(db: Session = Depends(get_db)):
    try:
        postings = get_all_postings(db)
        # Convertir los datos a un formato seguro
        safe_postings = []
        for posting in postings:
            safe_posting = {}
            posting_dict = vars(posting)
            for key, value in posting_dict.items():
                if isinstance(value, bytes):
                    safe_posting[key] = base64.b64encode(value).decode('utf-8')
                else:
                    safe_posting[key] = value
            safe_postings.append(safe_posting)
        return jsonable_encoder(safe_postings)
    except Exception as e:
        logger.error(f"Error fetching postings: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")
