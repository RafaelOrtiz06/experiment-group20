from src.controllers import offers_controller

router = lambda app: app.include_router(offers_controller.router)