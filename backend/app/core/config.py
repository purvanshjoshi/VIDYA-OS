import os
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # HuggingFace Inference API (replaces local model loading)
    HF_API_TOKEN: str = ""
    HF_MODEL_ID: str = "meta-llama/Llama-3.2-3B-Instruct"  # High compatibility on HF Router

    # RAG Configuration (Qdrant Cloud)
    QDRANT_URL: str = "http://localhost:6333"
    QDRANT_API_KEY: str = ""
    COLLECTION_NAME: str = "vidya_sovereign"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"

    # Database
    DATABASE_URL: str = "sqlite:///./vidya_os.db"

    # CORS — set to your Vercel frontend URL in production
    FRONTEND_URL: str = "*"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()

# Support standard HF_TOKEN secret if HF_API_TOKEN is not set
if not settings.HF_API_TOKEN:
    settings.HF_API_TOKEN = os.getenv("HF_TOKEN", "")
