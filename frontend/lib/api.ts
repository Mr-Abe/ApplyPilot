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
      ...(init?.headers ?? {}),
      Authorization: `Bearer ${accessToken}`,
    },
  });
}
