
"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Loader2 } from 'lucide-react';
import { USER_ROLES } from '@/lib/constants';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/auth/login');
      } else if (currentUser && currentUser.role !== USER_ROLES.RECOMMENDER) {
        // If somehow a non-recommender is authenticated, log them out or redirect
        // For this app, only recommenders are allowed in the app section.
        router.push('/auth/login'); 
      }
    }
  }, [isAuthenticated, isLoading, router, currentUser]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg font-medium text-foreground">Loading Your Experience...</p>
      </div>
    );
  }

  if (!isAuthenticated || (currentUser && currentUser.role !== USER_ROLES.RECOMMENDER)) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-lg font-medium text-foreground">Redirecting to login...</p>
      </div>
    ); 
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Date Screener. All rights reserved.
      </footer>
    </div>
  );
}
