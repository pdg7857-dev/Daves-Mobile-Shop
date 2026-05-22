from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    anthropic_api_key: str = ""

    messenger_verify_token: str = "change-me"
    messenger_page_access_token: str = ""
    messenger_app_secret: str = ""

    business_name: str = "Dave's Mobile Shop"
    business_hours: str = "Mon-Sat 9am-6pm"
    bot_model: str = "claude-sonnet-4-6"
    bot_max_tokens: int = 1024

    # Storage. "sqlite" persists to `db_path`; "memory" stays in-process.
    store_backend: str = "sqlite"
    db_path: str = "data/shop.db"

    # Admin dashboard
    admin_username: str = "admin"
    admin_password: str = ""  # disable dashboard auth-fail-open if blank? No — empty = locked.


@lru_cache
def get_settings() -> Settings:
    return Settings()
