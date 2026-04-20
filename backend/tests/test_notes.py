from __future__ import annotations

from uuid import uuid4

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import app.models  # noqa: F401
from app.api.dependencies import get_current_user
from app.db.base import Base
from app.db.session import get_db_session
from app.main import create_application
from app.schemas.auth import CurrentUser

OWNER_USER = CurrentUser(
    user_id=uuid4(),
    email='owner@example.com',
    role='authenticated',
)
OTHER_USER = CurrentUser(
    user_id=uuid4(),
    email='other@example.com',
    role='authenticated',
)


def build_test_client() -> tuple[TestClient, dict[str, CurrentUser]]:
    engine = create_engine(
        'sqlite+pysqlite:///:memory:',
        connect_args={'check_same_thread': False},
        poolclass=StaticPool,
    )
    testing_session_local = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)
    Base.metadata.create_all(bind=engine)

    app = create_application()
    state = {
        'current_user': OWNER_USER,
    }

    def override_get_db_session():
        session = testing_session_local()
        try:
            yield session
        finally:
            session.close()

    def override_get_current_user() -> CurrentUser:
        return state['current_user']

    app.dependency_overrides[get_db_session] = override_get_db_session
    app.dependency_overrides[get_current_user] = override_get_current_user
    return TestClient(app), state


def create_application_payload(company_name: str, job_title: str, **overrides):
    payload = {
        'company_name': company_name,
        'job_title': job_title,
        'status': 'applied',
    }
    payload.update(overrides)
    return payload


def create_note_payload(body: str, **overrides):
    payload = {
        'note_type': 'general',
        'body': body,
    }
    payload.update(overrides)
    return payload


def test_application_notes_crud() -> None:
    client, _ = build_test_client()

    application = client.post('/api/v1/applications', json=create_application_payload('Acme', 'Backend Engineer')).json()

    create_response = client.post(
        f"/api/v1/applications/{application['id']}/notes",
        json=create_note_payload('Initial recruiter screen went well.', note_type='interview'),
    )
    assert create_response.status_code == 201
    created = create_response.json()
    assert created['note_type'] == 'interview'
    assert created['body'] == 'Initial recruiter screen went well.'

    list_response = client.get(f"/api/v1/applications/{application['id']}/notes")
    assert list_response.status_code == 200
    assert list_response.json()['total'] == 1
    assert list_response.json()['items'][0]['id'] == created['id']

    update_response = client.patch(
        f"/api/v1/applications/{application['id']}/notes/{created['id']}",
        json={'note_type': 'followup', 'body': 'Send thank-you note tomorrow morning.'},
    )
    assert update_response.status_code == 200
    assert update_response.json()['note_type'] == 'followup'
    assert update_response.json()['body'] == 'Send thank-you note tomorrow morning.'

    delete_response = client.delete(f"/api/v1/applications/{application['id']}/notes/{created['id']}")
    assert delete_response.status_code == 204

    empty_response = client.get(f"/api/v1/applications/{application['id']}/notes")
    assert empty_response.status_code == 200
    assert empty_response.json()['total'] == 0


def test_application_notes_enforce_ownership() -> None:
    client, state = build_test_client()

    owned_application = client.post('/api/v1/applications', json=create_application_payload('Acme', 'Designer')).json()
    created_note = client.post(
        f"/api/v1/applications/{owned_application['id']}/notes",
        json=create_note_payload('Phone screen scheduled.', note_type='call'),
    ).json()

    state['current_user'] = OTHER_USER
    other_application = client.post('/api/v1/applications', json=create_application_payload('Other Co', 'Analyst')).json()

    missing_list = client.get(f"/api/v1/applications/{owned_application['id']}/notes")
    assert missing_list.status_code == 404

    missing_update = client.patch(
        f"/api/v1/applications/{owned_application['id']}/notes/{created_note['id']}",
        json={'body': 'Trying to edit another user note.'},
    )
    assert missing_update.status_code == 404

    invalid_create = client.post(
        f"/api/v1/applications/{owned_application['id']}/notes",
        json=create_note_payload('Should not work.'),
    )
    assert invalid_create.status_code == 404

    state['current_user'] = OWNER_USER
    wrong_parent = client.patch(
        f"/api/v1/applications/{other_application['id']}/notes/{created_note['id']}",
        json={'body': 'Wrong parent application.'},
    )
    assert wrong_parent.status_code == 404
