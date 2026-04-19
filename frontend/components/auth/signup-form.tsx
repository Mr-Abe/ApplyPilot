'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { useAuth } from '@/components/providers/auth-provider';

export function SignupForm() {
  const router = useRouter();
  const { isConfigured, supabase } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setErrorMessage('Supabase Auth is not configured for the frontend environment.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    if (data.session) {
      router.replace('/app');
      router.refresh();
      return;
    }

    setSuccessMessage('Account created. Check your email for a confirmation link before logging in.');
    setIsSubmitting(false);
  }

  return (
    <div className="auth-form-stack">
      {!isConfigured ? (
        <p className="auth-message auth-message--error">
          Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` before using authentication.
        </p>
      ) : null}
      {errorMessage ? <p className="auth-message auth-message--error">{errorMessage}</p> : null}
      {successMessage ? <p className="auth-message auth-message--success">{successMessage}</p> : null}
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
            autoComplete="new-password"
            minLength={8}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Use at least 8 characters"
            required
            type="password"
            value={password}
          />
        </label>
        <button className="button" disabled={!isConfigured || isSubmitting} type="submit">
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>
      <p className="auth-footnote">
        Already have an account? <Link href="/login">Log in</Link>
      </p>
    </div>
  );
}
