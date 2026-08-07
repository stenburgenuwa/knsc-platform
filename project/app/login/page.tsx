'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { login } from '@/lib/auth-service';
import { DASHBOARD_BY_LABEL } from '@/lib/roles';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const response = await login(email, password);
      const { user, accessToken } = response.data.data;
      setAuth(user, accessToken);
      const role = user.roles?.[0];
      router.push((role && DASHBOARD_BY_LABEL[role]) || '/dashboard');
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Unable to sign in. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--color-bg)' }}>
      <div className="card elev-lg" style={{ maxWidth: 420, width: '100%', margin: 'var(--space-4)' }}>
        <h1 style={{ fontWeight: 400, textAlign: 'center' }}>Sign In</h1>
        <p className="text-muted" style={{ textAlign: 'center', marginBottom: 'var(--space-4)' }}>
          Kilifi North Sub County League
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@knscl.co.ke"
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
            />
          </div>

          {error && (
            <p style={{ color: 'var(--color-accent-800)', fontSize: 13, margin: 0 }}>{error}</p>
          )}

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-muted" style={{ textAlign: 'center', marginTop: 'var(--space-4)', marginBottom: 0 }}>
          <Link href="/">&larr; Back to public site</Link>
        </p>
      </div>
    </div>
  );
}
