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
        'location': 'Remote',
        'work_type': 'Remote',
        'source': 'LinkedIn',
        'posting_url': 'https://example.com/jobs/1',
        'salary_min': 100000,
        'salary_max': 140000,
        'resume_version': 'v1',
        'cover_letter_version': 'v1',
        'date_found': '2026-04-10',
        'date_applied': '2026-04-12',
        'status': 'applied',
        'next_action': 'Send follow-up',
        'next_action_due_at': '2026-04-20T15:00:00Z',
        'notes_summary': 'Strong fit for backend role.',
        'archived': False,
    }
    payload.update(overrides)
    return payload


def test_create_list_and_get_application() -> None:
    client, _ = build_test_client()

    create_response = client.post('/api/v1/applications', json=create_application_payload('Acme', 'Backend Engineer'))

    assert create_response.status_code == 201
    created = create_response.json()
    assert created['company_name'] == 'Acme'
    assert created['job_title'] == 'Backend Engineer'
    assert created['status'] == 'applied'

    list_response = client.get('/api/v1/applications')
    assert list_response.status_code == 200
    body = list_response.json()
    assert body['total'] == 1
    assert body['items'][0]['id'] == created['id']

    detail_response = client.get(f"/api/v1/applications/{created['id']}")
    assert detail_response.status_code == 200
    assert detail_response.json()['company_name'] == 'Acme'


def test_applications_enforce_ownership_and_filters() -> None:
    client, state = build_test_client()

    owner_one = client.post(
        '/api/v1/applications',
        json=create_application_payload(
            'Acme',
            'Platform Engineer',
            status='interview',
            date_applied='2026-04-15',
            next_action_due_at='2026-04-18T10:00:00Z',
        ),
    ).json()
    client.post(
        '/api/v1/applications',
        json=create_application_payload(
            'Beta Labs',
            'Data Engineer',
            status='wishlist',
            date_applied='2026-04-05',
            next_action_due_at='2026-04-28T10:00:00Z',
        ),
    )

    state['current_user'] = OTHER_USER
    other = client.post('/api/v1/applications', json=create_application_payload('Other Co', 'Analyst')).json()

    state['current_user'] = OWNER_USER
    response = client.get('/api/v1/applications?search=Acme&status=interview&sort_by=next_action_due_at&sort_order=asc')

    assert response.status_code == 200
    body = response.json()
    assert body['total'] == 1
    assert body['items'][0]['company_name'] == 'Acme'

    archived_response = client.get('/api/v1/applications?archive_state=archived')
    assert archived_response.status_code == 200
    assert archived_response.json()['total'] == 0

    missing_response = client.get(f"/api/v1/applications/{other['id']}")
    assert missing_response.status_code == 404

    owned_response = client.get(f"/api/v1/applications/{owner_one['id']}")
    assert owned_response.status_code == 200


def test_update_and_archive_application() -> None:
    client, _ = build_test_client()

    created = client.post('/api/v1/applications', json=create_application_payload('Gamma', 'Software Engineer')).json()

    update_response = client.patch(
        f"/api/v1/applications/{created['id']}",
        json={
            'status': 'final_round',
            'next_action': 'Prepare presentation',
            'notes_summary': 'Moved into final stage.',
            'salary_max': 150000,
        },
    )
    assert update_response.status_code == 200
    updated = update_response.json()
    assert updated['status'] == 'final_round'
    assert updated['salary_max'] == 150000

    archive_response = client.patch(f"/api/v1/applications/{created['id']}", json={'archived': True})
    assert archive_response.status_code == 200
    assert archive_response.json()['archived'] is True

    active_response = client.get('/api/v1/applications')
    assert active_response.status_code == 200
    assert active_response.json()['total'] == 0

    archived_response = client.get('/api/v1/applications?archive_state=archived')
    assert archived_response.status_code == 200
    assert archived_response.json()['total'] == 1


def test_application_validation_rejects_invalid_salary_range() -> None:
    client, _ = build_test_client()

    response = client.post(
        '/api/v1/applications',
        json=create_application_payload('Delta', 'Engineer', salary_min=150000, salary_max=120000),
    )

    assert response.status_code == 422
