from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, JSON
from pgvector.sqlalchemy import Vector
from app.models.tenant import Tenant

class DataSource(SQLModel, table=True):
    __tablename__ = "data_sources"
    __table_args__ = {"schema": "insightflow_system"}

    source_id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(foreign_key="insightflow_system.tenants.tenant_id", nullable=False)
    source_name: str = Field(nullable=False, max_length=100)
    connection_type: str = Field(nullable=False, max_length=50)
    encrypted_credentials: str = Field(nullable=False)
    is_active: bool = Field(default=True, nullable=False)
    last_synced_at: Optional[datetime] = Field(default=None, nullable=True)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    tenant: Tenant = Relationship(back_populates="data_sources")
    metrics: List["SemanticMetric"] = Relationship(back_populates="data_source", cascade_delete=True)
    tables: List["SemanticTable"] = Relationship(back_populates="data_source", cascade_delete=True)

class SemanticMetric(SQLModel, table=True):
    __tablename__ = "semantic_metrics"
    __table_args__ = {"schema": "insightflow_system"}

    metric_id: UUID = Field(default_factory=uuid4, primary_key=True)
    source_id: UUID = Field(foreign_key="insightflow_system.data_sources.source_id", nullable=False)
    metric_name: str = Field(nullable=False, max_length=100)
    sql_expression: str = Field(nullable=False)
    business_description: str = Field(nullable=False)
    # pgvector 1536-dimensional embedding column
    description_vector: Optional[List[float]] = Field(
        default=None,
        sa_column=Column(Vector(1536), nullable=True)
    )
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    data_source: DataSource = Relationship(back_populates="metrics")

class SemanticTable(SQLModel, table=True):
    __tablename__ = "semantic_tables"
    __table_args__ = {"schema": "insightflow_system"}

    table_id: UUID = Field(default_factory=uuid4, primary_key=True)
    source_id: UUID = Field(foreign_key="insightflow_system.data_sources.source_id", nullable=False)
    table_name: str = Field(nullable=False, max_length=100)
    # JSONB columns
    column_definitions: dict = Field(default_factory=dict, sa_column=Column(JSON, nullable=False))
    business_description: str = Field(nullable=False)
    # pgvector column
    schema_vector: Optional[List[float]] = Field(
        default=None,
        sa_column=Column(Vector(1536), nullable=True)
    )
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    data_source: DataSource = Relationship(back_populates="tables")
