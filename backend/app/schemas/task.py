from __future__ import annotations

from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.task import TaskPriority, TaskStatus


class TaskTimingFilter(str, Enum):
    all = 'all'
    overdue = 'overdue'
    upcoming = 'upcoming'


class TaskBase(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None
    status: TaskStatus = TaskStatus.open
    due_at: datetime | None = None
    completed_at: datetime | None = None
    priority: TaskPriority = TaskPriority.medium
    application_id: UUID | None = None

    @model_validator(mode='after')
    def validate_completed_state(self) -> 'TaskBase':
        if self.status == TaskStatus.completed and self.completed_at is None:
            return self

        if self.status == TaskStatus.open and self.completed_at is not None:
            raise ValueError('completed_at can only be set when the task status is completed.')

        return self


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    status: TaskStatus | None = None
    due_at: datetime | None = None
    completed_at: datetime | None = None
    priority: TaskPriority | None = None
    application_id: UUID | None = None

    @model_validator(mode='after')
    def validate_completed_state(self) -> 'TaskUpdate':
        if self.status == TaskStatus.open and self.completed_at is not None:
            raise ValueError('completed_at can only be set when the task status is completed.')

        return self


class TaskRead(TaskBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


class TaskListResponse(BaseModel):
    items: list[TaskRead]
    total: int
