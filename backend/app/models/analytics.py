from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON, Numeric
from app.models.tenant import User


class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"
    __table_args__ = {"schema": "insightflow_system"}

    conversation_id: UUID = Field(default_factory=uuid4, primary_key=True)
    user_id: UUID = Field(foreign_key="insightflow_system.users.user_id", nullable=False)
    title: str = Field(default="New Analytics Chat", nullable=False, max_length=255)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    user: User = Relationship(back_populates="conversations")
    messages: List["ChatMessage"] = Relationship(back_populates="conversation", cascade_delete=True)
    runs: List["AgentRun"] = Relationship(back_populates="conversation", cascade_delete=True)

class ChatMessage(SQLModel, table=True):
    __tablename__ = "chat_messages"
    __table_args__ = {"schema": "insightflow_system"}

    message_id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="insightflow_system.conversations.conversation_id", nullable=False)
    sender_role: str = Field(nullable=False, max_length=50) # 'user' or 'assistant'
    message_text: str = Field(nullable=False)
    generated_sql: Optional[str] = Field(default=None, nullable=True)
    visualization_metadata: Optional[dict] = Field(
        default=None, 
        sa_column=Column(JSON, nullable=True)
    )
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    conversation: Conversation = Relationship(back_populates="messages")

class AgentRun(SQLModel, table=True):
    __tablename__ = "agent_runs"
    __table_args__ = {"schema": "insightflow_system"}

    run_id: UUID = Field(default_factory=uuid4, primary_key=True)
    conversation_id: UUID = Field(foreign_key="insightflow_system.conversations.conversation_id", nullable=False)
    workflow_name: str = Field(nullable=False, max_length=100) # e.g. 'text_to_sql'
    status: str = Field(nullable=False, max_length=50) # 'pending', 'running', 'completed', 'failed'
    started_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    completed_at: Optional[datetime] = Field(default=None, nullable=True)

    # Relationships
    conversation: Conversation = Relationship(back_populates="runs")
    logs: List["AgentLog"] = Relationship(back_populates="run", cascade_delete=True)

class AgentLog(SQLModel, table=True):
    __tablename__ = "agent_logs"
    __table_args__ = {"schema": "insightflow_system"}

    log_id: UUID = Field(default_factory=uuid4, primary_key=True)
    run_id: UUID = Field(foreign_key="insightflow_system.agent_runs.run_id", nullable=False)
    node_name: str = Field(nullable=False, max_length=100)
    log_level: str = Field(nullable=False, max_length=20)
    message: str = Field(nullable=False)
    state_snapshot: Optional[dict] = Field(default=None, sa_column=Column(JSON, nullable=True))
    logged_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    run: AgentRun = Relationship(back_populates="logs")

class Report(SQLModel, table=True):
    __tablename__ = "reports"
    __table_args__ = {"schema": "insightflow_system"}

    report_id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(foreign_key="insightflow_system.tenants.tenant_id", nullable=False)
    title: str = Field(nullable=False, max_length=255)
    description: Optional[str] = Field(default=None, nullable=True)
    created_by: Optional[UUID] = Field(default=None, foreign_key="insightflow_system.users.user_id", nullable=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    widgets: List["ReportWidget"] = Relationship(back_populates="report", cascade_delete=True)

class ReportWidget(SQLModel, table=True):
    __tablename__ = "report_widgets"
    __table_args__ = {"schema": "insightflow_system"}

    widget_id: UUID = Field(default_factory=uuid4, primary_key=True)
    report_id: UUID = Field(foreign_key="insightflow_system.reports.report_id", nullable=False)
    title: str = Field(nullable=False, max_length=150)
    query_sql: str = Field(nullable=False)
    visualization_config: dict = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    layout_position: dict = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    report: Report = Relationship(back_populates="widgets")

class ForecastRun(SQLModel, table=True):
    __tablename__ = "forecast_runs"
    __table_args__ = {"schema": "insightflow_system"}

    forecast_id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(foreign_key="insightflow_system.tenants.tenant_id", nullable=False)
    target_metric: str = Field(nullable=False, max_length=100)
    forecast_model: str = Field(nullable=False, max_length=50) # 'Prophet', 'ARIMA'
    historical_start_date: datetime = Field(nullable=False)
    forecast_end_date: datetime = Field(nullable=False)
    forecast_results: dict = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    created_by: Optional[UUID] = Field(default=None, foreign_key="insightflow_system.users.user_id", nullable=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

class AnomalyAlert(SQLModel, table=True):
    __tablename__ = "anomaly_alerts"
    __table_args__ = {"schema": "insightflow_system"}

    alert_id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(foreign_key="insightflow_system.tenants.tenant_id", nullable=False)
    target_metric: str = Field(nullable=False, max_length=100)
    detected_value: float = Field(sa_column=Column(Numeric(15, 4), nullable=False))
    expected_value: float = Field(sa_column=Column(Numeric(15, 4), nullable=False))
    deviation_percentage: float = Field(sa_column=Column(Numeric(5, 2), nullable=False))
    status: str = Field(nullable=False, max_length=50) # 'active', 'acknowledged', 'resolved'
    detected_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    resolved_at: Optional[datetime] = Field(default=None, nullable=True)

    # Relationships
    rca_report: Optional["RcaReport"] = Relationship(back_populates="alert", cascade_delete=True)

class RcaReport(SQLModel, table=True):
    __tablename__ = "rca_reports"
    __table_args__ = {"schema": "insightflow_system"}

    rca_id: UUID = Field(default_factory=uuid4, primary_key=True)
    alert_id: UUID = Field(foreign_key="insightflow_system.anomaly_alerts.alert_id", nullable=False)
    summary: str = Field(nullable=False)
    contributing_factors: dict = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    generated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    alert: AnomalyAlert = Relationship(back_populates="rca_report")
