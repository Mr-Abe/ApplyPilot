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
        'archived': False,
    }
    payload.update(overrides)
    return payload


def create_task_payload(title: str, **overrides):
    payload = {
        'title': title,
        'description': 'Follow up',
        'status': 'open',
        'priority': 'medium',
        'due_at': '2026-04-22T15:00:00Z',
        'application_id': None,
    }
    payload.update(overrides)
    return payload


def test_dashboard_summary_breakdown_and_task_lists() -> None:
    client, _ = build_test_client()

    first_application = client.post(
        '/api/v1/applications',
        json=create_application_payload('Acme', 'Backend Engineer', status='interview'),
    ).json()
    client.post(
        '/api/v1/applications',
        json=create_application_payload('Beta', 'Designer', status='wishlist'),
    )
    client.post(
        '/api/v1/applications',
        json=create_application_payload('Gamma', 'Analyst', status='rejected', archived=True),
    )

    client.post(
        '/api/v1/tasks',
        json=create_task_payload('Send follow-up', due_at='2025-01-01T09:00:00Z', application_id=first_application['id']),
    )
    client.post(
        '/api/v1/tasks',
        json=create_task_payload('Prep interview', due_at='2099-01-01T09:00:00Z', priority='high', application_id=first_application['id']),
    )
    client.post(
        '/api/v1/tasks',
        json=create_task_payload('Log notes', status='completed', application_id=first_application['id']),
    )

    summary_response = client.get('/api/v1/dashboard/summary')
    assert summary_response.status_code == 200
    assert summary_response.json() == {
        'active_applications': 2,
        'open_tasks': 2,
        'overdue_tasks': 1,
        'upcoming_tasks': 1,
    }

    breakdown_response = client.get('/api/v1/dashboard/status-breakdown')
    assert breakdown_response.status_code == 200
    breakdown = {item['status']: item['count'] for item in breakdown_response.json()['items']}
    assert breakdown['interview'] == 1
    assert breakdown['wishlist'] == 1
    assert breakdown['rejected'] == 0

    overdue_response = client.get('/api/v1/dashboard/tasks/overdue')
    assert overdue_response.status_code == 200
    assert overdue_response.json()['total'] == 1
    assert overdue_response.json()['items'][0]['title'] == 'Send follow-up'
    assert overdue_response.json()['items'][0]['application_company_name'] == 'Acme'

    upcoming_response = client.get('/api/v1/dashboard/tasks/upcoming')
    assert upcoming_response.status_code == 200
    assert upcoming_response.json()['total'] == 1
    assert upcoming_response.json()['items'][0]['title'] == 'Prep interview'


def test_dashboard_endpoints_enforce_ownership() -> None:
    client, state = build_test_client()

    owned_application = client.post(
        '/api/v1/applications',
        json=create_application_payload('Acme', 'Platform Engineer', status='screening'),
    ).json()
    client.post(
        '/api/v1/tasks',
        json=create_task_payload('Reach out', due_at='2099-01-01T09:00:00Z', application_id=owned_application['id']),
    )

    state['current_user'] = OTHER_USER
    other_summary = client.get('/api/v1/dashboard/summary')
    assert other_summary.status_code == 200
    assert other_summary.json() == {
        'active_applications': 0,
        'open_tasks': 0,
        'overdue_tasks': 0,
        'upcoming_tasks': 0,
    }

    other_breakdown = client.get('/api/v1/dashboard/status-breakdown')
    assert other_breakdown.status_code == 200
    assert all(item['count'] == 0 for item in other_breakdown.json()['items'])

    other_upcoming = client.get('/api/v1/dashboard/tasks/upcoming')
    assert other_upcoming.status_code == 200
    assert other_upcoming.json()['total'] == 0
