
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserCircle, BookUser, ShieldCheck, ArrowRight, Users, Bell } from 'lucide-react'; 
import { USER_ROLES } from '@/lib/constants';
import { useEffect, useState } from 'react';
import type { PotentialMatch } from '@/types';
import { getPotentialMatchesByMatcher } from '@/lib/firestoreService';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [isLoadingPendingCount, setIsLoadingPendingCount] = useState(true);

  useEffect(() => {
    async function fetchPendingMatches() {
      if (currentUser && currentUser.role === USER_ROLES.RECOMMENDER) {
        setIsLoadingPendingCount(true);
        try {
          const matches = await getPotentialMatchesByMatcher(currentUser.id);
          const pendingCount = matches.filter(match => {
            const myDecision = match.matcherAId === currentUser.id ? match.statusMatcherA : match.statusMatcherB;
            return myDecision === 'pending';
          }).length;
          setPendingReviewCount(pendingCount);
        } catch (error) {
          console.error("Error fetching pending matches count:", error);
          setPendingReviewCount(0);
        } finally {
          setIsLoadingPendingCount(false);
        }
      }
    }
    fetchPendingMatches();
  }, [currentUser]);

  if (!currentUser) {
    return <p>Loading user data...</p>;
  }

  const QuickLink = ({ href, icon: Icon, title, description, count }: { href: string, icon: React.ElementType, title: string, description: string, count?: number }) => (
    <Link href={href} className="block group relative">
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
      {count !== undefined && count > 0 && (
          <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground animate-pulse">
            <Bell className="mr-1 h-3 w-3" /> {count}
          </Badge>
        )}
    </Link>
  );
  
  if (currentUser.role !== USER_ROLES.RECOMMENDER) {
    return (
        <Card className="max-w-lg mx-auto mt-10">
            <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>This area is for Matchmakers only. Please sign up or log in as a Matchmaker.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild><Link href="/auth/login">Go to Login</Link></Button>
            </CardContent>
        </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="bg-gradient-to-r from-primary/80 via-primary to-accent/60 text-primary-foreground shadow-xl overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between p-8">
          <div>
            <h1 className="font-headline text-4xl font-bold mb-2">Hello, Matchmaker {currentUser.name}!</h1>
            <p className="font-body text-lg opacity-90">
              Ready to create profiles for your friends and find them great matches?
            </p>
          </div>
        </div>
      </Card>

      <section>
        <h2 className="font-headline text-2xl font-semibold text-foreground mb-4">Your Matchmaking Toolkit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickLink href="/profile-cards" icon={BookUser} title="Manage Profile Cards" description="Create and manage profiles for your single friends. Find matches from here." />
          <QuickLink 
            href="/potential-matches" 
            icon={Users} 
            title="Review Matches" 
            description="Review and approve/reject AI-suggested matches between profile cards." 
            count={isLoadingPendingCount ? undefined : pendingReviewCount}
          />
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">New to Matchmaking?</CardTitle>
          <CardDescription className="font-body">Start by creating Profile Cards for your single friends. The more detail, the better the matches!</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/profile-cards">Create a Profile Card</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
