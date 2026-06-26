# FastAPI Backend Application Architecture: InsightFlow

## Document Metadata
- **Product Name**: InsightFlow
- **Document Version**: 1.0.0
- **Status**: Draft
- **Author**: Senior Backend Architect
- **Target Release Date**: Q4 2026

---

### 1. Folder Structure

InsightFlow's backend is built using FastAPI, adopting a **Layered Architecture** style that isolates HTTP controllers, business services, database persistence, and system configuration.

```
backend/
├── app/
│   ├── api/                   # HTTP Controller Layer
│   │   ├── deps.py            # FastAPI dependency injections (JWT validator, DB Session)
│   │   ├── middleware/        # Custom middlewares (CORS, TenantContext, Logging)
│   │   └── v1/
│   │       ├── auth.py        # Authentication & Registration
│   │       ├── query.py       # NL-to-SQL & Chat WebSocket Gateway
│   │       ├── catalog.py     # Semantic Layer metadata endpoints
│   │       ├── anomalies.py   # RCA & Alert management
│   │       └── settings.py    # Database connection management
│   ├── core/                  # Core System settings
│   │   ├── config.py          # Pydantic BaseSettings environment parsing
│   │   ├── security.py        # JWT generation, Password crypt hashing
│   │   └── database.py        # SQLAlchemy engine and session makers
│   ├── models/                # Pydantic schemas & SQLModel entities
│   │   ├── tenant.py
│   │   ├── user.py
│   │   ├── datasource.py
│   │   └── analytics.py
│   ├── repositories/          # Repository Layer (Data Access layer)
│   │   ├── base.py            # Generic CRUDBase class
│   │   ├── user_repo.py
│   │   ├── source_repo.py
│   │   └── message_repo.py
│   ├── services/              # Business Logic Services Layer
│   │   ├── query_exec.py      # Execution & validation of safe SQL queries
│   │   ├── agent_runner.py    # LangGraph pipeline runner wrapper
│   │   ├── catalog_sync.py    # Schema ingestion and pgvector index updates
│   │   └── forecaster.py      # Time-series forecasting pipeline
│   ├── workers/               # Background task workers (Celery + Redis)
│   │   ├── tasks.py           # Anomaly monitoring jobs, async RCA tasks
│   │   └── worker.py          # Celery worker process runner
│   └── main.py                # FastAPI main initializer
├── tests/                     # Test Suites (pytest)
│   ├── conftest.py
│   ├── api/
│   └── services/
├── alembic/                   # Database migrations (Alembic)
├── alembic.ini
└── pyproject.toml             # Poetry dependency configuration
```

---

### 2. API Structure

All endpoints map prefix `/api/v1` and implement strict payload validation schemas (Pydantic).

#### Key API Endpoint Map:
- **`POST /api/v1/auth/login`**: Authenticates user and issues short-lived JWT token and secure HTTP-Only refresh cookie.
- **`GET /api/v1/catalog/tables`**: Returns metadata of current tables registered under tenant data warehouse.
- **`POST /api/v1/catalog/metrics`**: Adds a new metric formula to the semantic library, triggering background pgvector indexing.
- **`WS /api/v1/query/chat/ws`**: Persistent WebSocket channel. Acepts user message and streams tokens, compiled SQL, and Recharts configs.
- **`POST /api/v1/query/diagnose`**: Spawns an asynchronous Celery task for RCA diagnostics. Returns 202 Accepted.
- **`GET /api/v1/anomalies/alerts`**: Returns timeline list of detected metric deviations.

---

### 3. Services Layer (Business Logic)

The Service layer holds the domain business rules, isolated from web framework details (FastAPI) or database choices:

1. **`AgentRunnerService`**: Invokes the LangGraph state machine. Constructs graph states, binds the user session thread ID, passes parameters, and converts graph output arrays into client responses.
2. **`CatalogSyncService`**: Connects to target client data warehouses, reads system metadata catalogs, converts schemas to text profiles, calls local embedding models to generate vectors, and commits metadata to `semantic_tables`.
3. **`QueryExecService`**: Responsible for safe database query operations. Retrieves encrypted credentials, decrypts them via Fernet key configurations, establishes read-only database connections, binds a timeout limit (e.g. `SET statement_timeout = 5000`), and runs the compiled SELECT queries.

