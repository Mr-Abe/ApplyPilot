from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

from sqlalchemy import String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base, TimestampMixin, UUIDPrimaryKeyMixin

if TYPE_CHECKING:
    from app.models.application import Application
    from app.models.application_contact import ApplicationContact
    from app.models.contact import Contact
    from app.models.note import Note
    from app.models.task import Task


class Profile(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    __tablename__ = 'profiles'

    supabase_user_id: Mapped[uuid.UUID] = mapped_column(Uuid, unique=True, nullable=False)
    email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    display_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    applications: Mapped[list[Application]] = relationship(back_populates='profile', cascade='all, delete-orphan')
    contacts: Mapped[list[Contact]] = relationship(back_populates='profile', cascade='all, delete-orphan')
    application_contacts: Mapped[list[ApplicationContact]] = relationship(back_populates='profile', cascade='all, delete-orphan')
    tasks: Mapped[list[Task]] = relationship(back_populates='profile', cascade='all, delete-orphan')
    notes: Mapped[list[Note]] = relationship(back_populates='profile', cascade='all, delete-orphan')
