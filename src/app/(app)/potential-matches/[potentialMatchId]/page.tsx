
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getMockPotentialMatches, saveMockPotentialMatch, getMockProfileCards, mockUserProfiles } from '@/lib/mockData';
import type { PotentialMatch, ProfileCard, UserProfile } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ArrowLeft, UserCircle, Users, ThumbsUp, ThumbsDown, Mail, MessageSquare, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default function PotentialMatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const potentialMatchId = params.potentialMatchId as string;

  const [potentialMatch, setPotentialMatch] = useState<PotentialMatch | null>(null);
  const [profileCardA, setProfileCardA] = useState<ProfileCard | null>(null);
  const [profileCardB, setProfileCardB] = useState<ProfileCard | null>(null);
  const [matcherA, setMatcherA] = useState<UserProfile | null>(null);
  const [matcherB, setMatcherB] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (potentialMatchId && currentUser) {
      setIsLoading(true);
      const allPotentialMatches = getMockPotentialMatches();
      const match = allPotentialMatches.find(pm => pm.id === potentialMatchId);

      if (!match) {
        setError("Potential match not found.");
        setIsLoading(false);
        return;
      }

      if (match.matcherAId !== currentUser.id && match.matcherBId !== currentUser.id) {
        setError("You do not have permission to view this match.");
        setIsLoading(false);
        return;
      }

      setPotentialMatch(match);
      const allProfileCards = getMockProfileCards();
      const cardA = allProfileCards.find(pc => pc.id === match.profileCardAId);
      const cardB = allProfileCards.find(pc => pc.id === match.profileCardBId);
      setProfileCardA(cardA || null);
      setProfileCardB(cardB || null);

      const mUserA = mockUserProfiles.find(u => u.id === match.matcherAId);
      const mUserB = mockUserProfiles.find(u => u.id === match.matcherBId);
      setMatcherA(mUserA || null);
      setMatcherB(mUserB || null);

      if (!cardA || !cardB || !mUserA || !mUserB) {
        setError("Could not load all details for this match. Some referenced profiles or matchers may be missing.");
      }
      setIsLoading(false);
    }
  }, [potentialMatchId, currentUser]);

  const handleUpdateMatchStatus = (newStatus: 'accepted' | 'rejected') => {
    if (!potentialMatch || !currentUser) return;

    const currentUsersRoleInMatch: 'A' | 'B' | null = 
      potentialMatch.matcherAId === currentUser.id ? 'A' :
      potentialMatch.matcherBId === currentUser.id ? 'B' : null;

    if (!currentUsersRoleInMatch) return;

    const updatedMatch: PotentialMatch = { ...potentialMatch };
    if (currentUsersRoleInMatch === 'A') {
      updatedMatch.statusMatcherA = newStatus;
    } else {
      updatedMatch.statusMatcherB = newStatus;
    }
    updatedMatch.updatedAt = new Date().toISOString();

    saveMockPotentialMatch(updatedMatch); // Save to managed mock data
    setPotentialMatch(updatedMatch); 

    console.log(`Match ${potentialMatch.id} status updated by Matcher ${currentUsersRoleInMatch} to ${newStatus}`);

    if (updatedMatch.statusMatcherA === 'accepted' && updatedMatch.statusMatcherB === 'accepted') {
      console.log("Both matchers accepted! Time to notify the friends (pcA and pcB).");
      // Future: Implement notification logic
    }
  };

  const getInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  
  const getStatusBadge = (status: 'pending' | 'accepted' | 'rejected') => {
    switch (status) {
      case 'pending': return <Badge variant="outline" className="border-yellow-500 text-yellow-600 bg-yellow-500/10"><Clock className="mr-1 h-3 w-3" />Pending</Badge>;
      case 'accepted': return <Badge variant="default" className="bg-green-600 hover:bg-green-700 text-white"><CheckCircle className="mr-1 h-3 w-3" />Accepted</Badge>;
      case 'rejected': return <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3" />Rejected</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><Loader2 className="h-12 w-12 animate-spin text-primary" /> <p className="ml-2">Loading Match Details...</p></div>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto">
        <XCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <div className="mt-4">
            <Button onClick={() => router.back()} variant="outline"><ArrowLeft className="mr-2 h-4 w-4"/>Go Back</Button>
        </div>
      </Alert>
    );
  }

  if (!potentialMatch || !profileCardA || !profileCardB || !matcherA || !matcherB || !currentUser) {
    return <Alert variant="destructive" className="max-w-xl mx-auto">Invalid match data. Please try again.</Alert>;
  }
  
  const currentMatchersDecision = potentialMatch.matcherAId === currentUser.id ? potentialMatch.statusMatcherA : potentialMatch.statusMatcherB;
  const otherMatchersDecision = potentialMatch.matcherAId === currentUser.id ? potentialMatch.statusMatcherB : potentialMatch.statusMatcherA;
  const otherMatcher = potentialMatch.matcherAId === currentUser.id ? matcherB : matcherA;

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Button onClick={() => router.push('/potential-matches')} variant="outline" size="sm" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Potential Matches
      </Button>

      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 p-6">
          <CardTitle className="font-headline text-3xl text-primary text-center">
            Potential Match Details
          </CardTitle>
          <CardDescription className="font-body text-center text-foreground/80">
            Review the compatibility between {profileCardA.friendName} and {profileCardB.friendName}.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          {potentialMatch.compatibilityReason && (
            <Alert className="bg-primary/5 border-primary/20">
              <MessageSquare className="h-5 w-5 text-primary" />
              <AlertTitle className="font-headline text-primary">AI Compatibility Note</AlertTitle>
              <AlertDescription className="font-body text-foreground/90">{potentialMatch.compatibilityReason}</AlertDescription>
              {potentialMatch.compatibilityScore && (
                <div className="mt-2">
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">Score: {potentialMatch.compatibilityScore}/100</Badge>
                </div>
              )}
            </Alert>
          )}

          <div className="grid md:grid-cols-2 gap-6 items-start">
            {[profileCardA, profileCardB].map((card, index) => {
              const owningMatcher = index === 0 ? matcherA : matcherB;
              return (
                <Card key={card.id} className="h-full flex flex-col">
                  <CardHeader className="items-center text-center bg-card">
                    <Avatar className="w-20 h-20 mb-3 border-4 border-primary/30">
                      <AvatarImage src={card.photoUrl || `https://placehold.co/100x100.png`} alt={card.friendName} data-ai-hint="person portrait"/>
                      <AvatarFallback className="text-2xl bg-secondary text-secondary-foreground">{getInitials(card.friendName)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="font-headline text-2xl text-primary">{card.friendName}</CardTitle>
                    <CardDescription className="font-body text-xs text-muted-foreground">
                      Profile Card by: {owningMatcher.name}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 flex-grow text-sm">
                    <p className="font-body text-foreground/90 line-clamp-4">{card.bio}</p>
                    <div>
                      <h4 className="font-semibold text-foreground/80 mb-1">Interests:</h4>
                      <div className="flex flex-wrap gap-1">
                        {card.interests.map(interest => <Badge key={interest} variant="outline" className="text-xs">{interest}</Badge>)}
                      </div>
                    </div>
                    {card.preferences && (
                      <div>
                        <h4 className="font-semibold text-foreground/80 mb-1">Preferences:</h4>
                        <ul className="list-disc list-inside text-xs text-muted-foreground">
                          {card.preferences.ageRange && <li>Age: {card.preferences.ageRange}</li>}
                          {card.preferences.seeking && <li>Seeking: {card.preferences.seeking}</li>}
                          {card.preferences.location && <li>Location: {card.preferences.location}</li>}
                          {card.preferences.gender && <li>Gender: {card.preferences.gender}</li>}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="bg-secondary/30">
            <CardHeader>
                <CardTitle className="font-headline text-xl text-secondary-foreground flex items-center gap-2"><Users className="w-6 h-6"/> Matcher Decisions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-card rounded-md shadow-sm">
                    <div>
                        <p className="font-semibold text-foreground">{currentUser.name} (Your decision)</p>
                        <p className="text-xs text-muted-foreground">Matcher for {potentialMatch.matcherAId === currentUser.id ? profileCardA.friendName : profileCardB.friendName}</p>
                    </div>
                    {getStatusBadge(currentMatchersDecision)}
                </div>
                <div className="flex justify-between items-center p-3 bg-card rounded-md shadow-sm">
                     <div>
                        <p className="font-semibold text-foreground">{otherMatcher.name}'s decision</p>
                        <p className="text-xs text-muted-foreground">Matcher for {potentialMatch.matcherAId === otherMatcher.id ? profileCardA.friendName : profileCardB.friendName}</p>
                    </div>
                    {getStatusBadge(otherMatchersDecision)}
                </div>
            </CardContent>
          </Card>

          {currentMatchersDecision === 'pending' && (
            <div className="text-center space-y-3 pt-4 border-t">
              <p className="font-body text-lg text-foreground">What do you think of this match for your friend?</p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => handleUpdateMatchStatus('accepted')} size="lg" className="bg-green-600 hover:bg-green-700 text-white">
                  <ThumbsUp className="mr-2 h-5 w-5" /> Accept Match
                </Button>
                <Button onClick={() => handleUpdateMatchStatus('rejected')} size="lg" variant="destructive">
                  <ThumbsDown className="mr-2 h-5 w-5" /> Reject Match
                </Button>
              </div>
            </div>
          )}
          
          {currentMatchersDecision !== 'pending' && (
            <p className="font-body text-center text-muted-foreground italic mt-4">You have already responded to this match suggestion.</p>
          )}

           {potentialMatch.statusMatcherA === 'accepted' && potentialMatch.statusMatcherB === 'accepted' && (
             <Alert variant="default" className="bg-green-500/10 border-green-500/30 text-green-700">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <AlertTitle className="font-headline text-green-700">Both Matchers Accepted!</AlertTitle>
                <AlertDescription className="font-body">
                    The next step would be to notify {profileCardA.friendName} (via {profileCardA.friendEmail || 'their provided contact'}) and {profileCardB.friendName} (via {profileCardB.friendEmail || 'their provided contact'}) about this potential match.
                    This email notification step is not yet implemented.
                </AlertDescription>
                <div className="mt-3">
                    <Button variant="outline" size="sm" className="border-green-600 text-green-700 hover:bg-green-600/10">
                        <Mail className="mr-2 h-4 w-4" /> (Simulate) Notify Friends
                    </Button>
                </div>
             </Alert>
           )}

        </CardContent>
        <CardFooter className="p-6 bg-muted/30 border-t">
            <p className="text-xs text-muted-foreground text-center w-full">
                Match ID: {potentialMatch.id} | Created: {new Date(potentialMatch.createdAt).toLocaleDateString()}
                {potentialMatch.updatedAt && ` | Last Updated: ${new Date(potentialMatch.updatedAt).toLocaleDateString()}`}
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
