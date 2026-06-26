from typing import List, Union
from pydantic import AnyHttpUrl, BeforeValidator, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing_extensions import Annotated

def assemble_cors_origins(v: Union[str, List[str]]) -> Union[List[str], str]:
    if isinstance(v, str) and not v.startswith("["):
        return [i.strip() for i in v.split(",")]
    elif isinstance(v, (list, str)):
        return v
    raise ValueError(v)

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_ignore_empty=True, extra="ignore"
    )

    PROJECT_NAME: str = "InsightFlow"
    ENV: str = "development"
    API_V1_STR: str = "/api/v1"
    
    # Cryptography & JWT Security
    SECRET_KEY: str = "32-byte-fernet-encryption-key-for-datasources-insightflow"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    CREDENTIALS_ENCRYPTION_KEY: str = "32-byte-fernet-encryption-key-for-datasources"

    # CORS Configuration
    BACKEND_CORS_ORIGINS: Annotated[
        List[str], BeforeValidator(assemble_cors_origins)
    ] = ["http://localhost:3000"]

    # Operational Postgres Configs
    POSTGRES_SERVER: str = "localhost"
    POSTGRES_USER: str = "insightflow_admin"
    POSTGRES_PASSWORD: str = "secureDBPassword123"
    POSTGRES_DB: str = "insightflow_ops"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str | None = None

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def assemble_db_connection(cls, v: str | None, values: any) -> any:
        if isinstance(v, str):
            return v
        data = values.data
        return f"postgresql+asyncpg://{data.get('POSTGRES_USER')}:{data.get('POSTGRES_PASSWORD')}@{data.get('POSTGRES_SERVER')}:{data.get('POSTGRES_PORT')}/{data.get('POSTGRES_DB')}"

    # Cache & Queues (Redis)
    REDIS_URL: str = "redis://localhost:6379/0"

    # LLM Inference (Ollama)
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    QWEN_MODEL_NAME: str = "qwen3:14b-instruct"

settings = Settings()
