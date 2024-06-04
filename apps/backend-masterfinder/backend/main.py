import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware


logging.basicConfig(level=logging.INFO,
                    format='%(levelname)s:     %(name)s - %(message)s')
logger = logging.getLogger(__name__)

app = FastAPI(
    title="API Ferremas",
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


@app.get("/test")
async def test():
    return {"detail": "Hello World"}
