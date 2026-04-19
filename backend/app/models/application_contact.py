from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

from sqlalchemy import DateTime, ForeignKey, Index, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.application import Application
    from app.models.contact import Contact
    from app.models.profile import Profile


class ApplicationContact(UUIDPrimaryKeyMixin, Base):
    __tablename__ = "application_contacts"
    __table_args__ = (
        UniqueConstraint("application_id", "contact_id"),
        Index("ix_application_contacts_profile_id", "profile_id"),
    )

    profile_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("profiles.id", ondelete="CASCADE"),
        nullable=False,
    )
    application_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("applications.id", ondelete="CASCADE"),
        nullable=False,
    )
    contact_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("contacts.id", ondelete="CASCADE"),
        nullable=False,
    )
    relationship_type: Mapped[str | None] = mapped_column(String(100), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    profile: Mapped[Profile] = relationship(back_populates="application_contacts")
    application: Mapped[Application] = relationship(back_populates="contact_links")
    contact: Mapped[Contact] = relationship(back_populates="application_links")
