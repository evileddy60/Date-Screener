"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { UserCircle, Users, HandHeart, Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { currentUser } = useAuth();

  if (!currentUser) {
    return <p>Loading user data...</p>;
  }

  const QuickLink = ({ href, icon: Icon, title, description }: { href: string, icon: React.ElementType, title: string, description: string }) => (
    <Link href={href} className="block group">
      <Card className="hover:shadow-lg hover:border-primary/50 transition-all duration-300 h-full flex flex-col">
        <CardHeader className="flex flex-row items-center gap-4 pb-2">
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="font-headline text-xl text-primary group-hover:underline">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="font-body text-sm text-muted-foreground">{description}</p>
        </CardContent>
        <CardContent className="pt-0">
           <Button variant="ghost" size="sm" className="text-primary group-hover:translate-x-1 transition-transform">
            Go to {title} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-primary/80 via-primary to-accent/60 text-primary-foreground shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between p-8">
          <div>
            <h1 className="font-headline text-4xl font-bold mb-2">Hello, {currentUser.name}!</h1>
            <p className="font-body text-lg opacity-90">
              Welcome back to Date Screener. Ready to make some connections?
            </p>
            <p className="font-body text-sm opacity-80 mt-1">
              You are logged in as a: <span className="font-semibold capitalize">{currentUser.role}</span>.
            </p>
          </div>
          <Image 
            src={`https://placehold.co/300x200/${currentUser.role === 'single' ? 'FF7F50' : 'E6E6FA'}/FFFFFF?text=Welcome!`}
            alt="Welcome illustration"
            data-ai-hint="welcome abstract"
            width={250}
            height={150}
            className="rounded-lg mt-6 md:mt-0 shadow-md object-cover"
          />
        </div>
      </Card>

      <section>
        <h2 className="font-headline text-2xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <QuickLink href="/profile" icon={UserCircle} title="My Profile" description="View and update your personal information and preferences." />
          
          {currentUser.role === 'single' && (
            <QuickLink href="/matches" icon={Users} title="View Matches" description="See who your friends and family have recommended for you." />
          )}

          {currentUser.role === 'recommender' && (
            <>
              <QuickLink href="/recommendations" icon={HandHeart} title="Recommend Match" description="Suggest a potential match for someone you know." />
              <QuickLink href="/suggestions" icon={Sparkles} title="AI Matching Tips" description="Get AI-powered advice to improve your recommendations." />
            </>
          )}
          <QuickLink href="/privacy" icon={ShieldCheck} title="Privacy Settings" description="Manage your profile visibility and communication preferences." />
        </div>
      </section>

      {currentUser.role === 'single' && (
         <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">New to Date Screener?</CardTitle>
            <CardDescription className="font-body">Make sure your profile is complete so your recommenders can find great matches for you!</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/profile">Complete Your Profile</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {currentUser.role === 'recommender' && (
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-xl">Ready to Play Matchmaker?</CardTitle>
            <CardDescription className="font-body">Start by finding singles you know and suggesting potential matches for them.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/recommendations">Make a Recommendation</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
