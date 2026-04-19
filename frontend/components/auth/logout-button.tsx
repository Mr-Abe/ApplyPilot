'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/components/providers/auth-provider';

export function LogoutButton() {
  const router = useRouter();
  const { isLoading, supabase } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleLogout() {
    if (!supabase) {
      return;
    }

    setIsSubmitting(true);
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <button className="button button--secondary button--small" disabled={!supabase || isLoading || isSubmitting} onClick={handleLogout} type="button">
      {isSubmitting ? 'Signing out...' : 'Log out'}
    </button>
  );
}
