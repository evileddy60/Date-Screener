"use client";

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Image from 'next/image';
import { Sparkles, Users, HeartHandshake } from 'lucide-react';

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
          Find meaningful connections with a little help from your friends and family. Let your loved ones guide you to your perfect match.
        </p>
      </header>

      <div className="grid md:grid-cols-3 gap-8 mb-12 max-w-4xl w-full">
        <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
          <Users className="h-12 w-12 text-primary mb-4" />
          <h2 className="font-headline text-2xl font-semibold text-foreground mb-2">For Singles</h2>
          <p className="font-body text-foreground/70">Create your profile and let your trusted circle introduce you to potential matches they know you'll love.</p>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
          <HeartHandshake className="h-12 w-12 text-primary mb-4" />
          <h2 className="font-headline text-2xl font-semibold text-foreground mb-2">For Recommenders</h2>
          <p className="font-body text-foreground/70">Help your friends or family find happiness. Suggest matches and share your insights.</p>
        </div>
        <div className="bg-card p-6 rounded-xl shadow-lg hover:shadow-primary/20 transition-shadow duration-300">
          <Sparkles className="h-12 w-12 text-primary mb-4" />
          <h2 className="font-headline text-2xl font-semibold text-foreground mb-2">AI-Powered Tips</h2>
          <p className="font-body text-foreground/70">Get smart suggestions to improve match recommendations, making the process smoother and more effective.</p>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <Link href="/auth/login">Login</Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="border-primary text-primary hover:bg-primary/10 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105">
          <Link href="/auth/signup">Sign Up</Link>
        </Button>
      </div>

      <div className="mt-16 w-full max-w-4xl">
         <Image 
            src="https://placehold.co/1200x400/FF7F50/FAEBD7?text=Meet+Meaningful+Connections" 
            alt="Diverse group of people connecting"
            data-ai-hint="people connection"
            width={1200}
            height={400}
            className="rounded-xl shadow-2xl object-cover"
          />
      </div>

      <footer className="mt-16 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Date Screener. Crafted with care for real connections.
      </footer>
    </div>
  );
}
