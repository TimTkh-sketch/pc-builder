from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str = "postgresql://pc_user:pc_pass@localhost:5432/pc_builder"

    class Config:
        env_file = ".env"


settings = Settings()
