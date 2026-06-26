# Backend Implementation Blueprint: InsightFlow

## Technical Stack
- **Framework**: FastAPI (ASGI Server: Uvicorn)
- **Database ORM**: SQLModel / SQLAlchemy (AsyncPG driver)
- **Data Migrations**: Alembic
- **Queue & Background Jobs**: Celery + Redis
- **Security & Cryptography**: PyJWT + Passlib (Bcrypt) + Cryptography (Fernet)
- **Vector Search Engine**: pgvector

---

### 1. Folder Structure

```
backend/
├── app/
│   ├── api/                   # HTTP endpoints & websockets
│   │   ├── deps.py            # Dependency injections (Session, JWT auth)
│   │   └── v1/                # Endpoint routers
│   ├── core/                  # Configuration & db initializations
│   ├── models/                # SQLModel database declarations
│   ├── repositories/          # CRUD DB access abstractions
│   ├── services/              # Pure domain logic layers
│   ├── workers/               # Async task worker setups (Celery)
│   └── main.py                # App gateway initializer
```

---

### 2. Database Architecture

#### Asynchronous Session & Pool Settings:
- We utilize `create_async_engine` from SQLAlchemy with the `asyncpg` driver.
- The execution context injects connection pooling with limits to support high concurrent execution:
  - `pool_size=20`, `max_overflow=10`, `pool_recycle=1800` (reclaims idle connections after 30 minutes).
- **pgvector integration**: We register pgvector support hooks upon pool connection:
  ```python
  from pgvector.asyncpg import register_vector
  # Hook executed inside engine connection listener to map 'vector' type configurations
  ```

---

### 3. SQLAlchemy Models Plan

We declare all database schemas using **SQLModel** to unify SQLAlchemy models and Pydantic schemas.

```python
# Models Blueprint & Relations

class Tenant(SQLModel, table=True):
    tenant_id: UUID = Field(default_factory=uuid4, primary_key=True)
    company_name: str
    subscription_tier: str
    # Relations
    users: List["User"] = Relationship(back_populates="tenant")
    data_sources: List["DataSource"] = Relationship(back_populates="tenant")

class User(SQLModel, table=True):
    user_id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(foreign_key="tenant.tenant_id")
    email: str = Field(unique=True, index=True)
    password_hash: str
    user_role: str
    # Relations
    tenant: Tenant = Relationship(back_populates="users")

class DataSource(SQLModel, table=True):
    source_id: UUID = Field(default_factory=uuid4, primary_key=True)
    tenant_id: UUID = Field(foreign_key="tenant.tenant_id")
    source_name: str
    connection_type: str
    encrypted_credentials: str

class SemanticMetric(SQLModel, table=True):
    metric_id: UUID = Field(default_factory=uuid4, primary_key=True)
    source_id: UUID = Field(foreign_key="datasource.source_id")
    metric_name: str
    sql_expression: str
    business_description: str
    # Vector column mapping (1536-dim)
    description_vector: Any = Field(sa_column=Column(Vector(1536)))
```

---

### 4. API Architecture

FastAPI routers decouple resources under `/api/v1`.

#### Dependency Injections (`app/api/deps.py`):
- **`get_async_db`**: Yields an asynchronous database session. Ensures transactional rollbacks on route failures.
- **`get_current_user`**: Validates JWT, extracts the user ID, verifies tenant active credentials, and checks resource permission profiles.

---

### 5. Authentication & Tenant Isolation Architecture

1. **Token Cryptography**: Signed via HS256 algorithm. Contains user role, identifier, active tenant scope, and expiration timestamp.
2. **Row-Level Tenant isolation**:
   - The platform enforces tenant constraints directly inside data retrieval pipelines:
     `select(Entity).where(Entity.tenant_id == active_tenant_id)`
   - Under no circumstances is raw database access permitted without passing active tenant identifier checks.

---

### 6. Service Layer Architecture (Domain Logic)

Services execute complex transactions, completely decoupled from HTTP controllers:

1. **`SQLGenerationService`**: Orchestrates text-to-SQL generation. Requests pgvector embeddings, constructs Qwen3 prompts, executes LangGraph syntax validations, and handles automated query self-correction steps.
2. **`ForecastingService`**: Prepares historical arrays, invokes forecasting engine workers (Celery + Prophet/ARIMA), computes prediction intervals, and formats chart responses.
3. **`RCAService`**: Evaluates metric alerts, executes variance checks across parameters, compiles contributing factors, and constructs narrative summaries.

---

### 7. Repository Layer Architecture (CRUD Abstractions)

The Repository pattern isolates SQLAlchemy execution structures, exporting clean methods to the service layers.

```python
# Generic Repository Blueprint
class CRUDBase[ModelType, CreateSchema, UpdateSchema]:
    def __init__(self, model: Type[ModelType]):
        self.model = model

    async def get(self, db: AsyncSession, id: Any) -> Optional[ModelType]: ...
    async def get_multi(self, db: AsyncSession, *, skip: int = 0, limit: int = 100) -> List[ModelType]: ...
    async def create(self, db: AsyncSession, *, obj_in: CreateSchema) -> ModelType: ...
    async def update(self, db: AsyncSession, *, db_obj: ModelType, obj_in: UpdateSchema) -> ModelType: ...
    async def remove(self, db: AsyncSession, *, id: Any) -> ModelType: ...
```

---

### 8. Logging Architecture

- **Engine**: Configured via `structlog` to emit JSON-formatted logs directly to `stdout`.
- **Request Tracing Middleware**: Intercepts inbound calls, extracts or generates a unique `X-Correlation-ID` header, and binds it to the logging context for the duration of the thread.
- **Error Capture Hooks**: Intercepts database connection timeouts, syntax validation issues, and user unauthorized actions, recording stack traces before bubbling up to custom error handler classes.

---

File Name: backend/README.md
