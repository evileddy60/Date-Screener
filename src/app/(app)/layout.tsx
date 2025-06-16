
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
  const { currentUser, firebaseUser, isAuthenticated, isLoading } = useAuth(); // Added firebaseUser
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!firebaseUser) { // Check firebaseUser for auth state
        router.push('/auth/login');
      } else if (currentUser && currentUser.role !== USER_ROLES.RECOMMENDER) {
        // This case should ideally not happen if signup/login enforces recommender role
        // but as a fallback, redirect.
        router.push('/auth/login'); 
      }
    }
  }, [firebaseUser, currentUser, isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg font-medium text-foreground">Loading Your Experience...</p>
      </div>
    );
  }

  // Check firebaseUser for initial auth check, then currentUser for role
  if (!firebaseUser || (currentUser && currentUser.role !== USER_ROLES.RECOMMENDER)) {
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
