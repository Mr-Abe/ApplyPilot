from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import Self
from uuid import UUID

from pydantic import AnyHttpUrl, BaseModel, ConfigDict, Field, model_validator

from app.models.application import ApplicationStatus


class ApplicationSortField(str, Enum):
    date_applied = 'date_applied'
    next_action_due_at = 'next_action_due_at'


class SortOrder(str, Enum):
    asc = 'asc'
    desc = 'desc'


class ArchiveFilter(str, Enum):
    active = 'active'
    archived = 'archived'
    all = 'all'


class ApplicationBase(BaseModel):
    company_name: str = Field(min_length=1, max_length=255)
    job_title: str = Field(min_length=1, max_length=255)
    location: str | None = Field(default=None, max_length=255)
    work_type: str | None = Field(default=None, max_length=100)
    source: str | None = Field(default=None, max_length=255)
    posting_url: AnyHttpUrl | None = None
    salary_min: int | None = Field(default=None, ge=0)
    salary_max: int | None = Field(default=None, ge=0)
    resume_version: str | None = Field(default=None, max_length=255)
    cover_letter_version: str | None = Field(default=None, max_length=255)
    date_found: date | None = None
    date_applied: date | None = None
    status: ApplicationStatus = ApplicationStatus.wishlist
    next_action: str | None = Field(default=None, max_length=255)
    next_action_due_at: datetime | None = None
    notes_summary: str | None = Field(default=None, max_length=4000)
    archived: bool = False

    @model_validator(mode='after')
    def validate_salary_range(self) -> Self:
        if self.salary_min is not None and self.salary_max is not None and self.salary_max < self.salary_min:
            raise ValueError('salary_max must be greater than or equal to salary_min.')
        return self


class ApplicationCreate(ApplicationBase):
    pass


class ApplicationUpdate(BaseModel):
    company_name: str | None = Field(default=None, min_length=1, max_length=255)
    job_title: str | None = Field(default=None, min_length=1, max_length=255)
    location: str | None = Field(default=None, max_length=255)
    work_type: str | None = Field(default=None, max_length=100)
    source: str | None = Field(default=None, max_length=255)
    posting_url: AnyHttpUrl | None = None
    salary_min: int | None = Field(default=None, ge=0)
    salary_max: int | None = Field(default=None, ge=0)
    resume_version: str | None = Field(default=None, max_length=255)
    cover_letter_version: str | None = Field(default=None, max_length=255)
    date_found: date | None = None
    date_applied: date | None = None
    status: ApplicationStatus | None = None
    next_action: str | None = Field(default=None, max_length=255)
    next_action_due_at: datetime | None = None
    notes_summary: str | None = Field(default=None, max_length=4000)
    archived: bool | None = None

    @model_validator(mode='after')
    def validate_payload(self) -> Self:
        if not self.model_fields_set:
            raise ValueError('At least one field must be provided.')

        if self.salary_min is not None and self.salary_max is not None and self.salary_max < self.salary_min:
            raise ValueError('salary_max must be greater than or equal to salary_min.')
        return self


class ApplicationRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    company_name: str
    job_title: str
    location: str | None
    work_type: str | None
    source: str | None
    posting_url: str | None
    salary_min: int | None
    salary_max: int | None
    resume_version: str | None
    cover_letter_version: str | None
    date_found: date | None
    date_applied: date | None
    status: ApplicationStatus
    next_action: str | None
    next_action_due_at: datetime | None
    notes_summary: str | None
    archived: bool
    created_at: datetime
    updated_at: datetime


class ApplicationListResponse(BaseModel):
    items: list[ApplicationRead]
    total: int