---

### 4. Repository Layer (Data Access)

To decouple database queries from business services, we implement a repository class pattern mapping database entities to CRUD operations:

- **`CRUDBase[ModelType, CreateSchemaType, UpdateSchemaType]`**: General CRUD interface defining standard asynchronous methods: `get()`, `get_multi()`, `create()`, `update()`, and `remove()`.
- **`UserRepository`**: Extends CRUDBase with lookup methods: `get_by_email()`, `verify_user_tenant_membership()`.
- **`MessageRepository`**: Extends CRUDBase with conversational retrieval: `get_chat_history_with_limit(limit=20)`.

---

### 5. Database Layer (Session Management)

We utilize **SQLAlchemy 2.0 Async Session API** with **SQLModel** to map database structures.

- **Connection Pool**: Engineered using `async_pg` driver. Configured with:
  ```python
  # Async engine configuration parameters
  engine = create_async_engine(
      settings.DATABASE_URL,
      pool_size=20,
      max_overflow=10,
      pool_recycle=1800,
      pool_pre_ping=True
  )
  ```
- **Transaction Handling**: All API routes inject active database sessions using a standard context manager dependency: `async with get_db_session() as session:`.

---

### 6. Authentication & Tenant Isolation Strategy

1. **JSON Web Tokens**: HMAC-SHA256 signature containing payload parameters:
   ```json
   {
     "sub": "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
     "tenant_id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
     "role": "Admin",
     "exp": 1782522000
   }
   ```
2. **Row-Level Tenant Isolation**:
   - Every API router dependency injects the parsed `tenant_id` from the JWT into the request context.
   - Database operations executed inside repository files must explicitly filter conditions by `tenant_id` (e.g., `select(Reports).where(Reports.tenant_id == active_tenant_id)`).

---

### 7. Logging Strategy

Structured JSON logging ensures machine-readability for log aggregation:

- **Implementation**: Structured log format using `structlog` configurations.
- **Log Enrichment**: Every log automatically records: `correlation_id` (injected at the middleware level for tracing requests), `tenant_id`, `user_id`, and `execution_duration`.
- **Output Routing**: Logs are piped to `stdout` for processing by container log shippers (e.g. Vector / FluentBit) and indexed in monitoring setups.

---

### 8. Monitoring Strategy

1. **Application Telemetry**: Exposes metrics endpoints `/metrics` structured for Prometheus scraper formats (using `prometheus-fastapi-instrumentator`). Tracks API request counts, latency percentages, and DB pool connection status.
2. **Sentry Integration**: Exception traces automatically bubble up to Sentry, capturing detailed request payload mappings and error parameters.
3. **OpenTelemetry Tracing**: FastAPI routes, Celery tasks, and LangGraph node executions are trace-linked using OpenTelemetry spans to map bottlenecks in Text-to-SQL pipelines.

---

### 9. Error Handling Strategy

FastAPI's built-in exception handlers catch and normalize application errors:

- **`HTTPException` Handler**: Uniform JSON output formatting:
  ```json
  {
    "error_code": "RESOURCE_NOT_FOUND",
    "message": "The requested data source was not found.",
    "correlation_id": "req-9c0b-4ef8-bb6d"
  }
  ```
- **Custom Exceptions**:
  - `SQLSecurityViolation`: Raised if syntax checking nodes discover write commands in generated SQL statements.
  - `TenantAccessMismatch`: Triggers immediate 403 response if a user query attempts to request a resource under a mismatching `tenant_id`.
  - `AgentExecutionTimeout`: Raised when forecasting or RCA pipelines time out during execution, triggering automated state rollbacks.

---

File Name: docs/BACKEND_STRUCTURE.md
