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


def create_contact_payload(full_name: str, **overrides):
    payload = {
        'company_name': 'Acme',
        'full_name': full_name,
        'title': 'Recruiter',
        'email': 'recruiter@example.com',
        'linkedin_url': 'https://linkedin.com/in/recruiter',
        'phone': '555-123-4567',
        'notes': 'Initial outreach.',
    }
    payload.update(overrides)
    return payload


def test_contacts_crud_and_application_linking() -> None:
    client, _ = build_test_client()

    application = client.post('/api/v1/applications', json=create_application_payload('Acme', 'Backend Engineer')).json()

    create_response = client.post('/api/v1/contacts', json=create_contact_payload('Jordan Smith'))
    assert create_response.status_code == 201
    created = create_response.json()
    assert created['full_name'] == 'Jordan Smith'
    assert created['company_name'] == 'Acme'

    list_response = client.get('/api/v1/contacts')
    assert list_response.status_code == 200
    assert list_response.json()['total'] == 1

    update_response = client.patch(
        f"/api/v1/contacts/{created['id']}",
        json={
            'title': 'Senior Recruiter',
            'notes': 'Follow up after final round.',
        },
    )
    assert update_response.status_code == 200
    assert update_response.json()['title'] == 'Senior Recruiter'

    link_response = client.post(f"/api/v1/applications/{application['id']}/contacts/{created['id']}")
    assert link_response.status_code == 200
    assert link_response.json()['id'] == created['id']

    filtered_response = client.get(f"/api/v1/contacts?application_id={application['id']}")
    assert filtered_response.status_code == 200
    assert filtered_response.json()['total'] == 1
    assert filtered_response.json()['items'][0]['id'] == created['id']

    unlink_response = client.delete(f"/api/v1/applications/{application['id']}/contacts/{created['id']}")
    assert unlink_response.status_code == 204

    filtered_after_unlink = client.get(f"/api/v1/contacts?application_id={application['id']}")
    assert filtered_after_unlink.status_code == 200
    assert filtered_after_unlink.json()['total'] == 0

    delete_response = client.delete(f"/api/v1/contacts/{created['id']}")
    assert delete_response.status_code == 204


def test_contacts_enforce_ownership() -> None:
    client, state = build_test_client()

    owned_contact = client.post('/api/v1/contacts', json=create_contact_payload('Owner Contact')).json()
    owned_application = client.post('/api/v1/applications', json=create_application_payload('Acme', 'Designer')).json()

    state['current_user'] = OTHER_USER
    other_application = client.post('/api/v1/applications', json=create_application_payload('Other Co', 'Analyst')).json()

    missing_detail = client.get(f"/api/v1/contacts/{owned_contact['id']}")
    assert missing_detail.status_code == 404

    missing_link = client.post(f"/api/v1/applications/{other_application['id']}/contacts/{owned_contact['id']}")
    assert missing_link.status_code == 404

    state['current_user'] = OWNER_USER
    invalid_filter = client.get(f"/api/v1/contacts?application_id={other_application['id']}")
    assert invalid_filter.status_code == 404

    valid_link = client.post(f"/api/v1/applications/{owned_application['id']}/contacts/{owned_contact['id']}")
    assert valid_link.status_code == 200
