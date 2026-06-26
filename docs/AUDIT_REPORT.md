# Repository Audit & MVP Startup Plan: InsightFlow

## Document Metadata
- **Product Name**: InsightFlow
- **Document Version**: 1.0.0
- **Status**: Draft
- **Author**: Senior DevOps Engineer
- **Target Release Date**: Q4 2026

---

### 1. Repository Audit Status

An audit of the local filesystem shows the following implementation status for the core files:

#### 1.1 Existing Files (Fully Implemented)
- **Frontend SPA Code**: Routing, layouts, sidebar navigation, topnav, theme providers, dashboard widgets with Recharts, and conversational AI workspaces with LangGraph simulators are fully set up inside the `/frontend/` workspace.
- **FastAPI Foundation Gateway**: Injects async connections, sets correlation IDs, tracks latencies, handles JWT auth payloads, and implements model registries inside `/backend/app/`.
- **SQLModel Database Entities**: User, Tenant, DataSource, SemanticMetric, and Chat logs schemas are mapped in `/backend/app/models/`.
- **LangGraph Multi-Agent Team**: Supervisor, SQLAgent, Forecasting, RCA, and Scenario analysis workflows are integrated into `/backend/app/services/agents.py`.
- **n8n Workflows**: Core workflows are saved in `/n8n/` as importable JSON files.

#### 1.2 Missing Files (Requires Generation on Disk)
- **`backend/requirements.txt`**: Missing (Listed in project setup documentation but does not exist as a physical file).
- **`backend/pyproject.toml`**: Missing (No dependency tracking file in backend root).
- **`backend/alembic.ini`**: Missing (Required for Alembic migrations).
- **`backend/alembic/` (migrations folder)**: Missing.
- **`backend/.env.example`**: Missing.
- **Docker Files (`backend/Dockerfile`, `frontend/Dockerfile`, `docker/compose.yml`)**: Missing (Detailed in documentation, but physical files must be generated).
- **Celery Worker & Redis integration files (`backend/app/workers/`)**: Missing.
- **LangGraph Entrypoint Client (`backend/app/services/agent_runner.py`)**: Missing.

---

### 2. Immediate Recovery Actions

Run these commands immediately to create directories and place empty templates to prevent compiler breaks:
```bash
# Create missing directories
mkdir -p backend/alembic/versions
mkdir -p backend/app/workers
mkdir -p docker
```

---

### 3. Service Dependency Classification

#### Mandatory for MVP:
- **FastAPI API Gateway (Backend)**: Binds routing logic and runs calculations.
- **React Vite SPA (Frontend)**: Serves the primary workspace user interface.
- **PostgreSQL Database**: Holds baseline tenant state and metadata.

#### Can be Postponed (Post-MVP):
- **Ollama (Qwen3 LLM Node)**: Can be mocked in development using static JSON agent replies.
- **Redis Queue / Celery Workers**: Long-running RCA or forecasting calculations can run synchronously in dev mode.
- **n8n Workflow Engine**: External Slack/Email alert relays are not required to test core BI dashboards.

---

### 4. Phased MVP Startup Plan

A phased roadmap designed to verify core code components step-by-step with the fewest possible external dependencies.

#### Phase 1: Frontend + Mocked Backend Gateway (Zero DB/LLM requirement)
- **Goal**: Verify UI layouts and API connections.
- **Setup**: Configure FastAPI to use in-memory sqlite/dict variables for mock authentication and routing.
- **Execution Commands**:
  ```bash
  # Start FastAPI
  cd backend && uvicorn app.main:app --port 8000 --reload
  
  # Start React
  cd ../frontend && npm run dev
  ```
- **Verification**: Open `http://localhost:3000/login`. Clicking "Sign In (Simulated)" should redirect to the Overview dashboard showing Recharts widgets.

#### Phase 2: Add PostgreSQL Database
- **Goal**: Persist credentials, datasource connections, and metadata catalogs.
- **Setup**: Start Postgres on localhost port 5432. Apply initial schemas.
- **Execution Commands**:
  ```bash
  # Execute Postgres container locally
  docker run --name insightflow_db -e POSTGRES_PASSWORD=secureDBPassword123 -e POSTGRES_DB=insightflow_ops -p 5432:5432 -d postgres:16
  
  # Run Alembic migrations
  cd backend && alembic upgrade head
  ```
- **Verification**: Run `pg_isready -h localhost -p 5432` to verify Postgres accessibility.

#### Phase 3: Add Ollama LLM Model
- **Goal**: Enable natural language SQL conversions.
- **Setup**: Run Ollama bare-metal or inside Docker.
- **Execution Commands**:
  ```bash
  # Start Ollama service (Local command)
  ollama run qwen3:14b-instruct
  ```
- **Verification**: Run `curl http://localhost:11434/` to assert that the inference service is active.

#### Phase 4: Add LangGraph Workflow Execution
- **Goal**: Activate the decision-making loop.
- **Setup**: Link the backend services to the active Ollama endpoint.
- **Execution Commands**:
  ```bash
  # Test the agent execution in isolation
  poetry run python -m app.services.agents
  ```

#### Phase 5: Add Redis & Celery
- **Goal**: Enable asynchronous task queuing.
- **Setup**: Launch Redis container and run Celery workers.
- **Execution/Verify Commands**:
  ```bash
  # Start Redis Container
  docker run --name insightflow_cache -p 6379:6379 -d redis:7-alpine
  
  # Start Celery Worker
  cd backend && celery -A app.workers.worker worker --loglevel=info
  ```

#### Phase 6: Add n8n Automation Workflows
- **Goal**: Activate external integrations alerting.
- **Setup**: Import workflow templates in n8n UI on `http://localhost:5678`.

---

File Name: docs/AUDIT_REPORT_sydney.md
