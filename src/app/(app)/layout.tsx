
"use client";

import React, { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Loader2, DollarSign } from 'lucide-react'; // Added DollarSign
import { USER_ROLES } from '@/lib/constants';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { currentUser, firebaseUser, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!firebaseUser) {
        router.push('/auth/login');
      } else if (currentUser && currentUser.role !== USER_ROLES.RECOMMENDER) {
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
        <div className="mt-16 w-full max-w-4xl mx-auto p-8 bg-muted/30 rounded-xl shadow-inner text-center">
          <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-headline text-xl text-muted-foreground">Future Ad Space</h3>
          <p className="font-body text-sm text-muted-foreground/80">
            This area is reserved for future ad integration to support Date Screener.
          </p>
        </div>
      </main>
      <footer className="py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Date Screener. All rights reserved.
      </footer>
    </div>
  );
}
