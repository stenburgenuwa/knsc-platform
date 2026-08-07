'use client';

import { ReactNode } from 'react';
import DashboardNav from '@/components/DashboardNav';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { accessToken } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!accessToken) {
      router.push('/login');
    }
  }, [accessToken, router]);

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
