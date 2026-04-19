'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/components/providers/auth-provider';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isConfigured, supabase } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextPath = searchParams.get('next') || '/app';

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setErrorMessage('Supabase Auth is not configured for the frontend environment.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    router.replace(nextPath);
    router.refresh();
  }

  return (
    <div className="auth-form-stack">
      {!isConfigured ? (
        <p className="auth-message auth-message--error">
          Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` before using authentication.
        </p>
      ) : null}
      {errorMessage ? <p className="auth-message auth-message--error">{errorMessage}</p> : null}
      <form className="auth-form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input
            autoComplete="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            autoComplete="current-password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            type="password"
            value={password}
          />
        </label>
        <button className="button" disabled={!isConfigured || isSubmitting} type="submit">
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
      </form>
      <p className="auth-footnote">
        Need an account? <Link href="/signup">Create one</Link>
      </p>
    </div>
  );
}
