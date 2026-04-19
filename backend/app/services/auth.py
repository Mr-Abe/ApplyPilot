from app.core.security import build_current_user, verify_supabase_access_token
from app.schemas.auth import CurrentUser


def get_current_user_from_token(token: str) -> CurrentUser:
    payload = verify_supabase_access_token(token)
    return build_current_user(payload)
