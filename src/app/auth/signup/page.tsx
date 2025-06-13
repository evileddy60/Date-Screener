
"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import type { UserRole } from '@/types';
import { USER_ROLES } from '@/lib/constants';
import { UserPlus, Sparkles } from 'lucide-react';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState(''); // Not used in mock auth
  const [role, setRole] = useState<UserRole>(USER_ROLES.SINGLE);
  const { login } = useAuth(); // Using login for mock signup, it creates user if not exists
  const [error, setError] = useState('');


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !name) {
      setError('Please fill in all fields.');
      return;
    }
    // In mock, login function handles user creation if not found.
    // We pass the role to guide user creation in the mock AuthContext.
    // A real signup would send this data to a backend API.
    login(email, role); 
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-secondary/30 p-4">
      <Link href="/" className="flex items-center gap-2 text-primary mb-8 hover:opacity-80 transition-opacity">
        <Sparkles className="h-8 w-8" />
        <span className="font-headline text-3xl font-semibold">Date Screener</span>
      </Link>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-3xl text-primary">Create Account</CardTitle>
          <CardDescription className="font-body">Join our community to find or recommend matches.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="font-body text-foreground/80">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Your Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="font-body bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="font-body text-foreground/80">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="font-body bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="font-body text-foreground/80">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="font-body bg-card"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-body text-foreground/80">I am...</Label>
              <RadioGroup
                value={role}
                onValueChange={(value: string) => setRole(value as UserRole)}
                className="flex space-x-4 font-body"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={USER_ROLES.SINGLE} id="role-single" />
                  <Label htmlFor="role-single" className="font-normal">I am single and looking to be matched up</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={USER_ROLES.RECOMMENDER} id="role-recommender" />
                  <Label htmlFor="role-recommender" className="font-normal">I am looking to match people up</Label>
                </div>
              </RadioGroup>
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
              <UserPlus className="mr-2 h-5 w-5" /> Sign Up
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="font-body text-sm text-muted-foreground">
            Already have an account?{' '}
            <Button variant="link" asChild className="text-primary p-0 h-auto font-body">
              <Link href="/auth/login">Login</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
