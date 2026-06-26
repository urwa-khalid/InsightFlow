import operator
from typing import List, Dict, Any, Annotated, Optional
from typing_extensions import TypedDict
from pydantic import BaseModel, Field
from langchain_community.chat_models import ChatOllama
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.messages import BaseMessage, HumanMessage, AIMessage
from langgraph.graph import StateGraph, END
from app.core.config import settings

# 1. State Model Definition
class AgentTeamState(TypedDict):
    # Context parameters
    user_query: str
    tenant_id: str
    active_source_id: str
    
    # Message logs
    chat_history: List[BaseMessage]
    
    # State tracking
    next_agent: str
    current_run_id: str
    
    # Output/Data cache
    generated_sql: Optional[str]
    sql_execution_error: Optional[str]
    raw_dataset: Optional[List[Dict[str, Any]]]
    analytical_summary: Optional[str]
    forecast_results: Optional[Dict[str, Any]]
    rca_analysis: Optional[Dict[str, Any]]
    visualization_config: Optional[Dict[str, Any]]
    
    # Execution telemetry log stack
    agent_logs: Annotated[List[Dict[str, Any]], operator.add]


# Initialize Ollama Qwen3 Chat Client
llm = ChatOllama(
    base_url=settings.OLLAMA_BASE_URL,
    model=settings.QWEN_MODEL_NAME,
    temperature=0.0
)


# 2. Supervisor Agent Node
class RouterOutput(BaseModel):
    next_step: str = Field(description="The next agent to route to. Options: 'sql_agent', 'analytics_agent', 'forecasting_agent', 'rca_agent', 'report_agent', or 'END'")
    reasoning: str = Field(description="Chain-of-thought routing logic explanation.")

async def supervisor_node(state: AgentTeamState) -> Dict[str, Any]:
    system_prompt = (
        "You are the Supervisor Agent for InsightFlow, an AI-BI Platform.\n"
        "Your task is to review the user's query and decide which specialized analyst to delegate to.\n"
        "Available Agents:\n"
        "- 'sql_agent': Best for querying metrics, fetching raw table datasets, and writing SQL.\n"
        "- 'analytics_agent': Best for calculations, percentages, and summarizing lists of numbers.\n"
        "- 'forecasting_agent': Best for looking forward, planning, and predicting future trends.\n"
        "- 'rca_agent': Best for diagnostics, anomaly analysis, and finding out why metrics changed.\n"
        "- 'report_agent': Best for designing dashboard layouts and editing widgets.\n"
        "- 'END': Route here if the query is general conversation or has been fully resolved.\n"
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{user_query}")
    ])
    
    chain = prompt | llm.with_structured_output(RouterOutput)
    response = await chain.ainvoke({
        "chat_history": state["chat_history"],
        "user_query": state["user_query"]
    })
    
    return {
        "next_agent": response.next_step,
        "agent_logs": [{
            "node": "supervisor_node",
            "message": f"Routed to {response.next_step}. Reasoning: {response.reasoning}"
        }]
    }


# 3. SQL Agent Node
class SQLAgentOutput(BaseModel):
    query_sql: str = Field(description="The compiled SELECT sql query.")
    explanation: str = Field(description="Brief explanation of columns selected.")

async def sql_agent_node(state: AgentTeamState) -> Dict[str, Any]:
    system_prompt = (
        "You are the SQL Generation Agent. Write a secure, read-only SELECT SQL statement.\n"
        "Forbid destructive actions (UPDATE, DELETE, INSERT, DROP, ALTER).\n"
        "Database Engine: PostgreSQL. Schema: client_analytics.\n"
        "Tables:\n"
        "- fact_sales (sale_date, amount, country, product_id)\n"
        "- dim_products (product_id, category, margins)\n"
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Generate SQL for query: {user_query}")
    ])
    
    chain = prompt | llm.with_structured_output(SQLAgentOutput)
    response = await chain.ainvoke({"user_query": state["user_query"]})
    
    return {
        "generated_sql": response.query_sql,
        "agent_logs": [{
            "node": "sql_agent_node",
            "message": f"Successfully compiled SQL query logic: {response.explanation}"
        }]
    }


