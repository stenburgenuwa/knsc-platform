'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { DASHBOARD_BY_LABEL } from '@/lib/roles';

export default function DashboardIndexPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    const role = user?.roles?.[0];
    router.replace((role && DASHBOARD_BY_LABEL[role]) || '/login');
  }, [user, router]);

  return (
    <div style={{ padding: 'var(--space-8)' }}>
      <p className="text-muted">Loading your dashboard&hellip;</p>
    </div>
  );
}
