from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

# Configura la conexión a la base de datos
engine = create_engine("sqlite:///db.sqlite3")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
