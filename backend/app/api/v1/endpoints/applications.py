from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_profile
from app.db.session import get_db_session
from app.models.application import ApplicationStatus
from app.models.profile import Profile
from app.schemas.application import (
    ApplicationCreate,
    ApplicationListResponse,
    ApplicationRead,
    ApplicationSortField,
    ApplicationUpdate,
    ArchiveFilter,
    SortOrder,
)
from app.services.applications import (
    create_application,
    delete_application,
    get_application,
    list_applications,
    update_application,
)

router = APIRouter(prefix='/applications')


@router.get('', response_model=ApplicationListResponse)
def read_applications(
    session: Annotated[Session, Depends(get_db_session)],
    profile: Annotated[Profile, Depends(get_current_profile)],
    status_filter: Annotated[ApplicationStatus | None, Query(alias='status')] = None,
    search: Annotated[str | None, Query(min_length=1, max_length=255)] = None,
    sort_by: Annotated[ApplicationSortField, Query()] = ApplicationSortField.date_applied,
    sort_order: Annotated[SortOrder, Query()] = SortOrder.desc,
    archive_filter: Annotated[ArchiveFilter, Query(alias='archive_state')] = ArchiveFilter.active,
) -> ApplicationListResponse:
    items, total = list_applications(
        session,
        profile_id=profile.id,
        status=status_filter.value if status_filter else None,
        search=search,
        sort_by=sort_by,
        sort_order=sort_order,
        archive_filter=archive_filter,
    )
    return ApplicationListResponse(items=[ApplicationRead.model_validate(item) for item in items], total=total)


@router.post('', response_model=ApplicationRead, status_code=status.HTTP_201_CREATED)
def create_application_endpoint(
    payload: ApplicationCreate,
    session: Annotated[Session, Depends(get_db_session)],
    profile: Annotated[Profile, Depends(get_current_profile)],
) -> ApplicationRead:
    application = create_application(session, profile_id=profile.id, payload=payload)
    return ApplicationRead.model_validate(application)


@router.get('/{application_id}', response_model=ApplicationRead)
def read_application(
    application_id: UUID,
    session: Annotated[Session, Depends(get_db_session)],
    profile: Annotated[Profile, Depends(get_current_profile)],
) -> ApplicationRead:
    application = get_application(session, profile_id=profile.id, application_id=application_id)
    return ApplicationRead.model_validate(application)


@router.patch('/{application_id}', response_model=ApplicationRead)
def update_application_endpoint(
    application_id: UUID,
    payload: ApplicationUpdate,
    session: Annotated[Session, Depends(get_db_session)],
    profile: Annotated[Profile, Depends(get_current_profile)],
) -> ApplicationRead:
    application = update_application(
        session,
        profile_id=profile.id,
        application_id=application_id,
        payload=payload,
    )
    return ApplicationRead.model_validate(application)


@router.delete('/{application_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_application_endpoint(
    application_id: UUID,
    session: Annotated[Session, Depends(get_db_session)],
    profile: Annotated[Profile, Depends(get_current_profile)],
) -> Response:
    delete_application(session, profile_id=profile.id, application_id=application_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
