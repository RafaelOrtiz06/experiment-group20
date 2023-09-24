from fastapi import APIRouter
from fastapi.security import OAuth2PasswordBearer
from typing import Annotated
from fastapi import Depends, FastAPI, HTTPException, status

import src.services.auth_service as auth_service

router = APIRouter(prefix='/auth')
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")


@router.post(path='/')
async def get_offers():
    return auth_service.create_access_token({})


@router.get('/me')
async def who_am_i(token: Annotated[str, Depends(oauth2_scheme)]):
    return await auth_service.get_current_user(token)


@router.get(path='/health')
async def get_offers():
    return {"message": "Ok"}
