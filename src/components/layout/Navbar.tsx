
"use client";

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet'; // Added SheetHeader, SheetTitle
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
      isSheetLink && "py-2 px-3 rounded-md text-base w-full justify-start hover:bg-muted"
    );

  const renderLink = (href: string, icon: React.ElementType, text: string, isSheet: boolean) => {
    const IconComponent = icon;
    const linkContent = (
      <>
        <IconComponent className={cn("h-4 w-4", isSheet && "h-5 w-5")} /> {text}
      </>
    );

    if (isSheet) {
      return (
        <SheetClose asChild>
          <Link href={href} className={navLinkClass(href, isSheet)}>
            {linkContent}
          </Link>
        </SheetClose>
      );
    }
    return (
      <Link href={href} className={navLinkClass(href, isSheet)}>
        {linkContent}
      </Link>
    );
  };
  
  const renderButtonLink = (href: string, icon: React.ElementType, text: string, isSheet: boolean, variant: "default" | "ghost" = "default", size: "sm" | "default" = "sm") => {
    const IconComponent = icon;
    const buttonContent = (
      <>
        <IconComponent className={cn("mr-2 h-4 w-4", isSheet && "h-5 w-5")} /> {text}
      </>
    );

    if (isSheet) {
      return (
        <SheetClose asChild>
          <Link href={href} className={navLinkClass(href, isSheet)}>
             {buttonContent}
          </Link>
        </SheetClose>
      );
    }
    return (
      <Button asChild variant={variant} size={size}>
        <Link href={href} className={navLinkClass(href, false)}> {/* isSheet is false here as it's a button */}
            {buttonContent}
        </Link>
      </Button>
    );
  };
  
  const renderLogoutButton = (isSheet: boolean) => {
    const buttonContent = (
      <>
        <LogOut className={cn("mr-2 h-4 w-4", isSheet && "h-5 w-5")} /> Logout: {currentUser?.name}
      </>
    );
    if (isSheet) {
      return (
        <SheetClose asChild>
          <Button variant="ghost" size="sm" onClick={logoutUser} className={cn("text-foreground/80 hover:text-primary w-full justify-start text-base py-2 px-3 h-auto", navLinkClass('', true))}>
            {buttonContent}
          </Button>
        </SheetClose>
      );
    }
    return (
       <Button variant="ghost" size="sm" onClick={logoutUser} className={cn("text-foreground/80 hover:text-primary", navLinkClass('', false))}>
         {buttonContent}
       </Button>
    );
  };


  const commonNavLinks = (isSheet: boolean) => (
    <>
      {renderLink("/dashboard", Home, "Dashboard", isSheet)}
      {renderLink("/profile-cards", BookUser, "Profile Cards", isSheet)}
      {renderLink("/potential-matches", Users, "Review Matches", isSheet)}
      {renderLink("/profile", UserCircle, "My Profile & Settings", isSheet)}
      {renderLogoutButton(isSheet)}
    </>
  );

  const unauthenticatedNavLinks = (isSheet: boolean) => (
    <>
      {renderLink("/auth/login", LogIn, "Login", isSheet)}
      {isSheet ? (
         renderLink("/auth/signup", UserPlus, "Sign Up", isSheet)
      ) : (
        <Button asChild variant="default" size="sm">
            <Link href="/auth/signup" className={navLinkClass("/auth/signup", false)}>
                <UserPlus className="mr-2 h-4 w-4" /> Sign Up
            </Link>
        </Button>
      )}
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
              <SheetContent side="left" className="w-[280px] sm:w-[320px] p-0 bg-card">
                <SheetHeader className="p-4 border-b">
                  <SheetTitle className="font-headline text-xl text-primary">Menu</SheetTitle>
                </SheetHeader>
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
