from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    database_url: str = "sqlite:///./snipurl.db"
    redis_url: str = "redis://localhost:6379"
    secret_key: str = "change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    base_url: str = "http://localhost:10000"
    short_code_length: int = 7

    rate_limit_default: str = "60/minute"
    rate_limit_create: str = "20/minute"
    rate_limit_redirect: str = "200/minute"

    cors_origins: List[str] = ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Force SQLite for local development
        if "postgresql://" in self.database_url:
            self.database_url = "sqlite:///./snipurl.db"


settings = Settings()
