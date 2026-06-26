from fastapi import APIRouter, Depends
from typing import Optional
from pydantic import BaseModel
from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.api.deps import get_tenant_context, TenantContext
from app.services.agent_runner import AgentRunner
from app.models.datasource import DataSource

router = APIRouter()

class QueryRequest(BaseModel):
    query_text: str
    active_source_id: Optional[str] = None

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

@router.post("/run")
async def run_query(
    payload: QueryRequest,
    db: AsyncSession = Depends(get_db),
    context: TenantContext = Depends(get_tenant_context)
):
    active_source_id = payload.active_source_id
    
    # If no source provided, search database for tenant's active datasource
    if not active_source_id:
        result = await db.execute(
            select(DataSource)
            .where(DataSource.tenant_id == context.tenant_id)
            .where(DataSource.is_active == True)
            .order_by(DataSource.created_at.desc())
        )
        source = result.scalar_one_or_none()
        if source:
            active_source_id = str(source.source_id)
        else:
            active_source_id = "default_operational_postgres"
            
    # Execute LangGraph multi-agent flow
    result_state = await AgentRunner.execute_query(
        user_query=payload.query_text,
        tenant_id=context.tenant_id,
        active_source_id=active_source_id,
        chat_history=[]
    )
    
    return {
        "user_query": result_state.get("user_query"),
        "active_source_id": result_state.get("active_source_id"),
        "generated_sql": result_state.get("generated_sql"),
        "sql_execution_error": result_state.get("sql_execution_error"),
        "raw_dataset": result_state.get("raw_dataset"),
        "analytical_summary": result_state.get("analytical_summary"),
        "forecast_results": result_state.get("forecast_results"),
        "rca_analysis": result_state.get("rca_analysis"),
        "visualization_config": result_state.get("visualization_config"),
        "scenario_simulation_results": result_state.get("scenario_simulation_results"),
        "executive_summary": result_state.get("executive_summary"),
        "agent_logs": result_state.get("agent_logs")
    }
