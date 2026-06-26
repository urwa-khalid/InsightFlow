from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4
from sqlmodel import SQLModel, Field, Relationship

class Tenant(SQLModel, table=True):
    __tablename__ = "tenants"
    __table_args__ = {"schema": "insightflow_system"}

    tenant_id: UUID = Field(default_factory=uuid4, primary_key=True)
    company_name: str = Field(nullable=False, max_length=255)
    subscription_tier: str = Field(
        nullable=False, 
        max_length=50,
        sa_column_kwargs={"server_default": "Growth"}
    )
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    users: List["User"] = Relationship(back_populates="tenant", cascade_delete=True)
    data_sources: List["DataSource"] = Relationship(back_populates="tenant", cascade_delete=True)

class User(SQLModel, table=True):
    __tablename__ = "users"
    __table_args__ = {"schema": "insightflow_system"}

    user_id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(foreign_key="insightflow_system.tenants.tenant_id", nullable=False)
    email: str = Field(nullable=False, max_length=255, index=True, unique=True)
    password_hash: str = Field(nullable=False, max_length=255)
    user_role: str = Field(nullable=False, max_length=50)
    first_name: Optional[str] = Field(default=None, max_length=100)
    last_name: Optional[str] = Field(default=None, max_length=100)
    created_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)
    updated_at: datetime = Field(default_factory=datetime.utcnow, nullable=False)

    # Relationships
    tenant: Tenant = Relationship(back_populates="users")
    conversations: List["Conversation"] = Relationship(back_populates="user", cascade_delete=True)
