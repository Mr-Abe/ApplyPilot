from typing import Annotated

from fastapi import Depends, Header

from app.core.errors import AppError
from app.schemas.auth import CurrentUser
from app.services.auth import get_current_user_from_token


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
