from src.controllers import auth_controller


def router(app): return app.include_router(auth_controller.router)
