from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_NAME: str = "ShadowAI"
    ENV: str = "development"  # development | demo | production
    SECRET_KEY: str = "CHANGE_ME_IN_PRODUCTION"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"

    # When ENV=demo or MONGO_URI is unset, the app uses an in-memory
    # Mongo-compatible engine (mongomock) so it runs with zero external
    # services. Set MONGO_URI to a real MongoDB Atlas connection string
    # in production and it uses the real driver instead — no code changes.
    MONGO_URI: str | None = None
    MONGO_DB_NAME: str = "shadowai"

    GEMINI_API_KEY: str | None = None

    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    MAX_UPLOAD_SIZE_MB: int = 5


settings = Settings()
