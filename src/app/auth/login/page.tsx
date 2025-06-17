
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { LogIn, Sparkles, Loader2, Chrome } from 'lucide-react'; // Added Chrome for Google icon

export default function LoginPage() {
  const { loginWithGoogle, isLoading } = useAuth();
  const [error, setError] = useState(''); // Retained for potential future non-Google errors

  const handleGoogleLogin = async () => {
    setError('');
    await loginWithGoogle();
    // Errors from loginWithGoogle are handled by toast in AuthContext
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
    </div>
  );
}
