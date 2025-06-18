
"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, Users, HeartHandshake, BookUser, DollarSign } from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen"><Sparkles className="h-12 w-12 animate-ping text-primary" /></div>;
  }
  
  if (isAuthenticated) {
     return <div className="flex justify-center items-center min-h-screen"><Sparkles className="h-12 w-12 animate-ping text-primary" /> <p className="ml-2">Redirecting to dashboard...</p></div>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-background to-secondary/30 p-6">
      <header className="text-center mb-12">
        <div className="inline-block p-4 bg-primary/10 rounded-full mb-4">
          <Sparkles className="h-16 w-16 text-primary" />
        </div>
        <h1 className="font-headline text-5xl md:text-6xl font-bold text-primary mb-4">
          Welcome to Date Screener
        </h1>
        <p className="font-body text-xl text-foreground/80 max-w-2xl mx-auto">
          Become a matchmaker for your friends! Create profiles for them and help them find meaningful connections.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl w-full">
        <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
          <BookUser className="h-12 w-12 text-primary mb-4" />
          <h2 className="font-headline text-2xl font-semibold text-foreground mb-2">Create Profile Cards</h2>
          <p className="font-body text-foreground/70">Build detailed profiles for your single friends, highlighting their personality and preferences.</p>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
          <HeartHandshake className="h-12 w-12 text-primary mb-4" />
          <h2 className="font-headline text-2xl font-semibold text-foreground mb-2">Discover Matches</h2>
          <p className="font-body text-foreground/70">Our AI helps you compare Profile Cards to find promising matches between your friends and friends of other matchmakers.</p>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
          <Users className="h-12 w-12 text-primary mb-4" />
          <h2 className="font-headline text-2xl font-semibold text-foreground mb-2">Collaborate & Connect</h2>
          <p className="font-body text-foreground/70">Approve matches with other matchmakers, and if everyone agrees, help your friends connect!</p>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <Link href="/auth/login">Login as Matchmaker</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <Link href="/auth/signup">Become a Matchmaker</Link>
        </Button>
      </div>

      <div className="mt-16 w-full max-w-4xl mx-auto p-8 bg-muted/30 rounded-xl shadow-inner text-center">
        <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-headline text-xl text-muted-foreground">Future Ad Space</h3>
        <p className="font-body text-sm text-muted-foreground/80">
          This area is reserved for future ad integration to support Date Screener.
        </p>
      </div>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Date Screener. Empowering friends to make connections.
      </footer>
    </div>
  );
}
