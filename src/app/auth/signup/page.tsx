
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { UserPlus, Sparkles, Loader2, Info, Chrome, DollarSign } from 'lucide-react'; 

export default function SignupPage() {
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const { signupWithGoogle, isLoading } = useAuth();
  const [error, setError] = useState(''); 

  const handleGoogleSignup = async () => {
    setError('');
    if (!agreedToTerms) {
      setError('You must agree to the terms and conditions to sign up.');
      return;
    }
    await signupWithGoogle();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <Link href="/" className="flex items-center gap-2 text-primary mb-8 hover:opacity-80 transition-opacity">
        <Sparkles className="h-8 w-8" />
        <span className="font-headline text-3xl font-semibold">Date Screener</span>
      </Link>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl text-primary">Create Your Matchmaker Account</CardTitle>
          <CardDescription className="font-body">Join our community by signing up with Google.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
            <Alert variant="default" className="bg-secondary/20 border-secondary/30">
              <Info className="h-4 w-4 text-secondary-foreground" />
              <AlertDescription className="font-body text-xs text-secondary-foreground/80 space-y-1">
                <p>Date Screener disclaims legal responsibility for any malicious use of the application by its users.</p>
                <p>Users must obtain explicit consent from an individual before creating a Profile Card on their behalf.</p>
                <p>Match suggestions are provided for informational purposes only and do not constitute a guarantee of compatibility or mutual interest. The service aims to facilitate connections based on user-provided information and friend recommendations.</p>
              </AlertDescription>
            </Alert>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="terms" 
                checked={agreedToTerms} 
                onCheckedChange={(checked) => setAgreedToTerms(checked as boolean)}
                disabled={isLoading}
              />
              <Label
                htmlFor="terms"
                className="font-body text-sm text-foreground/80 peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                I have read and agree to the terms and conditions.
              </Label>
            </div>

            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button 
              onClick={handleGoogleSignup}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105" 
              disabled={isLoading || !agreedToTerms}
            >
              {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Chrome className="mr-2 h-5 w-5" />}
              Sign Up with Google
            </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="font-body text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button variant="link" asChild className="text-primary p-0 h-auto font-body">
              <Link href="/auth/login">Login with Google</Link>
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
