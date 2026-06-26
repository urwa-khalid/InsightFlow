from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlmodel import SQLModel, select
from uuid import UUID
from app.core.config import settings
from app.models.tenant import Tenant, User

# Create async engine with connection pooling limits
engine = create_async_engine(
    settings.DATABASE_URL,
    pool_size=20,
    max_overflow=10,
    pool_recycle=1800,
    pool_pre_ping=True
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False
)

# Database session dependency
async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

# Initial database migration helper (mostly for dev/testing)
async def init_db() -> None:
    async with engine.begin() as conn:
        # Create all tables defined inside models directory
        await conn.run_sync(SQLModel.metadata.create_all)

    # Seed default tenant and user if they don't exist
    async with AsyncSessionLocal() as session:
        try:
            tenant_id = UUID("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11")
            result = await session.execute(select(Tenant).where(Tenant.tenant_id == tenant_id))
            tenant = result.scalar_one_or_none()
            if not tenant:
                tenant = Tenant(
                    tenant_id=tenant_id,
                    company_name="Acme Corp",
                    subscription_tier="Growth"
                )
                session.add(tenant)
                
                user = User(
                    user_id=UUID("b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22"),
                    tenant_id=tenant_id,
                    email="admin@acme.com",
                    password_hash="admin123",
                    user_role="Admin",
                    first_name="Admin",
                    last_name="User"
                )
                session.add(user)
                await session.commit()
        except Exception as e:
            await session.rollback()
            raise e
        finally:
            await session.close()
