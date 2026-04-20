from typing import Annotated

from fastapi import Depends, Header
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.db.session import get_db_session
from app.models.profile import Profile
from app.schemas.auth import CurrentUser
from app.services.auth import get_current_user_from_token
from app.services.profiles import get_or_create_profile


async def get_bearer_token(
    authorization: Annotated[str | None, Header()] = None,
) -> str | None:
    if not authorization:
        return None

    scheme, _, token = authorization.partition(' ')
    if scheme.lower() != 'bearer' or not token:
        raise AppError(
            status_code=401,
            code='invalid_authorization_header',
            message='Authorization header must use Bearer token format.',
        )

    return token


async def require_bearer_token(
    authorization: Annotated[str | None, Header(alias='Authorization')] = None,
) -> str:
    parsed_token = await get_bearer_token(authorization)
    if parsed_token is None:
        raise AppError(
            status_code=401,
            code='authentication_required',
            message='Authentication is required for this resource.',
        )

    return parsed_token


async def get_current_user(token: Annotated[str, Depends(require_bearer_token)]) -> CurrentUser:
    return get_current_user_from_token(token)


def get_current_profile(
    session: Annotated[Session, Depends(get_db_session)],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> Profile:
    return get_or_create_profile(session, current_user)
