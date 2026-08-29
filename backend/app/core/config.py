from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongo_uri: str
    mongo_db_name: str = "gym_app"

    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    brevo_api_key: str
    brevo_sender_email: str
    brevo_sender_name: str = "Fit-Track"

    otp_expire_minutes: int = 10
    otp_max_attempts: int = 5

    gemini_api_key: str
    gemini_model: str = "gemini-3.5-flash-lite"

    youtube_api_key: str

    # Comma-separated list, e.g. "http://localhost:5173,https://your-app.vercel.app"
    allowed_origins: str = "http://localhost:5173"

    class Config:
        env_file = ".env"


settings = Settings()
