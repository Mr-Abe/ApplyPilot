from __future__ import annotations

from uuid import UUID

from sqlalchemy import Select, func, or_, select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.application import Application
from app.schemas.application import ApplicationCreate, ApplicationUpdate, ArchiveFilter, ApplicationSortField, SortOrder


def _serialize_payload(payload: ApplicationCreate | ApplicationUpdate) -> dict:
    data = payload.model_dump(exclude_unset=True)
    if 'posting_url' in data and data['posting_url'] is not None:
        data['posting_url'] = str(data['posting_url'])
    return data


def _apply_filters(
    query: Select[tuple[Application]],
    *,
    profile_id: UUID,
    status: str | None,
    search: str | None,
    archive_filter: ArchiveFilter,
) -> Select[tuple[Application]]:
    query = query.where(Application.profile_id == profile_id)

    if status:
        query = query.where(Application.status == status)

    if search:
        pattern = f'%{search.strip()}%'
        query = query.where(
            or_(
                Application.company_name.ilike(pattern),
                Application.job_title.ilike(pattern),
            )
        )

    if archive_filter == ArchiveFilter.active:
        query = query.where(Application.archived.is_(False))
    elif archive_filter == ArchiveFilter.archived:
        query = query.where(Application.archived.is_(True))

    return query


def _apply_sorting(
    query: Select[tuple[Application]],
    *,
    sort_by: ApplicationSortField,
    sort_order: SortOrder,
) -> Select[tuple[Application]]:
    sort_column = Application.date_applied if sort_by == ApplicationSortField.date_applied else Application.next_action_due_at
    direction = sort_column.asc() if sort_order == SortOrder.asc else sort_column.desc()
    return query.order_by(sort_column.is_(None), direction, Application.created_at.desc())


def list_applications(
    session: Session,
    *,
    profile_id: UUID,
    status: str | None,
    search: str | None,
    sort_by: ApplicationSortField,
    sort_order: SortOrder,
    archive_filter: ArchiveFilter,
) -> tuple[list[Application], int]:
    base_query = _apply_filters(
        select(Application),
        profile_id=profile_id,
        status=status,
        search=search,
        archive_filter=archive_filter,
    )
    count_query = _apply_filters(
        select(func.count(Application.id)),
        profile_id=profile_id,
        status=status,
        search=search,
        archive_filter=archive_filter,
    )

    items = list(session.scalars(_apply_sorting(base_query, sort_by=sort_by, sort_order=sort_order)).all())
    total = session.scalar(count_query) or 0
    return items, total


def get_application(session: Session, *, profile_id: UUID, application_id: UUID) -> Application:
    application = session.scalar(
        select(Application).where(
            Application.id == application_id,
            Application.profile_id == profile_id,
        )
    )
    if application is None:
        raise AppError(status_code=404, code='application_not_found', message='Application not found.')
    return application


def create_application(session: Session, *, profile_id: UUID, payload: ApplicationCreate) -> Application:
    application = Application(profile_id=profile_id, **_serialize_payload(payload))
    session.add(application)
    session.commit()
    session.refresh(application)
    return application


def update_application(
    session: Session,
    *,
    profile_id: UUID,
    application_id: UUID,
    payload: ApplicationUpdate,
) -> Application:
    application = get_application(session, profile_id=profile_id, application_id=application_id)

    for field, value in _serialize_payload(payload).items():
        setattr(application, field, value)

    session.add(application)
    session.commit()
    session.refresh(application)
    return application


def delete_application(session: Session, *, profile_id: UUID, application_id: UUID) -> None:
    application = get_application(session, profile_id=profile_id, application_id=application_id)
    session.delete(application)
    session.commit()
