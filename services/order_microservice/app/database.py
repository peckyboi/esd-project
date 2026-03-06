import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

#fetch db_url otherwise use default
SQLALCHEMY_DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "mysql+pymysql://root:rootpassword@localhost:3306/orders_db"
)

#engine is connection to actual db
engine = create_engine(SQLALCHEMY_DATABASE_URL)

#creates a session which is unique to each requeest
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

#base class that all models inherit from,
#so when SQLAlchemy looks at all models that it inherits from,
# it will auto create tables for them
Base = declarative_base()

# dependency injection, allows us to inject the session instead of needing to handle it manually
def get_db():
    db = SessionLocal()
    try:
        yield db #yield pauses the sesson and doesnt hit finally until the return is given at an external call
    finally:
        db.close()