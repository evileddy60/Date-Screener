
"use client";

import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserCircle, BookUser, ShieldCheck, ArrowRight, Users, Bell, PartyPopper, Globe, Shuffle, Info } from 'lucide-react';
import { USER_ROLES } from '@/lib/constants';
import { useEffect, useState } from 'react';
import type { PotentialMatch, ProfileCard } from '@/types';
import { getPotentialMatchesByMatcher, getAllProfileCards } from '@/lib/firestoreService';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

// Renamed and adapted StatDisplayCard to be an item within a larger card.
const StatItemDisplay = ({ icon: Icon, title, value, description, isLoading, highlight }: { icon: React.ElementType, title: string, value: number | string, description: string, isLoading?: boolean, highlight?: boolean }) => (
  <div className={cn("flex flex-col p-4 rounded-lg transition-all duration-300 hover:bg-muted/30", highlight && Number(value) > 0 ? "bg-primary/5 border border-primary/20" : "bg-muted/10 border border-transparent")}>
    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
      <h3 className={cn("text-sm font-medium", highlight && Number(value) > 0 ? "text-primary" : "text-muted-foreground")}>{title}</h3>
      <Icon className={cn("h-5 w-5", highlight && Number(value) > 0 ? "text-primary" : "text-muted-foreground")} />
    </div>
    <div>
      {isLoading ? (
        <Skeleton className="h-8 w-1/2 rounded-md" />
      ) : (
        <div className={cn("text-2xl font-bold", highlight && Number(value) > 0 ? "text-primary" : "text-foreground")}>{value}</div>
      )}
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  </div>
);


export default function DashboardPage() {
  const { currentUser } = useAuth();
  
  const [userProfileCardsCount, setUserProfileCardsCount] = useState(0);
  const [matchSuggestionsCount, setMatchSuggestionsCount] = useState(0);
  const [pendingReviewCount, setPendingReviewCount] = useState(0);
  const [successfulIntroductionsCount, setSuccessfulIntroductionsCount] = useState(0);
  const [networkProfileCardsCount, setNetworkProfileCardsCount] = useState(0);
  
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const MAX_PROFILE_CARDS_DISPLAY_LIMIT = 5; // Used for conditional display

  useEffect(() => {
    async function fetchDashboardData() {
      if (currentUser && currentUser.role === USER_ROLES.RECOMMENDER) {
        setIsLoadingStats(true);
        try {
          // Fetch all cards once to ensure data consistency
          const allCards = await getAllProfileCards();

          // Partition cards into "mine" and "network" client-side
          const myCards: ProfileCard[] = [];
          const networkCards: ProfileCard[] = [];
          for (const card of allCards) {
            if (card.createdByMatcherId === currentUser.id) {
              myCards.push(card);
            } else {
              networkCards.push(card);
            }
          }
          setUserProfileCardsCount(myCards.length);
          setNetworkProfileCardsCount(networkCards.length);

          // Fetch matches separately
          const matchesInvolvingUser = await getPotentialMatchesByMatcher(currentUser.id);
          setMatchSuggestionsCount(matchesInvolvingUser.length);

          const pendingCount = matchesInvolvingUser.filter(match => {
            const myDecision = match.matcherAId === currentUser.id ? match.statusMatcherA : match.statusMatcherB;
            return myDecision === 'pending';
          }).length;
          setPendingReviewCount(pendingCount);

          const successfulCount = matchesInvolvingUser.filter(match => 
            match.statusMatcherA === 'accepted' && 
            match.statusMatcherB === 'accepted' &&
            match.statusFriendA === 'accepted' &&
            match.statusFriendB === 'accepted'
          ).length;
          setSuccessfulIntroductionsCount(successfulCount);

        } catch (error) {
          console.error("Error fetching dashboard data:", error);
          setUserProfileCardsCount(0);
          setMatchSuggestionsCount(0);
          setPendingReviewCount(0);
          setSuccessfulIntroductionsCount(0);
          setNetworkProfileCardsCount(0);
        } finally {
          setIsLoadingStats(false);
        }
      }
    }
    fetchDashboardData();
  }, [currentUser]);

  if (!currentUser) {
    return <p>Loading user data...</p>;
  }

  const QuickLink = ({ href, icon: Icon, title, description, count, isLoadingCount }: { href: string, icon: React.ElementType, title: string, description: string, count?: number, isLoadingCount?: boolean }) => (
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
      {count !== undefined && count > 0 && !isLoadingCount && (
          <Badge className="absolute top-3 right-3 bg-destructive text-destructive-foreground animate-pulse">
            <Bell className="mr-1 h-3 w-3" /> {count}
          </Badge>
        )}
      {isLoadingCount && (
         <Skeleton className="absolute top-3 right-3 h-6 w-10 rounded-full" />
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
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-2xl font-semibold text-foreground">Your Matchmaking Stats</CardTitle>
            <CardDescription className="font-body text-muted-foreground">An overview of your matchmaking activity.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <StatItemDisplay 
              icon={BookUser} 
              title="Your Profile Cards" 
              value={userProfileCardsCount}
              description="Profiles you've created for friends."
              isLoading={isLoadingStats}
            />
            <StatItemDisplay 
              icon={Shuffle} 
              title="Match Suggestions" 
              value={matchSuggestionsCount}
              description="Total suggestions involving your cards."
              isLoading={isLoadingStats}
            />
            <StatItemDisplay 
              icon={Bell} 
              title="Pending Your Review" 
              value={pendingReviewCount}
              description="Suggestions needing your decision."
              isLoading={isLoadingStats}
              highlight={true}
            />
            <StatItemDisplay 
              icon={PartyPopper} 
              title="Successful Introductions" 
              value={successfulIntroductionsCount}
              description="Matches where everyone accepted!"
              isLoading={isLoadingStats}
            />
            <StatItemDisplay 
              icon={Globe} 
              title="Cards in Network" 
              value={networkProfileCardsCount}
              description="Profiles from other matchmakers."
              isLoading={isLoadingStats}
            />
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="font-headline text-2xl font-semibold text-foreground mb-4">Your Matchmaking Toolkit</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuickLink 
            href="/profile-cards" 
            icon={BookUser} 
            title="Manage Profile Cards" 
            description="Create and manage profiles for your single friends. Find matches from here." 
          />
          <QuickLink 
            href="/potential-matches" 
            icon={Users} 
            title="Review Matches" 
            description="Review and approve/reject system-suggested matches between profile cards." 
            count={pendingReviewCount}
            isLoadingCount={isLoadingStats}
          />
        </div>
      </section>

      {userProfileCardsCount < MAX_PROFILE_CARDS_DISPLAY_LIMIT && (
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
      )}
    </div>
  );
}
