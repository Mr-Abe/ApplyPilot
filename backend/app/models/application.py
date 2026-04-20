from __future__ import annotations

import enum
import uuid
from datetime import date, datetime
from typing import TYPE_CHECKING

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Index, Integer, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.application_contact import ApplicationContact
    from app.models.note import Note
    from app.models.profile import Profile
    from app.models.task import Task


class ApplicationStatus(str, enum.Enum):
    wishlist = 'wishlist'
    applying = 'applying'
    applied = 'applied'
    screening = 'screening'
    interview = 'interview'
    final_round = 'final_round'
    offer = 'offer'
    rejected = 'rejected'
    withdrawn = 'withdrawn'


class Application(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = 'applications'
    __table_args__ = (
        Index('ix_applications_profile_id', 'profile_id'),
        Index('ix_applications_profile_id_status', 'profile_id', 'status'),
        Index('ix_applications_profile_id_archived', 'profile_id', 'archived'),
        Index('ix_applications_profile_id_date_applied', 'profile_id', 'date_applied'),
        Index('ix_applications_profile_id_next_action_due_at', 'profile_id', 'next_action_due_at'),
    )

    profile_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey('profiles.id', ondelete='CASCADE'),
        nullable=False,
    )
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    job_title: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    work_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    source: Mapped[str | None] = mapped_column(String(255), nullable=True)
    posting_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    salary_min: Mapped[int | None] = mapped_column(Integer, nullable=True)
    salary_max: Mapped[int | None] = mapped_column(Integer, nullable=True)
    resume_version: Mapped[str | None] = mapped_column(String(255), nullable=True)
    cover_letter_version: Mapped[str | None] = mapped_column(String(255), nullable=True)
    date_found: Mapped[date | None] = mapped_column(Date, nullable=True)
    date_applied: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, name='application_status', values_callable=lambda values: [value.value for value in values]),
        default=ApplicationStatus.wishlist,
        server_default=ApplicationStatus.wishlist.value,
        nullable=False,
    )
    next_action: Mapped[str | None] = mapped_column(String(255), nullable=True)
    next_action_due_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    notes_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    archived: Mapped[bool] = mapped_column(Boolean, default=False, server_default='false', nullable=False)

    profile: Mapped[Profile] = relationship(back_populates='applications')
    contact_links: Mapped[list[ApplicationContact]] = relationship(back_populates='application', cascade='all, delete-orphan')
    tasks: Mapped[list[Task]] = relationship(back_populates='application', cascade='all, delete-orphan')
    notes: Mapped[list[Note]] = relationship(back_populates='application', cascade='all, delete-orphan')
