from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel

from app.models.application import ApplicationStatus
from app.models.task import TaskPriority, TaskStatus


class DashboardSummary(BaseModel):
    active_applications: int
    open_tasks: int
    overdue_tasks: int
    upcoming_tasks: int


class DashboardStatusItem(BaseModel):
    status: ApplicationStatus
    count: int


class DashboardStatusBreakdown(BaseModel):
    items: list[DashboardStatusItem]


class DashboardTaskItem(BaseModel):
    id: UUID
    title: str
    priority: TaskPriority
    status: TaskStatus
    due_at: datetime | None
    application_id: UUID | None
    application_company_name: str | None
    application_job_title: str | None


class DashboardTaskListResponse(BaseModel):
    items: list[DashboardTaskItem]
    total: int
