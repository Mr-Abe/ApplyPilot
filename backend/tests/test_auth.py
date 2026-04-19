import time
import uuid

import jwt
from fastapi.testclient import TestClient

from app.core.config import get_settings
from app.main import create_application


def build_access_token(secret: str, supabase_url: str, user_id: uuid.UUID) -> str:
    now = int(time.time())
    payload = {
        'aud': 'authenticated',
        'email': 'test@example.com',
        'exp': now + 3600,
        'iat': now,
        'iss': f'{supabase_url}/auth/v1',
        'role': 'authenticated',
        'sub': str(user_id),
    }
    return jwt.encode(payload, secret, algorithm='HS256')


def test_auth_me_requires_authentication() -> None:
    client = TestClient(create_application())

    response = client.get('/api/v1/auth/me')

    assert response.status_code == 401
    assert response.json()['error']['code'] == 'authentication_required'


def test_auth_me_returns_current_user(monkeypatch) -> None:
    secret = 'test-jwt-secret-with-32-chars-min'
    supabase_url = 'https://example.supabase.co'
    user_id = uuid.uuid4()

    monkeypatch.setenv('APPLYPILOT_SUPABASE_URL', supabase_url)
    monkeypatch.setenv('APPLYPILOT_SUPABASE_JWT_SECRET', secret)
    get_settings.cache_clear()

    client = TestClient(create_application())
    token = build_access_token(secret, supabase_url, user_id)
    response = client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {token}'})

    assert response.status_code == 200
    assert response.json() == {
        'user_id': str(user_id),
        'email': 'test@example.com',
        'role': 'authenticated',
    }

    get_settings.cache_clear()
