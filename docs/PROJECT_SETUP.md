# Project Setup & Development Guide: InsightFlow

## Document Metadata
- **Product Name**: InsightFlow
- **Document Version**: 1.0.0
- **Status**: Draft
- **Author**: Staff Software Engineer
- **Target Release Date**: Q4 2026

---

### 1. Complete Repository Structure

InsightFlow is structured as a monorepo containing decoupled frontend, backend, automation, and docker configuration layers.

```
InsightFlow/
├── backend/                  # FastAPI backend service
│   ├── app/                  # Application source code
│   ├── tests/                # Unit & integration tests
│   ├── alembic/              # DB migration files
│   ├── pyproject.toml        # Poetry dependencies
│   └── Dockerfile            # Backend container specification
├── frontend/                 # React frontend client SPA
│   ├── src/                  # React source files
│   ├── public/               # Static web assets
│   ├── package.json          # Node dependencies
│   ├── tsconfig.json         # TypeScript configuration
│   └── Dockerfile            # Frontend container specification
├── docker/                   # Deployment & compose configurations
│   ├── compose.yml           # Core services composition (DB, Cache, Ollama, n8n)
│   ├── compose.override.yml  # Development overrides
│   └── local.env             # Local environments file template
├── docs/                     # Product & system documentation
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE_SCHEMA.md
│   ├── AGENTS.md
│   ├── DESIGN_SYSTEM.md
│   ├── FRONTEND_STRUCTURE.md
│   ├── BACKEND_STRUCTURE.md
│   └── PROJECT_SETUP.md
├── README.md                 # Project introduction page
└── .gitignore                # Global git ignore configurations
```

---

### 2. Frontend Setup Commands

#### Prerequisites:
- **Node.js**: v20.x (LTS) or higher
- **Package Manager**: `npm` v10.x or higher

#### Quick Setup:
```bash
# Navigate to frontend workspace
cd frontend

# Install exact node dependencies
npm install

# Start local development server with hot-reloading
npm run dev

# Run TypeScript compilation checks
npm run type-check

# Build optimized production bundle
npm run build
```

---

### 3. Backend Setup Commands

#### Prerequisites:
- **Python**: v3.11 or higher
- **Poetry**: v1.7 or higher (Python dependency manager)

#### Quick Setup:
```bash
# Navigate to backend workspace
cd backend

# Configure Poetry to create virtualenvs inside the project directory
poetry config virtualenvs.in-project true

# Install Python dependencies and set up virtual environment
poetry install

# Activate the virtual environment shell
poetry shell

# Run database migrations using Alembic
alembic upgrade head

# Start FastAPI development gateway server via Uvicorn
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

# Start the background Celery worker process
celery -A app.workers.worker worker --loglevel=info
```

---

### 4. Required Dependencies

#### 4.1 Frontend Dependencies (`package.json`)
```json
{
  "dependencies": {
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-tabs": "^1.0.4",
    "@tanstack/react-query": "^5.28.0",
    "axios": "^1.6.8",
    "clsx": "^2.1.0",
    "framer-motion": "^11.0.24",
    "lucide-react": "^0.363.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.22.3",
    "recharts": "^2.12.3",
    "tailwind-merge": "^2.2.2",
    "tailwindcss-animate": "^1.0.7",
    "zustand": "^4.5.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.66",
    "@types/react-dom": "^18.2.22",
    "typescript": "^5.2.2",
    "vite": "^5.1.6"
  }
}
```

#### 4.2 Backend Dependencies (`pyproject.toml`)
```toml
[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.110.0"
uvicorn = {extras = ["standard"], version = "^0.29.0"}
sqlmodel = "^0.0.16"
asyncpg = "^0.29.0"
alembic = "^1.13.1"
pydantic = {extras = ["email"], version = "^2.6.4"}
pydantic-settings = "^2.2.1"
pyjwt = {extras = ["crypto"], version = "^2.8.0"}
passlib = {extras = ["bcrypt"], version = "^1.7.4"}
cryptography = "^42.0.5"
langchain = "^0.1.13"
langgraph = "^0.0.32"
redis = "^5.0.3"
celery = "^5.3.6"
structlog = "^24.1.0"
prometheus-fastapi-instrumentator = "^7.0.0"
pgvector = "^0.2.5"
```

