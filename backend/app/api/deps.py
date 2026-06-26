from typing import Generator
from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
import jwt
from pydantic import BaseModel, ValidationError
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import AuthenticationError


reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)

class TokenPayload(BaseModel):
    sub: str | None = None
    tenant_id: str | None = None
    role: str | None = None

async def get_current_user_payload(
    token: str = Depends(reusable_oauth2)
) -> TokenPayload:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=["HS256"]
        )
        token_data = TokenPayload(**payload)
    except (jwt.PyJWTError, ValidationError):
        raise AuthenticationError()
    return token_data

class TenantContext(BaseModel):
    tenant_id: str
    user_id: str
    role: str

async def get_tenant_context(
    payload: TokenPayload = Depends(get_current_user_payload)
) -> TenantContext:
    if not payload.tenant_id or not payload.sub or not payload.role:
        raise AuthenticationError("Token payload missing tenant context parameters")
    return TenantContext(
        tenant_id=payload.tenant_id,
        user_id=payload.sub,
        role=payload.role
    )
