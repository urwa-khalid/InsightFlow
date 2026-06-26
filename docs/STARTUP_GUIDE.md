# Local Development Startup Guide: InsightFlow

## Document Metadata
- **Product Name**: InsightFlow
- **Document Version**: 1.0.0
- **Status**: Draft
- **Author**: Principal Full-Stack Engineer & DevOps Architect
- **Target Release Date**: Q4 2026

---

### 1. Required Software to Install

Before running the application, make sure the following baseline software packages are installed on your host system:

- **Python**: `v3.11.x` (Do not use Python 3.12+ yet, as some legacy LangChain/LangGraph C-bindings are not fully stable on newer interpreters).
- **Node.js**: `v20.x` (LTS version) or higher.
- **PostgreSQL**: `v16.x` or higher (Must include pgvector support if installing bare-metal, or use pgvector Docker image).
- **Redis**: `v7.x` or higher.
- **Ollama**: `v0.1.x` or higher.

---

### 2. Backend Dependency Analysis

InsightFlow requires a set of packages to handle REST endpoints, ORM execution, queue workers, and LangGraph agent pipelines.

#### Installation Commands:
If you are setting up dependencies using standard `pip`, execute the following:
```bash
# Upgrade pip to latest version
pip install --upgrade pip

# Install dependencies from the requirements file
pip install -r requirements.txt
```

#### Generated `requirements.txt` file:
Ensure a `requirements.txt` file exists in `/backend` containing the following package versions:
```
fastapi==0.110.0
uvicorn[standard]==0.29.0
sqlmodel==0.0.16
asyncpg==0.29.0
alembic==1.13.1
pydantic[email]==2.6.4
pydantic-settings==2.2.1
pyjwt[crypto]==2.8.0
passlib[bcrypt]==1.7.4
cryptography==42.0.5
langchain==0.1.13
langgraph==0.0.32
langchain-community==0.0.29
redis==5.0.3
celery==5.3.6
structlog==24.1.0
prometheus-fastapi-instrumentator==7.0.0
pgvector==0.2.5
```

---

### 3. Environment Setup

#### Example `.env` File (Save inside `/backend/.env`):
```ini
# Core FastAPI Gateway configurations
PROJECT_NAME="InsightFlow"
ENV=development
API_V1_STR="/api/v1"
SECRET_KEY="generate-secure-64-character-hexadecimal-secret-for-jwt-signing"
ACCESS_TOKEN_EXPIRE_MINUTES=15
REFRESH_TOKEN_EXPIRE_DAYS=7

# Operational PostgreSQL connection parameters
POSTGRES_SERVER=127.0.0.1
POSTGRES_USER=insightflow_admin
POSTGRES_PASSWORD=secureDBPassword123
POSTGRES_DB=insightflow_ops
POSTGRES_PORT=5432

# Redis Queue & Caching Broker parameters
REDIS_URL=redis://127.0.0.1:6379/0

# local LLM inference configurations (Ollama)
OLLAMA_BASE_URL=http://127.0.0.1:11434
QWEN_MODEL_NAME=qwen3:14b-instruct

# Cryptography credentials key (AES-256 GCM)
CREDENTIALS_ENCRYPTION_KEY="32-byte-fernet-encryption-key-for-datasources"
```

---

### 4. Database Setup (PostgreSQL)

