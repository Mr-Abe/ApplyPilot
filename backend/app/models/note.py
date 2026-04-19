from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.application import Application
    from app.models.contact import Contact
    from app.models.profile import Profile


class Note(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = "notes"
    __table_args__ = (Index("ix_notes_profile_id", "profile_id"),)

    profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    application_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=True,
    )
    contact_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("contacts.id", ondelete="CASCADE"),
        nullable=True,
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)

    profile: Mapped[Profile] = relationship(back_populates="notes")
    application: Mapped[Application | None] = relationship(back_populates="notes")
    contact: Mapped[Contact | None] = relationship(back_populates="notes")
