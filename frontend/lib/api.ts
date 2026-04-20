import { getApiBaseUrl } from '@/lib/env';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export async function authenticatedApiFetch(path: string, init?: RequestInit): Promise<Response> {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl) {
    throw new Error('NEXT_PUBLIC_API_BASE_URL is not configured.');
  }

  const supabase = getSupabaseBrowserClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const accessToken = session?.access_token;
  if (!accessToken) {
    throw new Error('No active session is available.');
  }

  return fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function readApiErrorMessage(response: Response): Promise<string> {
  const fallbackMessage = `Request failed with status ${response.status}.`;

  try {
    const body = (await response.json()) as {
      error?: { message?: string };
      detail?: Array<{ msg?: string }> | string;
    };

    if (body.error?.message) {
      return body.error.message;
    }

    if (Array.isArray(body.detail) && body.detail[0]?.msg) {
      return body.detail[0].msg;
    }

    if (typeof body.detail === 'string') {
      return body.detail;
    }
  } catch {
    return fallbackMessage;
  }

  return fallbackMessage;
}

export async function authenticatedApiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await authenticatedApiFetch(path, init);

  if (!response.ok) {
    throw new Error(await readApiErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
