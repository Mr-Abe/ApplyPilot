from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.application import Application, ApplicationStatus
from app.models.task import Task, TaskStatus
from app.schemas.dashboard import DashboardStatusItem, DashboardSummary, DashboardTaskItem


def get_dashboard_summary(session: Session, *, profile_id: UUID) -> DashboardSummary:
    now = datetime.now(UTC)

    active_applications = session.scalar(
        select(func.count(Application.id)).where(
            Application.profile_id == profile_id,
            Application.archived.is_(False),
        )
    ) or 0
    open_tasks = session.scalar(
        select(func.count(Task.id)).where(
            Task.profile_id == profile_id,
            Task.status == TaskStatus.open,
        )
    ) or 0
    overdue_tasks = session.scalar(
        select(func.count(Task.id)).where(
            Task.profile_id == profile_id,
            Task.status == TaskStatus.open,
            Task.due_at.is_not(None),
            Task.due_at < now,
        )
    ) or 0
    upcoming_tasks = session.scalar(
        select(func.count(Task.id)).where(
            Task.profile_id == profile_id,
            Task.status == TaskStatus.open,
            Task.due_at.is_not(None),
            Task.due_at >= now,
        )
    ) or 0

    return DashboardSummary(
        active_applications=active_applications,
        open_tasks=open_tasks,
        overdue_tasks=overdue_tasks,
        upcoming_tasks=upcoming_tasks,
    )


def get_status_breakdown(session: Session, *, profile_id: UUID) -> list[DashboardStatusItem]:
    rows = session.execute(
        select(Application.status, func.count(Application.id))
        .where(
            Application.profile_id == profile_id,
            Application.archived.is_(False),
        )
        .group_by(Application.status)
    ).all()

    counts = {
        (status if isinstance(status, ApplicationStatus) else ApplicationStatus(status)): count
        for status, count in rows
    }

    return [
        DashboardStatusItem(status=status, count=counts.get(status, 0))
        for status in ApplicationStatus
    ]


def _list_task_items(
    session: Session,
    *,
    profile_id: UUID,
    is_overdue: bool,
    limit: int,
) -> tuple[list[DashboardTaskItem], int]:
    now = datetime.now(UTC)

    filters = [
        Task.profile_id == profile_id,
        Task.status == TaskStatus.open,
        Task.due_at.is_not(None),
        Task.due_at < now if is_overdue else Task.due_at >= now,
    ]

    rows = session.execute(
        select(Task, Application.company_name, Application.job_title)
        .outerjoin(Application, Application.id == Task.application_id)
        .where(*filters)
        .order_by(Task.due_at.asc(), Task.created_at.desc())
        .limit(limit)
    ).all()

    total = session.scalar(select(func.count(Task.id)).where(*filters)) or 0

    items = [
        DashboardTaskItem(
            id=task.id,
            title=task.title,
            priority=task.priority,
            status=task.status,
            due_at=task.due_at,
            application_id=task.application_id,
            application_company_name=company_name,
            application_job_title=job_title,
        )
        for task, company_name, job_title in rows
    ]
    return items, total


def list_overdue_tasks(session: Session, *, profile_id: UUID, limit: int) -> tuple[list[DashboardTaskItem], int]:
    return _list_task_items(session, profile_id=profile_id, is_overdue=True, limit=limit)


def list_upcoming_tasks(session: Session, *, profile_id: UUID, limit: int) -> tuple[list[DashboardTaskItem], int]:
    return _list_task_items(session, profile_id=profile_id, is_overdue=False, limit=limit)
