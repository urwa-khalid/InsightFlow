from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
import jwt
from app.core.config import settings
from app.core.exceptions import AuthenticationError

router = APIRouter()

@router.post("/login")
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    # Simulated auth credentials check for starter app settings
    if form_data.username == "admin@acme.com" and form_data.password == "admin123":
        # Create access token carrying tenant details
        token_payload = {
            "sub": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
            "tenant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
            "role": "Admin"
        }
        encoded_jwt = jwt.encode(
            token_payload, settings.SECRET_KEY, algorithm="HS256"
        )
        return {
            "access_token": encoded_jwt,
            "token_type": "bearer"
        }
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )
