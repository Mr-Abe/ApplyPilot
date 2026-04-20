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
    jwks_url = f'{supabase_url}/auth/v1/.well-known/jwks.json'

    try:
        unverified_header = jwt.get_unverified_header(token)
        alg = unverified_header.get('alg', 'HS256')

        if alg in ['RS256', 'ES256']:
            jwks_client = jwt.PyJWKClient(jwks_url)
            signing_key = jwks_client.get_signing_key_from_jwt(token)
            key = signing_key.key
        else:
            key = jwt_secret

        return jwt.decode(
            token,
            key,
            algorithms=[alg],
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
