'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { DashboardLayout } from '@/components/layout';
import { Skeleton } from '@/components/shared/Skeleton';

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, restoreSession } = useAuthStore();

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  // Bypass auth check for local development
  // useEffect(() => {
  //   if (!isLoading && !isAuthenticated) {
  //     router.push('/login');
  //   }
  // }, [isLoading, isAuthenticated, router]);

  // if (isLoading) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center bg-zinc-950">
  //       <Skeleton className="h-12 w-12 rounded-full" />
  //     </div>
  //   );
  // }

  // if (!isAuthenticated) {
  //   return null;
  // }

  return <DashboardLayout>{children}</DashboardLayout>;
}
