from typing import Any, Dict, List, Optional
from uuid import uuid4
from langchain_core.messages import HumanMessage
from app.services.agents import agent_graph

class AgentRunner:
    @staticmethod
    async def execute_query(
        user_query: str,
        tenant_id: str,
        active_source_id: str,
        chat_history: Optional[List[Any]] = None
    ) -> Dict[str, Any]:
        """
        Executes the LangGraph Multi-Agent Team workflow.
        Returns the finalized state containing generated SQL, calculations, and chart configs.
        """
        if chat_history is None:
            chat_history = []
            
        # Standardize query context input to LangChain messages format
        messages = []
        for msg in chat_history:
            # Reconstruct message models
            messages.append(msg)
            
        # Initialize graph state payload
        initial_state = {
            "user_query": user_query,
            "tenant_id": tenant_id,
            "active_source_id": active_source_id,
            "chat_history": messages,
            "next_agent": "supervisor",
            "current_run_id": str(uuid4()),
            "generated_sql": None,
            "sql_execution_error": None,
            "raw_dataset": None,
            "analytical_summary": None,
            "forecast_results": None,
            "rca_analysis": None,
            "visualization_config": None,
            "scenario_parameters": None,
            "scenario_simulation_results": None,
            "executive_summary": None,
            "agent_logs": []
        }
        
        # Invoke LangGraph async runtime
        final_state = await agent_graph.ainvoke(initial_state)
        return final_state
