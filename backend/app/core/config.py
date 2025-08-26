from pydantic_settings import BaseSettings
from pydantic import Field


class Settings(BaseSettings):
	app_name: str = Field(default="Lottery Service")
	api_prefix: str = Field(default="/api")
	secret_key: str = Field(default="change-me")
	algorithm: str = Field(default="HS256")
	access_token_expires_minutes: int = Field(default=60 * 24)

	database_url: str = Field(default="mysql+pymysql://root:password@mysql:3306/lottery?charset=utf8mb4")
	redis_url: str = Field(default="redis://redis:6379/0")

	cors_origins: list[str] = Field(default_factory=lambda: ["*"])

	default_admin_username: str = Field(default="admin")
	default_admin_password: str = Field(default="admin123")

	class Config:
		env_file = ".env"
		env_file_encoding = "utf-8"


settings = Settings()