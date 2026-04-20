from __future__ import annotations

from uuid import UUID

from sqlalchemy import Select, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.errors import AppError
from app.models.application import Application
from app.models.application_contact import ApplicationContact
from app.models.contact import Contact
from app.schemas.contact import ContactCreate, ContactUpdate


def _serialize_payload(payload: ContactCreate | ContactUpdate) -> dict:
    data = payload.model_dump(exclude_unset=True)
    if 'linkedin_url' in data and data['linkedin_url'] is not None:
        data['linkedin_url'] = str(data['linkedin_url'])
    return data


def _base_contact_query(*, profile_id: UUID, application_id: UUID | None = None) -> Select[tuple[Contact]]:
    query = select(Contact).where(Contact.profile_id == profile_id)

    if application_id is not None:
        query = query.join(ApplicationContact, ApplicationContact.contact_id == Contact.id).where(
            ApplicationContact.profile_id == profile_id,
            ApplicationContact.application_id == application_id,
        )

    return query.order_by(Contact.created_at.desc())


def list_contacts(
    session: Session,
    *,
    profile_id: UUID,
    application_id: UUID | None = None,
) -> tuple[list[Contact], int]:
    if application_id is not None:
        _get_application(session, profile_id=profile_id, application_id=application_id)

    items = list(session.scalars(_base_contact_query(profile_id=profile_id, application_id=application_id)).all())

    count_query = select(func.count(Contact.id)).where(Contact.profile_id == profile_id)
    if application_id is not None:
        count_query = count_query.join(ApplicationContact, ApplicationContact.contact_id == Contact.id).where(
            ApplicationContact.profile_id == profile_id,
            ApplicationContact.application_id == application_id,
        )

    total = session.scalar(count_query) or 0
    return items, total


def get_contact(session: Session, *, profile_id: UUID, contact_id: UUID) -> Contact:
    contact = session.scalar(select(Contact).where(Contact.id == contact_id, Contact.profile_id == profile_id))
    if contact is None:
        raise AppError(status_code=404, code='contact_not_found', message='Contact not found.')
    return contact


def create_contact(session: Session, *, profile_id: UUID, payload: ContactCreate) -> Contact:
    contact = Contact(profile_id=profile_id, **_serialize_payload(payload))
    session.add(contact)
    session.commit()
    session.refresh(contact)
    return contact


def update_contact(session: Session, *, profile_id: UUID, contact_id: UUID, payload: ContactUpdate) -> Contact:
    contact = get_contact(session, profile_id=profile_id, contact_id=contact_id)

    for field, value in _serialize_payload(payload).items():
        setattr(contact, field, value)

    session.add(contact)
    session.commit()
    session.refresh(contact)
    return contact


def delete_contact(session: Session, *, profile_id: UUID, contact_id: UUID) -> None:
    contact = get_contact(session, profile_id=profile_id, contact_id=contact_id)
    session.delete(contact)
    session.commit()


def _get_application(session: Session, *, profile_id: UUID, application_id: UUID) -> Application:
    application = session.scalar(
        select(Application).where(Application.id == application_id, Application.profile_id == profile_id)
    )
    if application is None:
        raise AppError(status_code=404, code='application_not_found', message='Application not found.')
    return application


def link_contact_to_application(
    session: Session,
    *,
    profile_id: UUID,
    application_id: UUID,
    contact_id: UUID,
) -> Contact:
    _get_application(session, profile_id=profile_id, application_id=application_id)
    contact = get_contact(session, profile_id=profile_id, contact_id=contact_id)

    link = ApplicationContact(profile_id=profile_id, application_id=application_id, contact_id=contact_id)
    session.add(link)

    try:
        session.commit()
    except IntegrityError:
        session.rollback()
        existing = session.scalar(
            select(ApplicationContact).where(
                ApplicationContact.profile_id == profile_id,
                ApplicationContact.application_id == application_id,
                ApplicationContact.contact_id == contact_id,
            )
        )
        if existing is None:
            raise

    session.refresh(contact)
    return contact


def unlink_contact_from_application(
    session: Session,
    *,
    profile_id: UUID,
    application_id: UUID,
    contact_id: UUID,
) -> None:
    _get_application(session, profile_id=profile_id, application_id=application_id)
    link = session.scalar(
        select(ApplicationContact).where(
            ApplicationContact.profile_id == profile_id,
            ApplicationContact.application_id == application_id,
            ApplicationContact.contact_id == contact_id,
        )
    )
    if link is None:
        raise AppError(status_code=404, code='application_contact_not_found', message='Contact link not found.')

    session.delete(link)
    session.commit()
