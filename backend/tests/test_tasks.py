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


def create_task_payload(title: str, **overrides):
    payload = {
        'title': title,
        'description': 'Send a follow-up email.',
        'status': 'open',
        'priority': 'medium',
        'due_at': '2026-04-22T15:00:00Z',
        'application_id': None,
    }
    payload.update(overrides)
    return payload


def test_tasks_crud_completion_and_filters() -> None:
    client, _ = build_test_client()

    application = client.post('/api/v1/applications', json=create_application_payload('Acme', 'Backend Engineer')).json()

    overdue_task = client.post(
        '/api/v1/tasks',
        json=create_task_payload('Send follow-up', due_at='2025-01-01T09:00:00Z', application_id=application['id']),
    )
    assert overdue_task.status_code == 201

    upcoming_task = client.post(
        '/api/v1/tasks',
        json=create_task_payload('Prep interview', due_at='2099-01-01T09:00:00Z', priority='high', application_id=application['id']),
    )
    assert upcoming_task.status_code == 201
    upcoming = upcoming_task.json()

    completed_task = client.post(
        '/api/v1/tasks',
        json=create_task_payload('Log feedback', status='completed', application_id=application['id']),
    )
    assert completed_task.status_code == 201
    assert completed_task.json()['completed_at'] is not None

    list_response = client.get(f"/api/v1/tasks?application_id={application['id']}")
    assert list_response.status_code == 200
    assert list_response.json()['total'] == 3

    overdue_response = client.get('/api/v1/tasks?timing=overdue')
    assert overdue_response.status_code == 200
    assert overdue_response.json()['total'] == 1
    assert overdue_response.json()['items'][0]['title'] == 'Send follow-up'

    upcoming_response = client.get('/api/v1/tasks?timing=upcoming')
    assert upcoming_response.status_code == 200
    assert upcoming_response.json()['total'] == 1
    assert upcoming_response.json()['items'][0]['title'] == 'Prep interview'

    update_response = client.patch(f"/api/v1/tasks/{upcoming['id']}", json={'status': 'completed'})
    assert update_response.status_code == 200
    assert update_response.json()['status'] == 'completed'
    assert update_response.json()['completed_at'] is not None

    open_response = client.get('/api/v1/tasks?status=open')
    assert open_response.status_code == 200
    assert open_response.json()['total'] == 1

    delete_response = client.delete(f"/api/v1/tasks/{upcoming['id']}")
    assert delete_response.status_code == 204


def test_tasks_enforce_ownership_and_application_scope() -> None:
    client, state = build_test_client()

    owned_application = client.post('/api/v1/applications', json=create_application_payload('Acme', 'Designer')).json()
    owned_task = client.post(
        '/api/v1/tasks',
        json=create_task_payload('Reach out', application_id=owned_application['id']),
    ).json()

    state['current_user'] = OTHER_USER
    other_application = client.post('/api/v1/applications', json=create_application_payload('Other Co', 'Analyst')).json()

    missing_detail = client.get(f"/api/v1/tasks/{owned_task['id']}")
    assert missing_detail.status_code == 404

    invalid_create = client.post('/api/v1/tasks', json=create_task_payload('Bad link', application_id=owned_application['id']))
    assert invalid_create.status_code == 404

    state['current_user'] = OWNER_USER
    invalid_filter = client.get(f"/api/v1/tasks?application_id={other_application['id']}")
    assert invalid_filter.status_code == 404
