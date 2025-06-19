
"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Home, UserCircle, Users, LogOut, LogIn, UserPlus, BookUser, Sparkles, Menu } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { USER_ROLES } from '@/lib/constants';

export function Navbar() {
  const { currentUser, firebaseUser, logoutUser, isAuthenticated } = useAuth();
  const pathname = usePathname();

  const navLinkClass = (path: string, isSheetLink: boolean = false) =>
    cn(
      "flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors",
      pathname === path ? "text-primary" : "text-foreground/80",
      isSheetLink && "py-2 px-3 rounded-md text-base w-full justify-start hover:bg-muted" // Added styles for sheet links
    );

  const commonNavLinks = (isSheet: boolean) => (
    <>
      <SheetClose asChild={isSheet}>
        <Link href="/dashboard" className={navLinkClass("/dashboard", isSheet)}>
          <Home className="h-5 w-5" /> Dashboard
        </Link>
      </SheetClose>
      <SheetClose asChild={isSheet}>
        <Link href="/profile-cards" className={navLinkClass("/profile-cards", isSheet)}>
          <BookUser className="h-5 w-5" /> Profile Cards
        </Link>
      </SheetClose>
      <SheetClose asChild={isSheet}>
        <Link href="/potential-matches" className={navLinkClass("/potential-matches", isSheet)}>
          <Users className="h-5 w-5" /> Review Matches
        </Link>
      </SheetClose>
      <SheetClose asChild={isSheet}>
        <Link href="/profile" className={navLinkClass("/profile", isSheet)}>
          <UserCircle className="h-5 w-5" /> My Profile & Settings
        </Link>
      </SheetClose>
      <SheetClose asChild={isSheet}>
        <Button variant="ghost" size="sm" onClick={logoutUser} className={cn("text-foreground/80 hover:text-primary", isSheet && "w-full justify-start text-base py-2 px-3 h-auto")}>
          <LogOut className={cn("mr-2 h-4 w-4", isSheet && "h-5 w-5")} /> Logout: {currentUser?.name}
        </Button>
      </SheetClose>
    </>
  );

  const unauthenticatedNavLinks = (isSheet: boolean) => (
    <>
      <SheetClose asChild={isSheet}>
        <Link href="/auth/login" className={navLinkClass("/auth/login", isSheet)}>
          <LogIn className={cn("mr-2 h-4 w-4", isSheet && "h-5 w-5")} /> Login
        </Link>
      </SheetClose>
      <SheetClose asChild={isSheet}>
        <Link href="/auth/signup" className={navLinkClass("/auth/signup", isSheet)}>
           {isSheet ? (
            <>
              <UserPlus className={cn("mr-2 h-4 w-4", isSheet && "h-5 w-5")} /> Sign Up
            </>
           ) : (
            <Button variant="default" size="sm">
                <UserPlus className="mr-2 h-4 w-4" /> Sign Up
            </Button>
           )}
        </Link>
      </SheetClose>
    </>
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated && currentUser && currentUser.role === USER_ROLES.RECOMMENDER ? (
              commonNavLinks(false)
            ) : (
              unauthenticatedNavLinks(false)
            )}
          </div>

          {/* Mobile Navigation Trigger */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 pt-8">
                <nav className="flex flex-col gap-2 p-4">
                  {isAuthenticated && currentUser && currentUser.role === USER_ROLES.RECOMMENDER ? (
                    commonNavLinks(true)
                  ) : (
                    unauthenticatedNavLinks(true)
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
