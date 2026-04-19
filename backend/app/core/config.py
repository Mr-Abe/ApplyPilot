from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "ApplyPilot API"
    app_version: str = "0.1.0"
    environment: str = "development"
    api_v1_prefix: str = "/api/v1"
    database_url: str | None = None
    database_echo: bool = False
    allowed_origins: list[str] = Field(default_factory=list)
    supabase_url: str | None = None
    supabase_jwt_secret: str | None = None

    model_config = SettingsConfigDict(
        env_prefix="APPLYPILOT_",
        env_file=".env",
        case_sensitive=False,
    )

    @property
    def is_development(self) -> bool:
        return self.environment.lower() == "development"


@lru_cache
def get_settings() -> Settings:
    return Settings()
