
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Sparkles, Loader2, Chrome, DollarSign } from 'lucide-react'; 

export default function LoginPage() {
  const { loginWithGoogle, isLoading } = useAuth();
  const [error, setError] = useState(''); 

  const handleGoogleLogin = async () => {
    setError('');
    await loginWithGoogle();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <Link href="/" className="flex items-center gap-2 text-primary mb-8 hover:opacity-80 transition-opacity">
        <Sparkles className="h-8 w-8" />
        <span className="font-headline text-3xl font-semibold">Date Screener</span>
      </Link>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl text-primary">Login as Matchmaker</CardTitle>
          <CardDescription className="font-body">Access your account using Google.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <Button 
            onClick={handleGoogleLogin} 
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105" 
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Chrome className="mr-2 h-5 w-5" />}
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center space-y-2">
          <p className="font-body text-sm text-muted-foreground">
            New Matchmaker?{' '}
            <Button variant="link" asChild className="text-primary p-0 h-auto font-body">
              <Link href="/auth/signup">Sign up with Google</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
      <div className="mt-12 w-full max-w-md mx-auto p-6 bg-muted/30 rounded-xl shadow-inner text-center">
        <DollarSign className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
        <h3 className="font-headline text-lg text-muted-foreground">Future Ad Space</h3>
        <p className="font-body text-xs text-muted-foreground/80">
          This area is reserved for future ad integration.
        </p>
      </div>
      <footer className="mt-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Date Screener.
      </footer>
    </div>
  );
}
