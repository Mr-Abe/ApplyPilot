from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_profile
from app.db.session import get_db_session
from app.models.profile import Profile
from app.schemas.contact import ContactCreate, ContactListResponse, ContactRead, ContactUpdate
from app.services.contacts import create_contact, delete_contact, get_contact, list_contacts, update_contact

router = APIRouter(prefix='/contacts')


@router.get('', response_model=ContactListResponse)
def read_contacts(
    session: Annotated[Session, Depends(get_db_session)],
    profile: Annotated[Profile, Depends(get_current_profile)],
    application_id: UUID | None = Query(default=None),
) -> ContactListResponse:
    items, total = list_contacts(session, profile_id=profile.id, application_id=application_id)
    return ContactListResponse(items=[ContactRead.model_validate(item) for item in items], total=total)


@router.post('', response_model=ContactRead, status_code=status.HTTP_201_CREATED)
def create_contact_endpoint(
    payload: ContactCreate,
    session: Annotated[Session, Depends(get_db_session)],
    profile: Annotated[Profile, Depends(get_current_profile)],
) -> ContactRead:
    contact = create_contact(session, profile_id=profile.id, payload=payload)
    return ContactRead.model_validate(contact)


@router.get('/{contact_id}', response_model=ContactRead)
def read_contact(
    contact_id: UUID,
    session: Annotated[Session, Depends(get_db_session)],
    profile: Annotated[Profile, Depends(get_current_profile)],
) -> ContactRead:
    contact = get_contact(session, profile_id=profile.id, contact_id=contact_id)
    return ContactRead.model_validate(contact)


@router.patch('/{contact_id}', response_model=ContactRead)
def update_contact_endpoint(
    contact_id: UUID,
    payload: ContactUpdate,
    session: Annotated[Session, Depends(get_db_session)],
    profile: Annotated[Profile, Depends(get_current_profile)],
) -> ContactRead:
    contact = update_contact(session, profile_id=profile.id, contact_id=contact_id, payload=payload)
    return ContactRead.model_validate(contact)


@router.delete('/{contact_id}', status_code=status.HTTP_204_NO_CONTENT)
def delete_contact_endpoint(
    contact_id: UUID,
    session: Annotated[Session, Depends(get_db_session)],
    profile: Annotated[Profile, Depends(get_current_profile)],
) -> Response:
    delete_contact(session, profile_id=profile.id, contact_id=contact_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
