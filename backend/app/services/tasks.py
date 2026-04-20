from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.application import Application
from app.models.task import Task, TaskStatus
from app.schemas.task import TaskCreate, TaskTimingFilter, TaskUpdate


def _serialize_payload(payload: TaskCreate | TaskUpdate) -> dict:
    data = payload.model_dump(exclude_unset=True)

    status = data.get('status')
    completed_at = data.get('completed_at')

    if status == TaskStatus.completed and completed_at is None:
        data['completed_at'] = datetime.now(UTC)
    elif status == TaskStatus.open and 'completed_at' not in data:
        data['completed_at'] = None
    elif status is None and completed_at is not None:
        data['status'] = TaskStatus.completed

    return data


def _validate_application(session: Session, *, profile_id: UUID, application_id: UUID | None) -> None:
    if application_id is None:
        return

    application = session.scalar(
        select(Application).where(Application.id == application_id, Application.profile_id == profile_id)
    )
    if application is None:
        raise AppError(status_code=404, code='application_not_found', message='Application not found.')


def _apply_filters(
    query: Select[tuple[Task]],
    *,
    profile_id: UUID,
    status: TaskStatus | None,
    application_id: UUID | None,
    timing: TaskTimingFilter,
) -> Select[tuple[Task]]:
    query = query.where(Task.profile_id == profile_id)

    if status is not None:
        query = query.where(Task.status == status)

    if application_id is not None:
        query = query.where(Task.application_id == application_id)

    now = datetime.now(UTC)
    if timing == TaskTimingFilter.overdue:
        query = query.where(Task.status == TaskStatus.open, Task.due_at.is_not(None), Task.due_at < now)
    elif timing == TaskTimingFilter.upcoming:
        query = query.where(Task.status == TaskStatus.open, Task.due_at.is_not(None), Task.due_at >= now)

    return query


def list_tasks(
    session: Session,
    *,
    profile_id: UUID,
    status: TaskStatus | None,
    application_id: UUID | None,
    timing: TaskTimingFilter,
) -> tuple[list[Task], int]:
    _validate_application(session, profile_id=profile_id, application_id=application_id)

    base_query = _apply_filters(
        select(Task),
        profile_id=profile_id,
        status=status,
        application_id=application_id,
        timing=timing,
    )
    count_query = _apply_filters(
        select(func.count(Task.id)),
        profile_id=profile_id,
        status=status,
        application_id=application_id,
        timing=timing,
    )

    items = list(
        session.scalars(
            base_query.order_by(Task.due_at.is_(None), Task.due_at.asc(), Task.created_at.desc())
        ).all()
    )
    total = session.scalar(count_query) or 0
    return items, total


def get_task(session: Session, *, profile_id: UUID, task_id: UUID) -> Task:
    task = session.scalar(select(Task).where(Task.id == task_id, Task.profile_id == profile_id))
    if task is None:
        raise AppError(status_code=404, code='task_not_found', message='Task not found.')
    return task


def create_task(session: Session, *, profile_id: UUID, payload: TaskCreate) -> Task:
    data = _serialize_payload(payload)
    _validate_application(session, profile_id=profile_id, application_id=data.get('application_id'))

    task = Task(profile_id=profile_id, **data)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def update_task(session: Session, *, profile_id: UUID, task_id: UUID, payload: TaskUpdate) -> Task:
    task = get_task(session, profile_id=profile_id, task_id=task_id)
    data = _serialize_payload(payload)
    _validate_application(session, profile_id=profile_id, application_id=data.get('application_id', task.application_id))

    for field, value in data.items():
        setattr(task, field, value)

    if 'status' in data and data['status'] == TaskStatus.open and 'completed_at' not in data:
        task.completed_at = None

    session.add(task)
    session.commit()
    session.refresh(task)
    return task


def delete_task(session: Session, *, profile_id: UUID, task_id: UUID) -> None:
    task = get_task(session, profile_id=profile_id, task_id=task_id)
    session.delete(task)
    session.commit()
