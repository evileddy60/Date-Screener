"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getPotentialMatchesByMatcher, getProfileCardById } from '@/lib/firestoreService';
import type { PotentialMatch, ProfileCard } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Users, Search, AlertTriangle, ArrowRight, CheckCircle, XCircle, Clock, Info } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { USER_ROLES } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function PotentialMatchesPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [relevantMatches, setRelevantMatches] = useState<PotentialMatch[]>([]);
  // Store ProfileCards in a map for quick lookup after fetching
  const [profileCardMap, setProfileCardMap] = useState<Record<string, ProfileCard>>({});
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!authLoading && currentUser) {
        if (currentUser.role !== USER_ROLES.RECOMMENDER) {
          router.push('/dashboard'); 
          return;
        }
        
        setIsLoadingData(true);
        try {
          const userMatches = await getPotentialMatchesByMatcher(currentUser.id);
          userMatches.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setRelevantMatches(userMatches);

          // Fetch all unique profile card IDs from these matches
          const profileCardIds = new Set<string>();
          userMatches.forEach(match => {
            profileCardIds.add(match.profileCardAId);
            profileCardIds.add(match.profileCardBId);
          });

          const cardMap: Record<string, ProfileCard> = {};
          for (const id of Array.from(profileCardIds)) {
            const card = await getProfileCardById(id);
            if (card) {
              cardMap[id] = card;
            }
          }
          setProfileCardMap(cardMap);

        } catch (error) {
            console.error("Error fetching potential matches or profile cards:", error);
        } finally {
            setIsLoadingData(false);
        }

      } else if (!authLoading && !currentUser) {
        router.push('/auth/login');
      }
    }
    fetchData();
  }, [currentUser, authLoading, router]);

  const getInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

  const getStatusForMatcher = (match: PotentialMatch, matcherId: string): 'pending' | 'accepted' | 'rejected' => {
    if (match.matcherAId === matcherId) return match.statusMatcherA;
    if (match.matcherBId === matcherId) return match.statusMatcherB;
    return 'pending'; // Should not happen if data is consistent
  };
  
  const getOtherMatcherStatus = (match: PotentialMatch, currentMatcherId: string): 'pending' | 'accepted' | 'rejected' => {
    if (match.matcherAId === currentMatcherId) return match.statusMatcherB;
    if (match.matcherBId === currentMatcherId) return match.statusMatcherA;
    return 'pending'; // Should not happen
  };

  const getStatusBadge = (status: 'pending' | 'accepted' | 'rejected') => {
    switch(status) {
      case 'pending': return <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-500/10"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'accepted': return <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle className="mr-1 h-3 w-3" />Accepted</Badge>;
      case 'rejected': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (authLoading || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Loading Your Potential Matches...</p>
      </div>
    );
  }
  
  if (!currentUser) return null; // Should be redirected by useEffect

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-semibold text-primary">Review Potential Matches</h1>
        <p className="font-body text-lg text-foreground/80 mt-2">
          Here are the system-suggested pairings involving your Profile Cards. Review and decide if they're a good fit!
        </p>
      </div>

      {relevantMatches.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
             <div className="mx-auto bg-secondary p-4 rounded-full w-fit mb-4">
                <Search className="h-12 w-12 text-secondary-foreground" />
            </div>
            <CardTitle className="font-headline text-2xl">No Potential Matches Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-body text-muted-foreground mb-4">
              Looks like there are no active match suggestions for you to review right now.
            </p>
            <p className="font-body text-muted-foreground">
              Try creating more Profile Cards or use the "Find Match" feature on your existing cards to generate new possibilities.
            </p>
            <Button asChild className="mt-6">
              <Link href="/profile-cards">Go to My Profile Cards</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {relevantMatches.map(match => {
            const cardA = profileCardMap[match.profileCardAId];
            const cardB = profileCardMap[match.profileCardBId];
            
            if (!cardA || !cardB) {
              return (
                <Card key={match.id} className="border-destructive">
                  <CardHeader><CardTitle>Error Loading Match</CardTitle></CardHeader>
                  <CardContent>Could not load full details for match ID: {match.id}. Referenced profile card(s) missing.</CardContent>
                </Card>
              );
            }

            const yourCard = cardA.createdByMatcherId === currentUser.id ? cardA : cardB;
            const otherCard = cardA.createdByMatcherId === currentUser.id ? cardB : cardA;
            const yourStatus = getStatusForMatcher(match, currentUser.id);
            const otherStatus = getOtherMatcherStatus(match, currentUser.id);
            const yourFriendStatus = yourCard.id === match.profileCardAId ? match.statusFriendA : match.statusFriendB;
            const otherFriendStatus = otherCard.id === match.profileCardAId ? match.statusFriendA : match.statusFriendB;


            return (
              <Card key={match.id} className="shadow-lg hover:shadow-primary/20 transition-all duration-300 flex flex-col">
                <CardHeader className="pb-4">
                  <CardTitle className="font-headline text-xl text-primary text-center">
                    {yourCard.friendName} & {otherCard.friendName}
                  </CardTitle>
                  <CardDescription className="font-body text-xs text-muted-foreground text-center">
                    Match suggested on: {new Date(match.createdAt).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow space-y-4">
                  <div className="flex justify-around items-center text-center">
                    <div>
                      <Avatar className="w-16 h-16 mx-auto mb-1 border-2 border-primary/50">
                        <AvatarImage src={yourCard.photoUrl} alt={yourCard.friendName} data-ai-hint="person portrait"/>
                        <AvatarFallback>{getInitials(yourCard.friendName)}</AvatarFallback>
                      </Avatar>
                      <p className="font-semibold text-sm">{yourCard.friendName}</p>
                      <p className="text-xs text-muted-foreground">(Your Friend)</p>
                    </div>
                    <Users className="w-6 h-6 text-primary mx-2" />
                    <div>
                      <Avatar className="w-16 h-16 mx-auto mb-1 border-2 border-secondary">
                        <AvatarImage src={otherCard.photoUrl} alt={otherCard.friendName} data-ai-hint="person portrait"/>
                        <AvatarFallback>{getInitials(otherCard.friendName)}</AvatarFallback>
                      </Avatar>
                      <p className="font-semibold text-sm">{otherCard.friendName}</p>
                      <p className="text-xs text-muted-foreground">(Matched with)</p>
                    </div>
                  </div>
                   {match.compatibilityReason && (
                     <Alert variant="default" className="bg-primary/5 border-primary/10 text-xs p-3">
                        <Info className="h-4 w-4 text-primary" />
                        <AlertTitle className="font-semibold text-primary/90 text-sm">System Note</AlertTitle>
                        <AlertDescription className="text-foreground/80 line-clamp-2">{match.compatibilityReason}</AlertDescription>
                        {match.compatibilityScore && <Badge variant="secondary" className="mt-1 text-xs">Score: {match.compatibilityScore}</Badge>}
                    </Alert>
                   )}
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between items-center"><span>Your Decision:</span> {getStatusBadge(yourStatus)}</div>
                    <div className="flex justify-between items-center"><span>Other Matcher's Decision:</span> {getStatusBadge(otherStatus)}</div>
                  </div>
                  {match.friendEmailSent && (
                    <div className="space-y-1 text-xs pt-2 mt-2 border-t">
                      <p className="font-semibold text-muted-foreground">Friend Responses:</p>
                      <div className="flex justify-between items-center">
                        <span>{yourCard.friendName}:</span> {getStatusBadge(yourFriendStatus)}
                      </div>
                      <div className="flex justify-between items-center">
                        <span>{otherCard.friendName}:</span> {getStatusBadge(otherFriendStatus)}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-4 border-t">
                  <Button asChild className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href={`/potential-matches/${match.id}`}>
                      View Details & Respond <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
