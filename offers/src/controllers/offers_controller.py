from fastapi import APIRouter, Depends
from src.authentication.auth import get_token_header

import src.services.offers_service as offers_service

router = APIRouter(prefix='/offers')


@router.get(path='/', dependencies=[Depends(get_token_header)])
async def get_offers():
    return await offers_service.get_offers()


@router.get(path='/health')
async def get_offers():
    return {"message": "Ok"}
