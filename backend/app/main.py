from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.db import engine, Base, SessionLocal
from app.models import admin as admin_model
from app.models import lottery as lottery_model
from app.routers import auth as auth_router
from app.routers import lotteries as lotteries_router
from app.core.security import get_password_hash


def create_app() -> FastAPI:
	app = FastAPI(title=settings.app_name)

	app.add_middleware(
		CORSMiddleware,
		allow_origins=settings.cors_origins,
		allow_credentials=True,
		allow_methods=["*"],
		allow_headers=["*"],
	)

	app.include_router(auth_router.router, prefix=settings.api_prefix, tags=["auth"])
	app.include_router(lotteries_router.router, prefix=settings.api_prefix, tags=["lotteries"])

	@app.on_event("startup")
	def on_startup():
		Base.metadata.create_all(bind=engine)
		# Seed default admin if not exists
		with SessionLocal() as db:
			existing = db.query(admin_model.Admin).filter(admin_model.Admin.username == settings.default_admin_username).first()
			if not existing:
				admin = admin_model.Admin(
					username=settings.default_admin_username,
					password_hash=get_password_hash(settings.default_admin_password),
				)
				db.add(admin)
				db.commit()

	return app


app = create_app()