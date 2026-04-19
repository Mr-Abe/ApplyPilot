from __future__ import annotations

import enum
import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, Enum, ForeignKey, Index, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.application_contact import ApplicationContact
    from app.models.note import Note
    from app.models.profile import Profile
    from app.models.task import Task


class ApplicationStatus(str, enum.Enum):
    wishlist = "wishlist"
    applying = "applying"
    applied = "applied"
    screening = "screening"
    interview = "interview"
    final_round = "final_round"
    offer = "offer"
    rejected = "rejected"
    withdrawn = "withdrawn"


class Application(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "applications"
    __table_args__ = (
        Index("ix_applications_profile_id", "profile_id"),
        Index("ix_applications_profile_id_status", "profile_id", "status"),
    )

    profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    company_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role_title: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[ApplicationStatus] = mapped_column(
        Enum(ApplicationStatus, name="application_status", values_callable=lambda values: [value.value for value in values]),
        default=ApplicationStatus.wishlist,
        server_default=ApplicationStatus.wishlist.value,
        nullable=False,
    )
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    job_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    source: Mapped[str | None] = mapped_column(String(255), nullable=True)
    applied_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    profile: Mapped[Profile] = relationship(back_populates="applications")
    contact_links: Mapped[list[ApplicationContact]] = relationship(back_populates="application", cascade="all, delete-orphan")
    tasks: Mapped[list[Task]] = relationship(back_populates="application", cascade="all, delete-orphan")
    notes: Mapped[list[Note]] = relationship(back_populates="application", cascade="all, delete-orphan")
