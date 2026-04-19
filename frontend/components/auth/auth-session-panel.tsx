'use client';

import { useEffect, useState } from 'react';

import { useAuth } from '@/components/providers/auth-provider';
import { authenticatedApiFetch } from '@/lib/api';
import { getApiBaseUrl } from '@/lib/env';

interface BackendIdentity {
  email: string | null;
  role: string | null;
  user_id: string;
}

export function AuthSessionPanel() {
  const apiBaseUrl = getApiBaseUrl();
  const { isConfigured, isLoading, session, user } = useAuth();
  const [backendIdentity, setBackendIdentity] = useState<BackendIdentity | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [isCheckingBackend, setIsCheckingBackend] = useState(false);

  useEffect(() => {
    async function loadBackendIdentity() {
      if (!session || !apiBaseUrl) {
        setBackendIdentity(null);
        setBackendError(null);
        return;
      }

      setIsCheckingBackend(true);
      setBackendError(null);

      try {
        const response = await authenticatedApiFetch('/api/v1/auth/me');
        if (!response.ok) {
          const body = await response.json().catch(() => null);
          const message = body?.error?.message || 'The backend rejected the current access token.';
          throw new Error(message);
        }

        const data = (await response.json()) as BackendIdentity;
        setBackendIdentity(data);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unable to verify backend identity.';
        setBackendError(message);
      } finally {
        setIsCheckingBackend(false);
      }
    }

    void loadBackendIdentity();
  }, [apiBaseUrl, session]);

  return (
    <section className="card auth-session-panel">
      <h2>Authentication status</h2>
      {!isConfigured ? (
        <p className="auth-message auth-message--error">
          Frontend auth is not configured yet. Add the Supabase public environment variables to continue.
        </p>
      ) : null}
      {isLoading ? <p>Loading current session...</p> : null}
      {!isLoading && user ? (
        <div className="detail-list">
          <p>
            <strong>Frontend session:</strong> {user.email || 'Signed-in user'}
          </p>
          <p>
            <strong>Supabase user id:</strong> {user.id}
          </p>
        </div>
      ) : null}
      {!isLoading && !user && isConfigured ? <p>No active user session is available.</p> : null}
      {!apiBaseUrl ? (
        <p className="auth-message auth-message--error">
          Add `NEXT_PUBLIC_API_BASE_URL` to enable authenticated backend requests from the frontend.
        </p>
      ) : null}
      {apiBaseUrl && user ? (
        <div className="detail-list">
          <p>
            <strong>Backend auth check:</strong>{' '}
            {isCheckingBackend ? 'Verifying token with the API...' : backendIdentity ? 'Verified' : 'Pending'}
          </p>
          {backendIdentity ? (
            <p>
              <strong>Backend user id:</strong> {backendIdentity.user_id}
            </p>
          ) : null}
          {backendError ? <p className="auth-message auth-message--error">{backendError}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
