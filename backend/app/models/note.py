from __future__ import annotations

import enum
import uuid
from typing import TYPE_CHECKING

from sqlalchemy import Enum, ForeignKey, Index, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.application import Application
    from app.models.contact import Contact
    from app.models.profile import Profile


class NoteType(str, enum.Enum):
    general = 'general'
    interview = 'interview'
    call = 'call'
    followup = 'followup'


class Note(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = 'notes'
    __table_args__ = (
        Index('ix_notes_profile_id', 'profile_id'),
        Index('ix_notes_profile_id_application_id', 'profile_id', 'application_id'),
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
    note_type: Mapped[NoteType] = mapped_column(
        Enum(NoteType, name='note_type', values_callable=lambda values: [value.value for value in values]),
        default=NoteType.general,
        server_default=NoteType.general.value,
        nullable=False,
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)

    profile: Mapped[Profile] = relationship(back_populates='notes')
    application: Mapped[Application | None] = relationship(back_populates='notes')
    contact: Mapped[Contact | None] = relationship(back_populates='note_entries')
