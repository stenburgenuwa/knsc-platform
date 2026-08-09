'use client';

import { ReactNode } from 'react';
import DashboardNav from '@/components/DashboardNav';
import { useAuthReady, useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { accessToken } = useAuthStore();
  const ready = useAuthReady();
  const router = useRouter();

  useEffect(() => {
    // Only act once the persisted session has been read back. Before that,
    // "no token" means "not looked yet", not "not signed in".
    if (ready && !accessToken) {
      router.push('/login');
    }
  }, [ready, accessToken, router]);

  if (!ready) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="text-muted">Checking your session&hellip;</p>
      </div>
    );
  }

  if (!accessToken) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p className="text-muted">Redirecting to login&hellip;</p>
      </div>
    );
  }

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      <DashboardNav />
      <div className="flex-1" style={{ overflow: 'auto', background: 'var(--color-bg)' }}>
        {children}
      </div>
    </div>
  );
}
