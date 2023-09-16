from fastapi import APIRouter

import src.services.offers_service as offers_service

router = APIRouter(prefix='/offers')

@router.get('/')
async def get_offers():
    return offers_service.get_offers()