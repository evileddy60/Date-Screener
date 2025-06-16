
"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Home, UserCircle, Users, LogOut, LogIn, UserPlus, ShieldCheck, BookUser, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { USER_ROLES } from '@/lib/constants';

export function Navbar() {
  const { currentUser, firebaseUser, logoutUser, isAuthenticated } = useAuth(); 
  const pathname = usePathname();

  const navLinkClass = (path: string) => 
    cn(
      "flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors",
      pathname === path ? "text-primary" : "text-foreground/80"
    );

  return (
    <nav className="bg-card shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
              <Sparkles className="h-7 w-7" />
              <span className="font-headline text-2xl font-semibold">Date Screener</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated && currentUser && currentUser.role === USER_ROLES.RECOMMENDER ? (
              <>
                <Link href="/dashboard" className={navLinkClass("/dashboard")}>
                  <Home className="h-4 w-4" /> Dashboard
                </Link>
                <Link href="/profile" className={navLinkClass("/profile")}>
                  <UserCircle className="h-4 w-4" /> My Profile
                </Link>
                <Link href="/profile-cards" className={navLinkClass("/profile-cards")}>
                  <BookUser className="h-4 w-4" /> Profile Cards
                </Link>
                 <Link href="/potential-matches" className={navLinkClass("/potential-matches")}>
                  <Users className="h-4 w-4" /> Review Matches
                </Link>
                <Link href="/privacy" className={navLinkClass("/privacy")}>
                  <ShieldCheck className="h-4 w-4" /> Privacy
                </Link>
                <Button variant="ghost" size="sm" onClick={logoutUser} className="text-foreground/80 hover:text-primary">
                  <LogOut className="mr-2 h-4 w-4" /> Logout
                </Button>
              </>
            ) : (
              <>
                <Link href="/auth/login" className={navLinkClass("/auth/login")}>
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Link>
                <Link href="/auth/signup" className={navLinkClass("/auth/signup")}>
                  <Button variant="default" size="sm">
                    <UserPlus className="mr-2 h-4 w-4" /> Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
