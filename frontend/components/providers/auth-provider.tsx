'use client';

import type { Session, SupabaseClient, User } from '@supabase/supabase-js';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { isSupabaseConfigured } from '@/lib/env';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

interface AuthContextValue {
  isConfigured: boolean;
  isLoading: boolean;
  session: Session | null;
  supabase: SupabaseClient | null;
  user: User | null;
}

const AuthContext = createContext<AuthContextValue>({
  isConfigured: false,
  isLoading: false,
  session: null,
  supabase: null,
  user: null,
});

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const configured = isSupabaseConfigured();
  const supabase = useMemo(() => {
    if (!configured) {
      return null;
    }

    return getSupabaseBrowserClient();
  }, [configured]);

  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(configured);

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }

      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        isConfigured: configured,
        isLoading,
        session,
        supabase,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
