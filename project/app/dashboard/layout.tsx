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
    return <div>Redirecting to login...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <DashboardNav />
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
