from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.application import Application
    from app.models.contact import Contact
    from app.models.profile import Profile


class TaskStatus(str, enum.Enum):
    open = 'open'
    completed = 'completed'


class TaskPriority(str, enum.Enum):
    low = 'low'
    medium = 'medium'
    high = 'high'


class Task(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = 'tasks'
    __table_args__ = (
        Index('ix_tasks_profile_id_due_at', 'profile_id', 'due_at'),
        Index('ix_tasks_profile_id_status', 'profile_id', 'status'),
    )

    profile_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey('profiles.id', ondelete='CASCADE'),
        nullable=False,
    )
    application_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        ForeignKey('applications.id', ondelete='CASCADE'),
        nullable=True,
    )
    contact_id: Mapped[uuid.UUID | None] = mapped_column(
        Uuid,
        ForeignKey('contacts.id', ondelete='CASCADE'),
        nullable=True,
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[TaskStatus] = mapped_column(
        Enum(TaskStatus, name='task_status', values_callable=lambda values: [value.value for value in values]),
        default=TaskStatus.open,
        server_default=TaskStatus.open.value,
        nullable=False,
    )
    priority: Mapped[TaskPriority] = mapped_column(
        Enum(TaskPriority, name='task_priority', values_callable=lambda values: [value.value for value in values]),
        default=TaskPriority.medium,
        server_default=TaskPriority.medium.value,
        nullable=False,
    )
    due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    profile: Mapped[Profile] = relationship(back_populates='tasks')
    application: Mapped[Application | None] = relationship(back_populates='tasks')
    contact: Mapped[Contact | None] = relationship(back_populates='tasks')