---

### 5. Environment Variables (.env Profiles)

#### 5.1 Backend Environment Configuration (`backend/.env`)
```ini
# Core FastAPI Gateway configurations
PROJECT_NAME="InsightFlow"
ENV=development
API_V1_STR="/api/v1"
SECRET_KEY="generate-secure-64-character-hexadecimal-secret"
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Operational PostgreSQL connection parameters
POSTGRES_SERVER=localhost
POSTGRES_USER=insightflow_admin
POSTGRES_PASSWORD=secureDBPassword123
POSTGRES_DB=insightflow_ops
POSTGRES_PORT=5432

# Redis Queue & Caching Broker parameters
REDIS_URL=redis://localhost:6379/0

# local LLM inference configurations
OLLAMA_BASE_URL=http://localhost:11434
QWEN_MODEL_NAME=qwen3:14b-instruct

# Cryptography credentials key (AES-256 GCM)
CREDENTIALS_ENCRYPTION_KEY="32-byte-fernet-encryption-key-for-datasources"
```

#### 5.2 Frontend Environment Configuration (`frontend/.env.local`)
```ini
# Gateway routes configuration
VITE_API_URL=http://localhost:8000/api/v1
VITE_WS_URL=ws://localhost:8000/api/v1/query/chat/ws
```

---

### 6. Docker & Container Strategy

We containerize services to coordinate standard local execution across developer workstations.

#### 6.1 Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM python:3.11-slim as base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    POETRY_HOME="/opt/poetry" \
    POETRY_VIRTUALENVS_IN_PROJECT=true \
    POETRY_NO_INTERACTION=1

# Install baseline dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install poetry
RUN curl -sSL https://install.python-poetry.org | python3 -

WORKDIR /backend
COPY pyproject.toml poetry.lock ./
RUN /opt/poetry/bin/poetry install --no-root --only main

COPY . .
EXPOSE 8000
CMD ["/opt/poetry/bin/poetry", "run", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 6.2 Docker Compose Configuration (`docker/compose.yml`)
```yaml
version: '3.8'

services:
  # Database engine hosting Operational DB + pgvector
  postgres:
    image: pgvector/pgvector:pg16
    container_name: insightflow_db
    environment:
      POSTGRES_USER: insightflow_admin
      POSTGRES_PASSWORD: secureDBPassword123
      POSTGRES_DB: insightflow_ops
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - insightflow_network

  # Queue & Cache Broker
  redis:
    image: redis:7-alpine
    container_name: insightflow_cache
    ports:
      - "6379:6379"
    networks:
      - insightflow_network

  # Local LLM Runtime node
  ollama:
    image: ollama/ollama:latest
    container_name: insightflow_llm
    ports:
      - "11434:11434"
    volumes:
      - ollama_models:/root/.ollama
    deploy:
      resources:
        reservations:
          devices:
            - driver: nvidia
              count: all
              capabilities: [gpu]
    networks:
      - insightflow_network

  # Automation hub
  n8n:
    image: docker.n8n.io/n8nio/n8n:latest
    container_name: insightflow_automation
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=secureAutomationPassword123
    networks:
      - insightflow_network

volumes:
  pgdata:
  ollama_models:

networks:
  insightflow_network:
    driver: bridge
```

---

### 7. Development Workflow

#### 7.1 Spin up Local Ecosystem:
```bash
# Navigate to Docker configurations folder
cd docker

# Fire up DB, Cache, LLM, and n8n services in detached mode
docker compose up -d

# Initialize Ollama model download (First run only)
docker exec -it insightflow_llm ollama run qwen3:14b-instruct
```

#### 7.2 Run Linters & Formatters:
- **Frontend**: Enforce coding standards via ESLint and Prettier formatting:
  ```bash
  cd frontend
  npm run lint
  npm run format
  ```
- **Backend**: Enforce coding standards via Ruff checks:
  ```bash
  cd backend
  poetry run ruff check app
  poetry run ruff format app
  ```

#### 7.3 Seed Sample Analytics Database:
To test the analytical platform during development, run the database seed command to spin up the local `client_analytics` star schema tables populated with mock data:
```bash
cd backend
poetry run python -m app.utils.seed_client_db
```

---

File Name: docs/PROJECT_SETUP.md
