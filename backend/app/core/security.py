from typing import Any
from uuid import UUID

import jwt
from jwt import InvalidTokenError

from app.core.config import get_settings
from app.core.errors import AppError
from app.schemas.auth import CurrentUser


def ensure_supabase_auth_is_configured() -> tuple[str, str]:
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_jwt_secret:
        raise AppError(
            status_code=500,
            code="supabase_auth_not_configured",
            message="Supabase authentication settings are not configured.",
        )

    return settings.supabase_url.rstrip('/'), settings.supabase_jwt_secret


def verify_supabase_access_token(token: str) -> dict[str, Any]:
    supabase_url, jwt_secret = ensure_supabase_auth_is_configured()
    issuer = f'{supabase_url}/auth/v1'

    try:
        return jwt.decode(
            token,
            jwt_secret,
            algorithms=['HS256'],
            audience='authenticated',
            issuer=issuer,
            options={'require': ['exp', 'sub']},
        )
    except InvalidTokenError as exc:
        raise AppError(
            status_code=401,
            code='invalid_access_token',
            message='The supplied access token is invalid or expired.',
        ) from exc


def build_current_user(payload: dict[str, Any]) -> CurrentUser:
    subject = payload.get('sub')
    if not subject:
        raise AppError(
            status_code=401,
            code='invalid_access_token_subject',
            message='The supplied access token is missing a valid subject.',
        )

    try:
        user_id = UUID(subject)
    except ValueError as exc:
        raise AppError(
            status_code=401,
            code='invalid_access_token_subject',
            message='The supplied access token subject is not a valid UUID.',
        ) from exc

    return CurrentUser(
        user_id=user_id,
        email=payload.get('email'),
        role=payload.get('role'),
    )
