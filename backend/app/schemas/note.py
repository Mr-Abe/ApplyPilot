from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.note import NoteType


class NoteBase(BaseModel):
    note_type: NoteType = NoteType.general
    body: str = Field(min_length=1)


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    note_type: NoteType | None = None
    body: str | None = Field(default=None, min_length=1)


class NoteRead(NoteBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    application_id: UUID | None
    created_at: datetime
    updated_at: datetime


class NoteListResponse(BaseModel):
    items: list[NoteRead]
    total: int
