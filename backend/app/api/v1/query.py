from fastapi import APIRouter, Depends
from app.api.deps import get_tenant_context, TenantContext

router = APIRouter()

@router.get("/status")
async def get_system_status(
    context: TenantContext = Depends(get_tenant_context)
):
    return {
        "status": "online",
        "tenant_id": context.tenant_id,
        "user_id": context.user_id,
        "role": context.role
    }
