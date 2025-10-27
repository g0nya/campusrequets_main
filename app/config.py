from pydantic import BaseSettings

class Settings(BaseSettings):
    """Configuration settings for the FastAPI application."""
    DATABASE_URL: str
    SECRET_KEY: str
    DEBUG: bool = False

    class Config:
        env_file = ".env"

settings = Settings()