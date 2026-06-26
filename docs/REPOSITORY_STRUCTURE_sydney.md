# Repository Structure Specifications: InsightFlow

## Document Metadata
- **Product Name**: InsightFlow
- **Document Version**: 1.0.0
- **Status**: Draft
- **Author**: Staff Software Engineer
- **Target Release Date**: Q4 2026

---

### 1. Monorepo Structural Overview

InsightFlow is managed as a unified monorepo to maintain strong integration parity between client assets, gateway routers, agent systems, and infrastructure parameters.

```
InsightFlow/
├── backend/                  # FastAPI Application & AI Agent Engines
├── frontend/                 # React Single Page Application (SPA)
├── database/                 # Database migrations and mock dataset seeds
├── n8n/                      # Importable automation workflows
├── docker/                   # Deployment containers configurations
├── docs/                     # Specifications and architectural plans
└── tests/                    # Core integration & end-to-end (E2E) testing suites
```

---

### 2. Module Specifications

#### 2.1 Backend (`/backend`)
- **Purpose**: Exposes FastAPI endpoints, validates schemas, runs read-only queries against client data warehouses, and serves local Qwen3 model inferences.
- **Responsibilities**: Authentication gating, database connection decryption, threat filtering (SQL validation), and LangGraph agent thread routing.
- **Contents**:
  - `app/api/`: Handles request validation, routes endpoints, and exposes WebSockets for chat.
  - `app/core/`: Initializes async database pools, registers exceptions, and parses environment configurations.
  - `app/models/`: Declares unified SQLModel database schemas (e.g. Tenants, Users, SemanticMetrics).
  - `app/repositories/`: Implements SQL CRUD abstractions.
  - `app/services/`: Hosts pure business controllers (e.g. SQL executor, forecaster, RCA engine).
  - `app/workers/`: Executes background queues and long-running Celery processes.

#### 2.2 Frontend (`/frontend`)
- **Purpose**: Renders the client user interface, handles state management, and initiates real-time WebSocket communication.
- **Responsibilities**: Renders responsive Recharts widgets, executes local layout transitions (Framer Motion), manages user sessions, and displays telemetry logs.
- **Contents**:
  - `src/components/ui/`: Houses Radix/Shadcn components (buttons, dialogs, dropdowns).
  - `src/components/layout/`: Holds the shell, topnav, and responsive sidebar navigation.
  - `src/features/`: Isomorphic feature logic units (e.g. `chat/`, `dashboard/`, `catalog/`, `anomalies/`).
  - `src/store/`: Declares global Zustand stores (Auth, ChatState, UI).
  - `src/routes/`: Configures navigation guards, authentication redirects, and lazy loading.
  - `src/utils/`: Formats dates and runs math helpers.

#### 2.3 Database (`/database`)
- **Purpose**: Tracks structured migrations and maintains test dataset seed assets.
- **Responsibilities**: Structural updates tracing, local schema initializations, and test case data population.
- **Contents**:
  - `migrations/versions/`: Contains sequential Alembic history steps.
  - `seeds/`: Populates operational tables and mock customer sales data grids.

#### 2.4 LangGraph Systems (`/backend/app/services/agents`)
- **Purpose**: Runs stateful multi-agent pipelines (Supervisor router and specialized worker nodes).
- **Responsibilities**: Question classification, database table metadata retrieval, SQL script drafting, and visualization configurations mapping.
- **Contents**:
  - `state.py`: Defines the global graph context class (`AgentTeamState`).
  - `graph.py`: Maps graph nodes, paths, and conditional loops.
  - `nodes/`: Houses node execution handlers (e.g., `supervisor.py`, `sql_agent.py`, `rca.py`).
  - `tools/`: Implements Pydantic-validated tool bindings (e.g. Postgres SELECT runners, semantic lookups).

#### 2.5 n8n Automation Workflows (`/n8n`)
- **Purpose**: Hosts ready-to-import integration blueprints.
- **Responsibilities**: Relays anomaly warnings to Slack, dispatches executive summary reports, and schedules cache updates.
- **Contents**:
  - `workflows/`: Group of JSON configuration files (e.g. `daily_refresh.json`, `kpi_alert.json`).

#### 2.6 Docker Container Configurations (`/docker`)
- **Purpose**: Standardizes local runtimes and containerization behaviors.
- **Responsibilities**: Container build sequences, networking controls, volumes storage configuration, and NVIDIA GPU setup.
- **Contents**:
  - `compose.yml`: Coordinates operational containers.
  - `compose.override.yml`: Dev-mode overrides (e.g., binding debug ports, environment overlays).
  - `backend/Dockerfile`: Multi-stage Python build container.
  - `frontend/Dockerfile`: Decoupled Node build static serve Nginx server.

#### 2.7 Documentation (`/docs`)
- **Purpose**: Central database repository of system architecture, designs, and guidelines.
- **Responsibilities**: Project knowledge management.
- **Contents**:
  - `PRD.md`, `ARCHITECTURE.md`, `DATABASE_SCHEMA.md`, `AGENTS.md`, `DESIGN_SYSTEM.md`, `FRONTEND_STRUCTURE.md`, `BACKEND_STRUCTURE.md`, `PROJECT_SETUP.md`, `DATA_INGESTION_sydney.md`, `REPOSITORY_STRUCTURE_sydney.md`.

#### 2.8 Testing (`/tests`)
- **Purpose**: Ensures system reliability, performance metrics, and security controls.
- **Responsibilities**: API contract testing, multi-agent regression checks, and front-to-back E2E workspace validation.
- **Contents**:
  - `integration/`: Tests multi-tenant isolation gates and WebSocket message flows.
  - `e2e/`: Simulates dashboard navigation and SQL generation error overrides.

---

File Name: docs/REPOSITORY_STRUCTURE_sydney.md
