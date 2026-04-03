from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    database_url: str = "postgresql://postgres:password@localhost:5432/snipurl"
    redis_url: str = "redis://localhost:6379"
    secret_key: str = "change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    base_url: str = "http://localhost:8000"
    short_code_length: int = 7

    rate_limit_default: str = "60/minute"
    rate_limit_create: str = "20/minute"
    rate_limit_redirect: str = "200/minute"

    cors_origins: List[str] = ["*"]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
