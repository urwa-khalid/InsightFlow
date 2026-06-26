# Project Epic & Task Breakdown: InsightFlow

## Document Metadata
- **Product Name**: InsightFlow
- **Document Version**: 1.0.0
- **Status**: Draft
- **Author**: Engineering Manager
- **Target Release Date**: Q4 2026

---

### Epic 1: Data Ingestion Infrastructure

#### Feature 1.1: Local File Ingest Gate
- **Task 1.1.1: Build Multipart File Upload REST API**
  - *Description*: Implement `POST /api/v1/ingest/upload` in FastAPI using `UploadFile` to stream files to a secure scratch space.
  - *Criteria*: Endpoint rejects files > 50MB and non-CSV/XLSX extensions with HTTP 400.
- **Task 1.1.2: Implement CSV Type Inference Engine**
  - *Description*: Develop a service class that reads the first 1,000 rows of an uploaded file and infers SQL types (Integer, Numeric, Timestamp, Varchar, Boolean).
  - *Criteria*: Engine resolves mixed type columns (e.g. numbers + strings) to Varchar.

#### Feature 1.2: Relational Connection Gate
- **Task 1.2.1: Implement Credentials Encryption Helper**
  - *Description*: Write database credentials encryption/decryption utilities using Pydantic and cryptography's Fernet (AES-256 GCM).
  - *Criteria*: Credentials stored in database are fully encrypted, decrypted only during task execution.
- **Task 1.2.2: Build Safe PostgreSQL Query Runner**
  - *Description*: Implement an async database connection utility using `asyncpg` configured with read-only SELECT permissions and a 5-second execution statement timeout.
  - *Criteria*: Query execution automatically terminates with a `SQLTimeoutError` if it runs longer than 5 seconds.

---

### Epic 2: Semantic Cataloging & pgvector Search

#### Feature 2.1: Semantic Layer Schema Setup
- **Task 2.1.1: Declare SQLModel Schema Mapping**
  - *Description*: Define the database models for `SemanticMetric` and `SemanticTable` including foreign keys, schema names, and relationships.
  - *Criteria*: Database models migrate successfully using Alembic.
- **Task 2.1.2: Integrate pgvector Database Column**
  - *Description*: Add pgvector `Vector(1536)` columns to the metrics and tables models.
  - *Criteria*: Database table definition includes the vector column structure.

#### Feature 2.2: Schema Embedder Worker
- **Task 2.2.1: Create Ollama Embedding Client Service**
  - *Description*: Build a client helper connecting to the local Ollama container to generate 1536-dimensional float arrays for text strings.
  - *Criteria*: Function accepts a text string and returns a valid 1536-length float list.
- **Task 2.2.2: Develop Cosine Search Query**
  - *Description*: Write repository database query functions utilizing pgvector operators (`<=>`) to fetch the top 3 matching metrics matching a query vector.
  - *Criteria*: Cosine query runs in under 15ms and returns metrics ordered by relevance.

---

### Epic 3: LangGraph Agent Orchestration

#### Feature 3.1: Decision State Graph
- **Task 3.1.1: Define Global AgentTeamState Schema**
  - *Description*: Declare the LangGraph State TypedDict class including histories, generated SQL, datasets, and log buffers.
  - *Criteria*: The state schema parses and passes validations without errors.
- **Task 3.1.2: Implement Supervisor Routing Node**
  - *Description*: Build the supervisor decision LLM prompt using few-shot classification and define conditional edges to worker nodes.
  - *Criteria*: Supervisor routes queries correctly between SQL, RCA, Forecasting, and terminating states.

#### Feature 3.2: SQL Generating Node
- **Task 3.2.1: Prompt Qwen3 SQL Generator Node**
  - *Description*: Write the prompt for Qwen3 mapping natural text questions to PostgreSQL SELECT queries using the injected pgvector schemas.
  - *Criteria*: Node outputs valid SQL SELECT scripts.
- **Task 3.2.2: Build Abstract Syntax Tree (AST) SQL Validator**
  - *Description*: Implement static syntax validation checks using `sqlparse` to block queries containing non-SELECT statements.
  - *Criteria*: Validator raises `SQLSecurityViolation` exception if SQL contains keywords `DROP`, `UPDATE`, or `DELETE`.

---

### Epic 4: Conversational Chat UI & Canvas Dashboard

#### Feature 4.1: Navigation Frame Shell
- **Task 4.1.1: Configure React Router Navigation Shell**
  - *Description*: Mount the Sidebar, TopNav, and page Outlet wrapper containing Framer Motion transitions.
  - *Criteria*: Layout responds dynamically, sidebar navigation links highlight on active focus.
- **Task 4.1.2: Implement ThemeContext Provider**
  - *Description*: Build the dark-mode theme manager, saving theme settings to local storage.
  - *Criteria*: Theme toggles immediately and persists classes on browser page refresh.

#### Feature 4.2: AI Analyst Chat Page
- **Task 4.2.1: Create WebSocket Stream Hook**
  - *Description*: Build `useChatStream` hook connecting to the FastAPI WebSocket query gateway.
  - *Criteria*: Hook buffers streamed tokens, updates chat bubble layout states in real-time.
- **Task 4.2.2: Build Dynamic Recharts Area Chart**
  - *Description*: Implement Recharts Area and Bar chart templates styled using the HSL design system colors.
  - *Criteria*: Charts display loaders during pending queries and scale to fit parent layout blocks.

---

### Epic 5: n8n Alert Flows & Integrations

#### Feature 5.1: Webhook Alert Dispatcher
- **Task 5.1.1: Build Anomaly Alarm Monitor Cron Job**
  - *Description*: Develop a Celery background cron task running anomaly validations over live database metric thresholds.
  - *Criteria*: Cron triggers and writes anomaly warning states to the database.
- **Task 5.1.2: Create Ready-To-Import n8n JSON Workflows**
  - *Description*: Build and export n8n JSON pipeline definitions mapping webhooks triggers to Slack notification channels.
  - *Criteria*: JSON workflows import successfully to n8n without parameter conflicts.

---

File Name: docs/TASKS_sydney.md