#### 4.1 Installation:
- **macOS**: Install via Homebrew: `brew install postgresql@16`
- **Windows**: Download the interactive installer from the [PostgreSql Official Downloads page](https://www.postgresql.org/download/windows/).
- **Linux (Ubuntu/Debian)**:
  ```bash
  sudo apt update
  sudo apt install postgresql-16 postgresql-contrib-16
  ```

#### 4.2 SQL Setup Commands:
Log in to your local PostgreSQL terminal as default superuser (`postgres`):
```bash
psql -U postgres
```

Execute the following commands to create the application database, user accounts, and allocate permissions:
```sql
-- Create the dedicated application database
CREATE DATABASE insightflow_ops;

-- Create the platform administrator user role
CREATE USER insightflow_admin WITH PASSWORD 'secureDBPassword123';

-- Grant superuser status to configure schemas and enable extensions
ALTER USER insightflow_admin WITH SUPERUSER;

-- Allocate full connection permissions
GRANT ALL PRIVILEGES ON DATABASE insightflow_ops TO insightflow_admin;

-- Connect to the newly created database
\c insightflow_ops;

-- Enable the pgvector extension (Required for semantic catalog caching)
CREATE EXTENSION IF NOT EXISTS vector;
```

---

### 5. Redis Setup

#### 5.1 Installation:
- **macOS**: Install via Homebrew: `brew install redis`
- **Windows**: Install using WSL2 (`sudo apt install redis-server`) or download native MSI installers from Github community ports.
- **Linux (Ubuntu/Debian)**:
  ```bash
  sudo apt update
  sudo apt install redis-server
  ```

#### 5.2 Startup Commands:
```bash
# Start Redis service in the background
# Linux:
sudo service redis-server start

# macOS:
brew services start redis

# Manual CLI execution (All OS):
redis-server
```

---

### 6. Ollama Setup (Local LLM Serving)

#### 6.1 Installation:
1. Download the executable installer from the [Ollama Official Website](https://ollama.com).
2. Install and launch the Ollama tray application.

#### 6.2 Model Download:
Open a terminal shell and command Ollama to download the target reasoning model:
```bash
ollama pull qwen3:14b-instruct
```

#### 6.3 Hardware Recommendation Matrix:
Select model sizes based on your workstation GPU VRAM capacity to optimize token generation speeds:
- **8GB RAM / VRAM**: Use `qwen3:7b-instruct` (Fast inference on consumer laptops).
- **16GB RAM / VRAM**: Use `qwen3:14b-instruct` (Recommended baseline for balanced latency and SQL accuracy).
- **32GB+ RAM / VRAM**: Use `qwen3:32b-instruct` (Deepest reasoning capacity, slower token output speeds).

---

### 7. Backend Startup Instructions

#### 7.1 Virtual Environment Setup:
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# macOS/Linux:
source venv/bin/activate
```

#### 7.2 Dependency Installation:
```bash
pip install -r requirements.txt
```

#### 7.3 Startup commands:
1. **Apply alembic migrations**:
   ```bash
   alembic upgrade head
   ```
2. **Start FastAPI Gateway**:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
3. **Start Celery worker queue (In a separate terminal tab)**:
   ```bash
   celery -A app.workers.worker worker --loglevel=info
   ```

---

### 8. Frontend Startup Instructions

```bash
cd frontend

# Install client packages
npm install

# Start Vite hot-reloading dev server
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

### 9. Full Startup Order

To prevent connection exceptions, services must be initialized in the following chronological sequence:

1. **Step 1: Start PostgreSQL**: Holds the operational credentials and multitenant configuration tables.
2. **Step 2: Start Redis**: Establishes the broker state queue used by Celery tasks.
3. **Step 3: Start Ollama**: Serves the local inference endpoint. Ensure the model finishes loading before launching backend agents.
4. **Step 4: Start FastAPI Backend**: Starts the REST gateway endpoints and registers DB connection sessions.
5. **Step 5: Start React Frontend**: Mounts the client SPA UI and hooks into backend REST and WebSocket APIs.

---

### 10. Health Checks

Confirm that services are online and communicating by running these diagnostic commands:

- **PostgreSQL Connection**:
  ```bash
  pg_isready -h localhost -p 5432 -U insightflow_admin
  ```
- **Redis Connection**:
  ```bash
  redis-cli ping
  # Expected response: PONG
  ```
- **Ollama Connection**:
  ```bash
  curl -I http://localhost:11434/
  # Expected response: HTTP/1.1 200 OK
  ```
- **FastAPI Health Endpoint**:
  ```bash
  curl http://localhost:8000/api/v1/query/status
  ```
- **Frontend Availability**:
  ```bash
  curl -I http://localhost:3000/
  ```

---

### 11. Common Errors and Fixes

#### 11.1 Missing dependencies
- **Symptom**: `ImportError: No module named '...'` on backend startup.
- **Fix**: Re-execute `pip install -r requirements.txt` inside your active virtual environment. Ensure the python interpreter matches the virtual environment (`which python`).

#### 11.2 Database connection failures
- **Symptom**: `asyncpg.exceptions.InvalidPasswordError: password authentication failed`.
- **Fix**: Verify your `.env` connection values match the parameters used during SQL setup (Username: `insightflow_admin`, password: `secureDBPassword123`). Ensure PostgreSQL is configured to listen on localhost (check `postgresql.conf`).

#### 11.3 Redis connection failures
- **Symptom**: `celery.exceptions.OperationalError: Connection to redis://localhost:6379//0 refused`.
- **Fix**: Verify that the Redis service is running by executing `redis-cli ping`. If on Windows WSL2, make sure the WSL service was initialized (`sudo service redis-server start`).

#### 11.4 Ollama connection failures
- **Symptom**: `ConnectError: [Errno 111] Connection refused` in agents execution log console.
- **Fix**: Verify that the Ollama app is running in the background and is not blocked by firewalls. Verify model existence by executing `ollama list`.

#### 11.5 CORS issues
- **Symptom**: Console log warnings in browser: `Access to fetch at ... has been blocked by CORS policy`.
- **Fix**: Check `BACKEND_CORS_ORIGINS` in `/backend/.env`. Ensure it strictly contains your exact React dev port string: `["http://localhost:3000"]`.

#### 11.6 LangGraph startup issues
- **Symptom**: `ValidationError: next_agent has invalid value`.
- **Fix**: Ensure that the Qwen3 model is fully downloaded. If the model outputs text format parsing mistakes, the supervisor agent cannot resolve routing classes, breaking execution states.

---

### 12. Final Verification Checklist

Review these steps to verify that the system is ready:
- [ ] PostgreSQL service is running and `pg_isready` returns success.
- [ ] `vector` extension is successfully enabled in the `insightflow_ops` database.
- [ ] Redis server is running and returns `PONG` to ping requests.
- [ ] Ollama service is active and `qwen3:14b-instruct` is loaded.
- [ ] Backend environment variables (`.env` file) are populated.
- [ ] Database tables are initialized via `alembic upgrade head`.
- [ ] Uvicorn server is running on port `8000`.
- [ ] Celery worker is listening to the Redis queue.
- [ ] Vite dev server is running on port `3000`.
- [ ] A browser login at `http://localhost:3000/login` authenticates and displays the dashboard workspace.

---

File Name: docs/STARTUP_GUIDE_sydney.md
