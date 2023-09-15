from fastapi import FastAPI
from src.utils import router
#from src.config import register_database

app: FastAPI = FastAPI()
    
#register_database(app) 

router(app)