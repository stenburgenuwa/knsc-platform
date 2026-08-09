'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthReady, useAuthStore } from '@/store/auth';
import { DASHBOARD_BY_LABEL } from '@/lib/roles';

export default function DashboardIndexPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const ready = useAuthReady();

  useEffect(() => {
    // Wait for the stored session before choosing a destination, or a
    // refresh here would send a signed-in user to the login page.
    if (!ready) return;
    const role = user?.roles?.[0];
    router.replace((role && DASHBOARD_BY_LABEL[role]) || '/login');
  }, [ready, user, router]);

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <p className="text-muted">Loading your dashboard&hellip;</p>
    </div>
  );
}
