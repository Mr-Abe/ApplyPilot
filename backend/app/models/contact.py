from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.application_contact import ApplicationContact
    from app.models.note import Note
    from app.models.profile import Profile
    from app.models.task import Task


class Contact(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = 'contacts'
    __table_args__ = (Index('ix_contacts_profile_id', 'profile_id'),)

    profile_id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        ForeignKey('profiles.id', ondelete='CASCADE'),
        nullable=False,
    )
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    title: Mapped[str | None] = mapped_column(String(255), nullable=True)
    company: Mapped[str | None] = mapped_column(String(255), nullable=True)
    linkedin_url: Mapped[str | None] = mapped_column(String(2048), nullable=True)

    profile: Mapped[Profile] = relationship(back_populates='contacts')
    application_links: Mapped[list[ApplicationContact]] = relationship(back_populates='contact', cascade='all, delete-orphan')
    tasks: Mapped[list[Task]] = relationship(back_populates='contact', cascade='all, delete-orphan')
    notes: Mapped[list[Note]] = relationship(back_populates='contact', cascade='all, delete-orphan')
