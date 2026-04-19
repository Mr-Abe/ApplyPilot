function readEnvValue(name: string): string | null {
  const value = process.env[name];
  if (!value) {
    return null;
  }

  return value.trim() || null;
}

export function getSupabasePublicConfig(): { url: string; anonKey: string } | null {
  const url = readEnvValue('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = readEnvValue('NEXT_PUBLIC_SUPABASE_ANON_KEY');

  if (!url || !anonKey) {
    return null;
  }

  return { url, anonKey };
}

export function isSupabaseConfigured(): boolean {
  return getSupabasePublicConfig() !== null;
}

export function getApiBaseUrl(): string | null {
  const value = readEnvValue('NEXT_PUBLIC_API_BASE_URL');
  if (!value) {
    return null;
  }

  return value.endsWith('/') ? value.slice(0, -1) : value;
}
