'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/lib/contexts/AuthContext';
import { LoadingState } from '@/components/shared/LoadingState';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <LoadingState className="min-h-screen" message="Loading dashboard..." />;
  }

  if (!isAuthenticated) {
    return null; // Auth context will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:pl-64">
        <Header />
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}