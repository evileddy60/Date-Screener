
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { findPotentialMatches } from '@/ai/flows/find-potential-matches-flow';
import type { FindPotentialMatchesOutput } from '@/ai/flows/find-potential-matches-flow';
import { getProfileCardById, getPotentialMatchById, getAllProfileCards } from '@/lib/firestoreService';
import { mockUserProfiles } from '@/lib/mockData'; // For matcher names
import type { ProfileCard, PotentialMatch, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Sparkles, ArrowLeft, ArrowRight, Info, Users, Search, Gift, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

function FindMatchesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useAuth();
  
  const targetProfileCardId = searchParams.get('cardId');

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [targetProfileCard, setTargetProfileCard] = useState<ProfileCard | null>(null);
  const [suggestedMatches, setSuggestedMatches] = useState<PotentialMatch[]>([]);
  const [allProfileCards, setAllProfileCards] = useState<ProfileCard[]>([]);


  useEffect(() => {
    async function setupAndMatch() {
      if (!targetProfileCardId || !currentUser) {
        setError("Missing target profile card ID or user not authenticated.");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const card = await getProfileCardById(targetProfileCardId);
        if (!card) {
          setError("Target profile card not found.");
          setIsLoading(false);
          return;
        }
        if (card.createdByMatcherId !== currentUser.id) {
            setError("You can only find matches for profile cards you created.");
            setIsLoading(false);
            return;
        }
        setTargetProfileCard(card);

        // Fetch all profile cards for displaying match details later
        const allCardsFromDb = await getAllProfileCards();
        setAllProfileCards(allCardsFromDb);
        
        const result: FindPotentialMatchesOutput = await findPotentialMatches({ 
          targetProfileCardId: targetProfileCardId,
          requestingMatcherId: currentUser.id 
        });
        
        const fetchedNewMatches: PotentialMatch[] = [];
        for (const id of result.createdPotentialMatchIds) {
          const pm = await getPotentialMatchById(id);
          if (pm) {
            fetchedNewMatches.push(pm);
          }
        }
        setSuggestedMatches(fetchedNewMatches);

      } catch (err: any) {
        console.error("Error finding matches:", err);
        setError(err.message || "An error occurred while trying to find matches. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    setupAndMatch();

  }, [targetProfileCardId, currentUser]);

  const getInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';

  if (!currentUser) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="font-body text-muted-foreground">Loading user information...</p>
        </div>
      )
  }

  if (isLoading && !targetProfileCard) { // Initial loading of target card
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="font-body text-lg text-muted-foreground">Loading profile card details...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto my-10">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <div className="mt-4">
            <Button onClick={() => router.push('/profile-cards')} variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back to Profile Cards
            </Button>
        </div>
      </Alert>
    );
  }
  
  if (!targetProfileCard && !isLoading) { // Fallback if card is not found and not loading
    return <p className="text-center font-body text-lg">Profile card not found.</p>;
  }
  
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Button onClick={() => router.push('/profile-cards')} variant="outline" size="sm">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to My Profile Cards
      </Button>

      {targetProfileCard && (
        <Card className="shadow-xl">
            <CardHeader className="text-center bg-gradient-to-r from-primary/10 via-background to-secondary/10 p-6">
                <div className="mx-auto bg-primary/20 p-3 rounded-full w-fit mb-3">
                    <Search className="h-10 w-10 text-primary" />
                </div>
            <CardTitle className="font-headline text-3xl text-primary">Finding Matches for {targetProfileCard.friendName}</CardTitle>
            <CardDescription className="font-body text-foreground/80">
                Our AI is looking for compatible profiles based on {targetProfileCard.friendName}'s details.
            </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <Card className="mb-6 bg-card border-primary/30">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="w-16 h-16 border-2 border-primary">
                            <AvatarImage src={targetProfileCard.photoUrl} alt={targetProfileCard.friendName} data-ai-hint="person portrait"/>
                            <AvatarFallback className="text-xl">{getInitials(targetProfileCard.friendName)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="font-headline text-xl text-primary">{targetProfileCard.friendName}</CardTitle>
                            <CardDescription className="font-body text-xs text-muted-foreground">Your friend's profile card</CardDescription>
                        </div>
                    </CardHeader>
                </Card>

            {isLoading && ( // This is for the AI matching process loading
                <div className="flex flex-col items-center justify-center py-10 space-y-3">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="font-body text-lg text-muted-foreground">AI is searching for potential matches...</p>
                <p className="font-body text-sm text-muted-foreground/80">This might take a few moments.</p>
                </div>
            )}

            {!isLoading && error && ( // Error during AI matching
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Matching Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            {!isLoading && !error && suggestedMatches.length === 0 && (
                <Alert className="bg-secondary/50 border-secondary">
                <Gift className="h-4 w-4 text-secondary-foreground" />
                <AlertTitle className="font-headline">No New Matches Found</AlertTitle>
                <AlertDescription className="font-body">
                    The AI couldn't find any new suitable matches for {targetProfileCard.friendName} at this time from the available profile cards.
                    This could be due to specific preferences or a limited pool of other cards.
                    More cards from other matchers might yield results later!
                </AlertDescription>
                </Alert>
            )}

            {!isLoading && !error && suggestedMatches.length > 0 && (
                <div className="space-y-6">
                <h2 className="font-headline text-2xl text-foreground text-center">AI's Top Suggestions for {targetProfileCard.friendName}</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    {suggestedMatches.map(pm => {
                    const matchedCard = allProfileCards.find(pc => pc.id === (pm.profileCardAId === targetProfileCardId ? pm.profileCardBId : pm.profileCardAId));
                    // Matcher name is now on the card itself, or fallback to mockUserProfiles if needed (though should be on card)
                    const matchedCardOwnerName = matchedCard?.matcherName || mockUserProfiles.find(user => user.id === matchedCard?.createdByMatcherId)?.name || 'Unknown Matcher';


                    if (!matchedCard) return null;

                    return (
                        <Card key={pm.id} className="flex flex-col">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <Avatar className="w-14 h-14 border-2 border-secondary">
                                    <AvatarImage src={matchedCard.photoUrl} alt={matchedCard.friendName} data-ai-hint="person portrait"/>
                                    <AvatarFallback className="text-lg">{getInitials(matchedCard.friendName)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <CardTitle className="font-headline text-xl text-primary">{matchedCard.friendName}</CardTitle>
                                    <CardDescription className="font-body text-xs text-muted-foreground">
                                        Card by: {matchedCardOwnerName}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2 text-sm">
                            <p className="font-body text-foreground/90 line-clamp-3">{matchedCard.bio}</p>
                            {pm.compatibilityReason && (
                            <Alert variant="default" className="bg-primary/5 border-primary/10 text-xs p-2">
                                    <Info className="h-3 w-3 text-primary/80" />
                                    <AlertTitle className="font-semibold text-primary/80 text-xs">AI Note</AlertTitle>
                                    <AlertDescription className="text-foreground/80 line-clamp-2">{pm.compatibilityReason}</AlertDescription>
                                </Alert>
                            )}
                            {pm.compatibilityScore && <Badge variant="secondary">Score: {pm.compatibilityScore}/100</Badge>}
                        </CardContent>
                        <CardFooter>
                            <Button asChild variant="outline" size="sm" className="w-full">
                            <Link href={`/potential-matches/${pm.id}`}>
                                View Full Match Details <ArrowRight className="ml-2 h-4 w-4"/>
                            </Link>
                            </Button>
                        </CardFooter>
                        </Card>
                    );
                    })}
                </div>
                <div className="text-center mt-8">
                    <Button asChild size="lg">
                        <Link href="/potential-matches">
                            <Users className="mr-2 h-5 w-5" /> Review All My Potential Matches
                        </Link>
                    </Button>
                </div>
                </div>
            )}
            </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function FindMatchesPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-2">Loading...</p>
            </div>
        }>
            <FindMatchesContent />
        </Suspense>
    );
}
