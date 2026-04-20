from __future__ import annotations

from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.application import Application
from app.models.note import Note
from app.schemas.note import NoteCreate, NoteUpdate


def _serialize_payload(payload: NoteCreate | NoteUpdate) -> dict:
    return payload.model_dump(exclude_unset=True)


def _get_application(session: Session, *, profile_id: UUID, application_id: UUID) -> Application:
    application = session.scalar(
        select(Application).where(Application.id == application_id, Application.profile_id == profile_id)
    )
    if application is None:
        raise AppError(status_code=404, code='application_not_found', message='Application not found.')
    return application


def list_notes(session: Session, *, profile_id: UUID, application_id: UUID) -> tuple[list[Note], int]:
    _get_application(session, profile_id=profile_id, application_id=application_id)

    items = list(
        session.scalars(
            select(Note)
            .where(Note.profile_id == profile_id, Note.application_id == application_id)
            .order_by(Note.updated_at.desc(), Note.created_at.desc())
        ).all()
    )
    total = session.scalar(
        select(func.count(Note.id)).where(Note.profile_id == profile_id, Note.application_id == application_id)
    ) or 0
    return items, total


def get_note(session: Session, *, profile_id: UUID, application_id: UUID, note_id: UUID) -> Note:
    note = session.scalar(
        select(Note).where(
            Note.id == note_id,
            Note.profile_id == profile_id,
            Note.application_id == application_id,
        )
    )
    if note is None:
        _get_application(session, profile_id=profile_id, application_id=application_id)
        raise AppError(status_code=404, code='note_not_found', message='Note not found.')
    return note


def create_note(session: Session, *, profile_id: UUID, application_id: UUID, payload: NoteCreate) -> Note:
    _get_application(session, profile_id=profile_id, application_id=application_id)

    note = Note(profile_id=profile_id, application_id=application_id, contact_id=None, **_serialize_payload(payload))
    session.add(note)
    session.commit()
    session.refresh(note)
    return note


def update_note(
    session: Session,
    *,
    profile_id: UUID,
    application_id: UUID,
    note_id: UUID,
    payload: NoteUpdate,
) -> Note:
    note = get_note(session, profile_id=profile_id, application_id=application_id, note_id=note_id)

    for field, value in _serialize_payload(payload).items():
        setattr(note, field, value)

    session.add(note)
    session.commit()
    session.refresh(note)
    return note


def delete_note(session: Session, *, profile_id: UUID, application_id: UUID, note_id: UUID) -> None:
    note = get_note(session, profile_id=profile_id, application_id=application_id, note_id=note_id)
    session.delete(note)
    session.commit()
