# Implementation Roadmap: InsightFlow

## Document Metadata
- **Product Name**: InsightFlow
- **Document Version**: 1.0.0
- **Status**: Draft
- **Author**: Technical Program Manager
- **Target Release Date**: Q4 2026

---

### Phase 1: Local Ingestion Gateway (Minimum Working Product)

#### Objective
Establish local data ingestion boundaries to parse CSV and Excel files and store records in PostgreSQL schemas.

#### Deliverables
- Ingest REST API (`POST /api/v1/ingest/upload`).
- Schema detection and datatype parser helper classes.
- Tenant isolation database schemas (`client_analytics_<tenant_id>`).

#### Dependencies
- Running PostgreSQL database container.
- FastAPI foundation setup.

#### Testing Requirements
- **Unit Tests**: Test data clean parser (e.g. converting `$1,200` to `1200.00`).
- **Integration Tests**: Verify files uploaded are mapped to isolated tenant tables without schema conflicts.

#### Definition of Done
- A 10MB test CSV file uploads, parses, and creates tables inside PostgreSQL in under 3 seconds.

---

### Phase 2: Semantic Layer Catalog & pgvector Search

#### Objective
Unify catalog metadata schemas, generate vector embeddings of columns, and index tables to pgvector.

#### Deliverables
- `SemanticMetric` and `SemanticTable` models.
- Database schema embedder background jobs.
- Search API matching user questions to metric schemas.

#### Dependencies
- Phase 1 (Database tables and metadata exist).
- Running Ollama container serving embedding models.

#### Testing Requirements
- **Vector search evaluation**: Run queries (e.g., "sales in US") and check if cosine similarity maps the correct tables in the top 3 results.

#### Definition of Done
- Querying "/catalog/search" with a natural text prompt returns matching table names with similarity score > 80% in under 50ms.

---

### Phase 3: LangGraph Agent Orchestration (Decision Loop)

#### Objective
Build the stateful agent team (Supervisor, SQL Generator, Validator, Visualizer) and compile the LangGraph execution model.

#### Deliverables
- LangGraph compilation module (`agents.py`).
- SQL syntax check validator node (blocks destructive calls).
- AI agent chat streaming endpoint.

#### Dependencies
- Phase 2 (pgvector context retrieval is working).
- Qwen3 model loaded in Ollama.

#### Testing Requirements
- **Agent Regression Testing**: Prompt the agent with SQL injection strings (e.g. "DROP TABLE sales") and assert that SQL Validator blocks the execution.

#### Definition of Done
- Inputting a question in the terminal runner executes the graph loop, writes a SELECT SQL query, fetches Postgres data, and returns the result.

---

### Phase 4: Conversational Chat UI & Dashboard Canvas

#### Objective
Mount the React web application, build the side-by-side chat workspace, and render responsive Recharts visualizations.

#### Deliverables
- React App routing system (Overview vs Chat Workspace tabs).
- Recharts area/bar dynamic wrappers.
- Streaming logs terminal widget displaying agent run telemetry.

#### Dependencies
- Phase 3 (FastAPI WebSocket chat streaming is online).
- Frontend Starter template mounted.

#### Testing Requirements
- **E2E Testing (Cypress / Playwright)**: Simulate typing a question, assert that the telemetry graph animates, and verify the line chart renders.

#### Definition of Done
- A developer can run `npm run dev`, ask a question in the browser chat, see agent nodes animate, and view a compiled line chart of database sales in under 5 seconds.

---

### Phase 5: Automated Alerts & n8n Integrations

#### Objective
Connect external alerting flows to Slack/Email endpoints and configure n8n workflow triggers.

#### Deliverables
- Alert webhook dispatcher service.
- Anomaly alerts database tracking.
- Imported and configured n8n JSON pipelines.

#### Dependencies
- Phase 4 (Dashboard and database systems are complete).
- Running n8n container instance.

#### Testing Requirements
- Trigger a mock severe anomaly event in the database and assert that the n8n webhook routes a formatted alert message to the test Slack channel.

#### Definition of Done
- A severe metric anomaly committed in the database automatically triggers an n8n Slack webhook message in under 1 second.

---

File Name: docs/IMPLEMENTATION_ROADMAP_sydney.md
