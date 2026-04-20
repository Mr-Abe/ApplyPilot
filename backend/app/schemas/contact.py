from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import AnyHttpUrl, BaseModel, ConfigDict, Field


class ContactBase(BaseModel):
    company_name: str | None = Field(default=None, max_length=255)
    full_name: str = Field(min_length=1, max_length=255)
    title: str | None = Field(default=None, max_length=255)
    email: str | None = Field(default=None, max_length=320)
    linkedin_url: AnyHttpUrl | None = None
    phone: str | None = Field(default=None, max_length=50)
    notes: str | None = None


class ContactCreate(ContactBase):
    pass


class ContactUpdate(BaseModel):
    company_name: str | None = Field(default=None, max_length=255)
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    title: str | None = Field(default=None, max_length=255)
    email: str | None = Field(default=None, max_length=320)
    linkedin_url: AnyHttpUrl | None = None
    phone: str | None = Field(default=None, max_length=50)
    notes: str | None = None


class ContactRead(ContactBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


class ContactListResponse(BaseModel):
    items: list[ContactRead]
    total: int

