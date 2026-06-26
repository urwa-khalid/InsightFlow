# InsightFlow: AI-Powered Business Intelligence Platform

[![Backend: FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Frontend: React](https://img.shields.io/badge/Frontend-React-61DAFB.svg?style=flat&logo=react&logoColor=black)](https://react.dev)
[![AI Orchestration: LangGraph](https://img.shields.io/badge/AI_Orchestrator-LangGraph-FF5722.svg?style=flat&logo=chainlink&logoColor=white)](https://langchain-ai.github.io/langgraph/)
[![Database: PostgreSQL + pgvector](https://img.shields.io/badge/Database-PostgreSQL_pgvector-4169E1.svg?style=flat&logo=postgresql&logoColor=white)](https://github.com/pgvector/pgvector)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**InsightFlow** is a next-generation, AI-first Business Intelligence (BI) platform that redefines how organizations interact with and extract value from their business data. Unlike traditional BI tools that generate static dashboards requiring manual slicing and dicing, InsightFlow acts as an active intelligence partner.

Democratize deep data science and business analysis. By combining natural language interfaces, autonomous AI analytics agents, advanced forecasting, and automated root cause analysis, InsightFlow empowers every decision-maker to immediately understand not just **what** happened, but **why** it happened, **what will happen next**, and **which actions** they must take.

---

## Key Features

- 💬 **Conversational Data Analytics**: Ask questions in natural English and receive instant semantic answers, corresponding charts, and the generated SQL SELECT queries.
- 🧠 **LangGraph Multi-Agent Team**: A stateful, cyclical graph structure governing user requests (Supervisor, SQL Generator, Syntax Checker, Forecaster, RCA, Visualizer nodes) built on local Qwen3 models.
- 📊 **Executive Control Center**: A premium dark-mode dashboard displaying dynamic charts, anomaly warning tiles, and prediction scenarios.
- 🔍 **Automated Anomaly Diagnostics (RCA)**: Computes metric drift decomposition across dimension attributes to isolate the root cause of drops or spikes.
- 📈 **Time-Series Forecasting**: Integrated Prophet and ARIMA forecasting algorithms that compile predictions and show upper/lower confidence intervals.
- ⚙️ **Action Webhooks (n8n Integration)**: Connects database alerts and predictions directly to external n8n workflows for automated Slack notifications, email reports, and API dispatches.

---

## High-Level System Architecture

```
                       +-----------------------------------+
                       |        React Frontend SPA         |
                       +-----------------------------------+
                                         |
                                (HTTP / WebSockets)
                                         v
                       +-----------------------------------+
                       |      FastAPI Backend Gateway      |
                       +-----------------------------------+
                                         |
                       +-----------------+-----------------+
                       |                                   |
                       v                                   v
        +----------------------------+      +----------------------------+
        |    LangGraph Agent Team    |      |      n8n Automation        |
        |  (Supervisor / SQL / RCA)  |      |   (Slack / Email Alerts)   |
        +----------------------------+      +----------------------------+
                       |
                       v
        +----------------------------+
        |   PostgreSQL + pgvector    |
        |  (System DB & Schema Cache)|
        +----------------------------+
```

---

## Technology Stack

- **Frontend**: React (TypeScript), Tailwind CSS, Radix UI (Shadcn UI), Recharts, Framer Motion.
- **Backend**: FastAPI, SQLModel (SQLAlchemy ORM + Pydantic validation), Celery, Redis.
- **AI**: LangGraph, LangChain, Ollama running local Qwen3 models.
- **Database**: PostgreSQL (v16+) with the `pgvector` extension.
- **Automation**: n8n Workflow Engine.

---

## Screenshots Section

| Conversational Analytics Workspace | Executive Control Center |
| :---: | :---: |
| *Mock UI rendering interactive chat bubbles, collapsible SQL previews, and the LangGraph active node execution graph.* | *Modern glassmorphic dashboard showcasing revenue area charts, active anomaly logs, and Prophet forecasts.* |

---

## Quick Start Guide (Local Setup via Docker)

### Prerequisites
- [Docker & Docker Compose](https://www.docker.com/) installed on your host.
- [NVIDIA Container Toolkit](https://github.com/NVIDIA/nvidia-container-toolkit) (Required only if running local Qwen3 LLM models on GPU).

### Local Execution:
1. **Clone the repository**:
   ```bash
   git clone https://github.com/urwa-khalid/InsightFlow.git
   cd InsightFlow
   ```

2. **Spin up local infrastructure containers**:
   ```bash
   cd docker
   docker compose up -d
   ```

3. **Initialize the local LLM model**:
   ```bash
   docker exec -it insightflow_llm ollama run qwen3:14b-instruct
   ```

4. **Initialize databases & seeds (Backend environment)**:
   ```bash
   cd ../backend
   poetry run alembic upgrade head
   poetry run python -m app.utils.seed_client_db
   ```

5. **Start Client Workspace**:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```
   Open `http://localhost:3000` to view the dashboard workspace.

---

## Development Roadmap

- **Phase 1: Local Ingestion Gateway**: File parsing (CSV, Excel) and multi-tenant schema isolation.
- **Phase 2: Semantic Cataloging**: Column indexing and pgvector semantic metric searches.
- **Phase 3: Agent Orchestration**: Decision graph structures and text-to-SQL validations.
- **Phase 4: Client Chat Canvas**: WebSocket chat streams and dynamic Recharts visualizers.
- **Phase 5: Automated alerts**: n8n pipelines integrations.

---

## Future Enhancements
- **Voice-to-Insight**: Integrating speech processing for hands-free query tracking on mobile and tablet platforms.
- **Multi-Agent Deliberation**: Equipping specialized AI agents (e.g. Finance Agent, Marketing Agent) to deliberate and compile unified cross-functional strategic advice.

---

## Contribution Guide

We welcome contributions to InsightFlow!
1. **Fork the repository** and create your branch (`git checkout -b feature/amazing-feature`).
2. **Format your code**:
   - Backend: Run `poetry run ruff format app`
   - Frontend: Run `npm run format`
3. **Commit your modifications** and open a Pull Request.

---

File Name: README_sydney.md
