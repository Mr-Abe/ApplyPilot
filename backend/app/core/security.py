from app.core.config import get_settings
from app.core.errors import AppError


def ensure_supabase_auth_is_configured() -> None:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_jwt_secret:
        raise AppError(
            status_code=500,
            code="supabase_auth_not_configured",
            message="Supabase authentication settings are not configured.",
        )
