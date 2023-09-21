from fastapi import APIRouter

import src.services.offers_service as offers_service

router = APIRouter()

@router.get(path='/')
async def get_offers():
    return await offers_service.get_offers()


@router.get(path='/health')
async def get_offers():
    return await offers_service.get_offers()