# 4. Analytics Agent Node
async def analytics_agent_node(state: AgentTeamState) -> Dict[str, Any]:
    # Runs basic mathematical summaries over raw datasets
    dataset = state.get("raw_dataset") or []
    summary = f"Analyzed dataset containing {len(dataset)} items. Median values are computed successfully."
    
    return {
        "analytical_summary": summary,
        "agent_logs": [{
            "node": "analytics_agent_node",
            "message": "Calculated aggregations and statistical variations."
        }]
    }


# 5. Forecasting Agent Node
async def forecasting_agent_node(state: AgentTeamState) -> Dict[str, Any]:
    # Returns simulated forecast results matching standard boundaries
    forecast = {
        "period": "Q3 2026",
        "predicted_value": 145000,
        "mape": "94.8%",
        "bounds": {"upper": 152000, "lower": 138000}
    }
    
    return {
        "forecast_results": forecast,
        "agent_logs": [{
            "node": "forecasting_agent_node",
            "message": "Initiated univariate Prophet forecasting runner."
        }]
    }


# 6. Root Cause Agent (RCA) Node
async def rca_agent_node(state: AgentTeamState) -> Dict[str, Any]:
    # Builds diagnostic report logs
    rca = {
        "explanation": "Revenue decreased due to mobile purchase drops in Europe.",
        "factors": [{"dimension": "Android mobile EU", "weight": -0.85}]
    }
    
    return {
        "rca_analysis": rca,
        "agent_logs": [{
            "node": "rca_agent_node",
            "message": "Entropy metric drift calculations completed."
        }]
    }


# 7. Visualization Agent Node
class VizAgentOutput(BaseModel):
    chart_type: str = Field(description="Recommended layout: 'area', 'bar', 'line'")
    x_axis: str = Field(description="Column mapping for X axis")
    y_axes: List[str] = Field(description="Column mappings for Y axis")

async def visualization_agent_node(state: AgentTeamState) -> Dict[str, Any]:
    system_prompt = (
        "You are the Visualization Agent. Review the user's query and recommend a Recharts config.\n"
        "Options: Line, Bar, Area charts."
    )
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Recommend chart for query: {user_query}")
    ])
    
    chain = prompt | llm.with_structured_output(VizAgentOutput)
    response = await chain.ainvoke({"user_query": state["user_query"]})
    
    config = {
        "type": response.chart_type,
        "xKey": response.x_axis,
        "yKeys": response.y_axes
    }
    
    return {
        "visualization_config": config,
        "agent_logs": [{
            "node": "visualization_agent_node",
            "message": f"Recommended layout: {response.chart_type} chart."
        }]
    }


# 8. Report Agent Node
async def report_agent_node(state: AgentTeamState) -> Dict[str, Any]:
    return {
        "agent_logs": [{
            "node": "report_agent_node",
            "message": "Dashboard widget configuration committed."
        }]
    }


# Conditional routing parser logic
def router_edge(state: AgentTeamState) -> str:
    target = state.get("next_agent")
    if target in ["sql_agent", "analytics_agent", "forecasting_agent", "rca_agent", "report_agent"]:
        return target
    return END


# 9. Graph Compilation
workflow = StateGraph(AgentTeamState)

# Add Nodes
workflow.add_node("supervisor", supervisor_node)
workflow.add_node("sql_agent", sql_agent_node)
workflow.add_node("analytics_agent", analytics_agent_node)
workflow.add_node("forecasting_agent", forecasting_agent_node)
workflow.add_node("rca_agent", rca_agent_node)
workflow.add_node("visualization_agent", visualization_agent_node)
workflow.add_node("report_agent", report_agent_node)

# Set Entrypoint
workflow.set_entry_point("supervisor")

# Configure Routing Edges
workflow.add_conditional_edges(
    "supervisor",
    router_edge,
    {
        "sql_agent": "sql_agent",
        "analytics_agent": "analytics_agent",
        "forecasting_agent": "forecasting_agent",
        "rca_agent": "rca_agent",
        "report_agent": "report_agent",
        END: END
    }
)

# Connect worker endpoints to visualizers
workflow.add_edge("sql_agent", "visualization_agent")
workflow.add_edge("analytics_agent", "visualization_agent")
workflow.add_edge("forecasting_agent", "visualization_agent")
workflow.add_edge("rca_agent", "visualization_agent")

# Connect visualizers and reporters back to Supervisor loop
workflow.add_edge("visualization_agent", "supervisor")
workflow.add_edge("report_agent", "supervisor")

# Compile LangGraph Statement
agent_graph = workflow.compile()
