from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import get_db
from app.models.admin import Admin
from app.schemas.auth import LoginRequest, Token
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_admin


router = APIRouter(prefix="/auth")


@router.post("/login", response_model=Token)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
	admin = db.query(Admin).filter(Admin.username == payload.username).first()
	if not admin or not verify_password(payload.password, admin.password_hash):
		raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
	token = create_access_token(subject=admin.username)
	return Token(access_token=token)


@router.post("/register", response_model=Token)
def register(payload: LoginRequest, db: Session = Depends(get_db), _: Admin = Depends(get_current_admin)):
	# Only allow an authenticated admin to create another admin
	existing = db.query(Admin).filter(Admin.username == payload.username).first()
	if existing:
		raise HTTPException(status_code=400, detail="Username already exists")
	admin = Admin(username=payload.username, password_hash=get_password_hash(payload.password))
	db.add(admin)
	db.commit()
	token = create_access_token(subject=admin.username)
	return Token(access_token=token)