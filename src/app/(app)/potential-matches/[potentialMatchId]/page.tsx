
"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getPotentialMatchById, updatePotentialMatch, getProfileCardById } from '@/lib/firestoreService';
import { mockUserProfiles } from '@/lib/mockData'; 
import type { PotentialMatch, ProfileCard, UserProfile } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, ArrowLeft, UserCircle, Users, ThumbsUp, ThumbsDown, Mail, MessageSquare, CheckCircle, XCircle, Clock, Send } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';


export default function PotentialMatchDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const potentialMatchId = params.potentialMatchId as string;

  const [potentialMatch, setPotentialMatch] = useState<PotentialMatch | null>(null);
  const [profileCardA, setProfileCardA] = useState<ProfileCard | null>(null);
  const [profileCardB, setProfileCardB] = useState<ProfileCard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function fetchMatchDetails() {
      if (potentialMatchId && currentUser) {
        setIsLoading(true);
        setError(null);
        try {
          const match = await getPotentialMatchById(potentialMatchId);

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

          const [cardA, cardB] = await Promise.all([
            getProfileCardById(match.profileCardAId),
            getProfileCardById(match.profileCardBId)
          ]);

          setProfileCardA(cardA || null);
          setProfileCardB(cardB || null);

          if (!cardA || !cardB) { 
            setError("Could not load all profile card details for this match.");
          }

        } catch (err: any) {
            console.error("Error fetching match details:", err);
            setError(err.message || "Failed to load match details.");
        } finally {
            setIsLoading(false);
        }
      }
    }
    fetchMatchDetails();
  }, [potentialMatchId, currentUser]);

  const handleUpdateMatcherDecision = async (newStatus: 'accepted' | 'rejected') => {
    if (!potentialMatch || !currentUser || isUpdating) return;
    setIsUpdating(true);

    const currentUsersRoleInMatch: 'A' | 'B' | null = 
      potentialMatch.matcherAId === currentUser.id ? 'A' :
      potentialMatch.matcherBId === currentUser.id ? 'B' : null;

    if (!currentUsersRoleInMatch) {
        setIsUpdating(false);
        return;
    }

    const updatedFields: Partial<PotentialMatch> = {
        updatedAt: new Date().toISOString()
    };
    if (currentUsersRoleInMatch === 'A') {
      updatedFields.statusMatcherA = newStatus;
    } else {
      updatedFields.statusMatcherB = newStatus;
    }
    
    try {
        await updatePotentialMatch({ ...potentialMatch, ...updatedFields } as PotentialMatch); 
        setPotentialMatch(prev => prev ? { ...prev, ...updatedFields } as PotentialMatch : null); 
        toast({title: "Decision Recorded!", description: `Your decision for your friend has been recorded as ${newStatus}.`});
    } catch (error) {
        console.error("Error updating match status:", error);
        toast({variant: "destructive", title: "Update Failed", description: "Could not update match status."});
    } finally {
        setIsUpdating(false);
    }
  };

  const handleSimulateSendEmail = async () => {
    if (!potentialMatch || isUpdating || !profileCardA || !profileCardB) return;
    setIsUpdating(true);

    const updatedFields: Partial<PotentialMatch> = {
        friendEmailSent: true,
        updatedAt: new Date().toISOString()
    };

    // Ensure friend statuses are set to pending if not already decided
    if (potentialMatch.statusFriendA !== 'accepted' && potentialMatch.statusFriendA !== 'rejected') {
        updatedFields.statusFriendA = 'pending';
    }
    if (potentialMatch.statusFriendB !== 'accepted' && potentialMatch.statusFriendB !== 'rejected') {
        updatedFields.statusFriendB = 'pending';
    }


    try {
        await updatePotentialMatch({ ...potentialMatch, ...updatedFields } as PotentialMatch);
        setPotentialMatch(prev => prev ? { ...prev, ...updatedFields } as PotentialMatch : null);
        toast({
            title: "Introduction Emails (Simulated) Sent!",
            description: `Emails would be sent to ${profileCardA.friendName} (via ${profileCardA.friendEmail || 'their contact'}) and ${profileCardB.friendName} (via ${profileCardB.friendEmail || 'their contact'}). Their response status is now pending.`,
            duration: 7000,
        });
    } catch (error) {
        console.error("Error simulating email send:", error);
        toast({variant: "destructive", title: "Simulation Failed", description: "Could not update match status for email simulation."});
    } finally {
        setIsUpdating(false);
    }
  };


  const getInitials = (name?: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '?';
  
  const getStatusBadge = (status?: 'pending' | 'accepted' | 'rejected') => {
    if (!status) return <Badge variant="secondary">Unknown</Badge>;
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

  if (!potentialMatch || !profileCardA || !profileCardB || !currentUser) { 
    return <Alert variant="destructive" className="max-w-xl mx-auto">Invalid or incomplete match data. Please try again.</Alert>;
  }
  
  const currentMatchersDecision = potentialMatch.matcherAId === currentUser.id ? potentialMatch.statusMatcherA : potentialMatch.statusMatcherB;
  const otherMatchersDecision = potentialMatch.matcherAId === currentUser.id ? potentialMatch.statusMatcherB : potentialMatch.statusMatcherA;
  
  const nameMatcherA = profileCardA.matcherName || 'Matcher for ' + profileCardA.friendName;
  const nameMatcherB = profileCardB.matcherName || 'Matcher for ' + profileCardB.friendName;
  const otherMatcherName = potentialMatch.matcherAId === currentUser.id ? nameMatcherB : nameMatcherA;

  const bothMatchersAccepted = potentialMatch.statusMatcherA === 'accepted' && potentialMatch.statusMatcherB === 'accepted';
  const friendAResponded = potentialMatch.statusFriendA && potentialMatch.statusFriendA !== 'pending';
  const friendBResponded = potentialMatch.statusFriendB && potentialMatch.statusFriendB !== 'pending';
  const anyFriendRejected = potentialMatch.statusFriendA === 'rejected' || potentialMatch.statusFriendB === 'rejected';
  const bothFriendsAccepted = potentialMatch.statusFriendA === 'accepted' && potentialMatch.statusFriendB === 'accepted';

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <Button onClick={() => router.push('/potential-matches')} variant="outline" size="sm" className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Potential Matches
      </Button>

      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 via-background to-secondary/10 p-6">
          <CardTitle className="font-headline text-3xl text-primary text-center">
            Potential Match Review
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
              const owningMatcherName = index === 0 ? nameMatcherA : nameMatcherB;
              return (
                <Card key={card.id} className="h-full flex flex-col">
                  <CardHeader className="items-center text-center bg-card">
                    <Avatar className="w-20 h-20 mb-3 border-4 border-primary/30">
                      <AvatarImage src={card.photoUrl || `https://placehold.co/100x100.png`} alt={card.friendName} data-ai-hint="person portrait"/>
                      <AvatarFallback className="text-2xl bg-secondary text-secondary-foreground">{getInitials(card.friendName)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="font-headline text-2xl text-primary">{card.friendName}</CardTitle>
                    <CardDescription className="font-body text-xs text-muted-foreground">
                      Profile Card by: {owningMatcherName}
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
                          {card.preferences.seeking && Array.isArray(card.preferences.seeking) && card.preferences.seeking.length > 0 && <li>Seeking: {card.preferences.seeking.join(', ')}</li>}
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
                        <p className="font-semibold text-foreground">{currentUser.name} (Your decision for {potentialMatch.matcherAId === currentUser.id ? profileCardA.friendName : profileCardB.friendName})</p>
                    </div>
                    {getStatusBadge(currentMatchersDecision)}
                </div>
                <div className="flex justify-between items-center p-3 bg-card rounded-md shadow-sm">
                     <div>
                        <p className="font-semibold text-foreground">{otherMatcherName}'s decision for {potentialMatch.matcherAId === currentUser.id ? profileCardB.friendName : profileCardA.friendName}</p>
                    </div>
                    {getStatusBadge(otherMatchersDecision)}
                </div>
            </CardContent>
          </Card>

          {currentMatchersDecision === 'pending' && !anyFriendRejected && (
            <div className="text-center space-y-3 pt-4 border-t">
              <p className="font-body text-lg text-foreground">What do you think of this match for your friend?</p>
              <div className="flex justify-center gap-4">
                <Button onClick={() => handleUpdateMatcherDecision('accepted')} size="lg" className="bg-green-600 hover:bg-green-700 text-white" disabled={isUpdating}>
                  {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <ThumbsUp className="mr-2 h-5 w-5" />} Approve Match
                </Button>
                <Button onClick={() => handleUpdateMatcherDecision('rejected')} size="lg" variant="destructive" disabled={isUpdating}>
                   {isUpdating ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <ThumbsDown className="mr-2 h-5 w-5" />} Decline Match
                </Button>
              </div>
            </div>
          )}
          
          {currentMatchersDecision !== 'pending' && !anyFriendRejected && (
            <p className="font-body text-center text-muted-foreground italic mt-4">You have already responded to this match suggestion for your friend.</p>
          )}

           {bothMatchersAccepted && !potentialMatch.friendEmailSent && !anyFriendRejected && (
             <Alert variant="default" className="bg-primary/10 border-primary/30 text-primary-foreground">
                <Send className="h-5 w-5 text-primary" />
                <AlertTitle className="font-headline text-primary">Both Matchers Approved!</AlertTitle>
                <AlertDescription className="font-body text-foreground/90">
                    The next step is to send an introductory email to {profileCardA.friendName} and {profileCardB.friendName}.
                    This will allow them to privately accept or decline this potential introduction.
                </AlertDescription>
                <div className="mt-3">
                    <Button variant="default" size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={handleSimulateSendEmail} disabled={isUpdating}>
                        {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <Mail className="mr-2 h-4 w-4" />} (Simulate) Send Introduction Email to Friends
                    </Button>
                </div>
             </Alert>
           )}

            {potentialMatch.friendEmailSent && !anyFriendRejected && !bothFriendsAccepted && (
                 <Alert variant="default" className="bg-blue-500/10 border-blue-500/30">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <AlertTitle className="font-headline text-blue-700">Introduction Emails Sent</AlertTitle>
                    <AlertDescription className="font-body text-blue-700/90">
                        Emails have been sent to {profileCardA.friendName} and {profileCardB.friendName}. Waiting for their responses.
                        (Friend response links and UI are not yet implemented).
                    </AlertDescription>
                 </Alert>
            )}
            
            {bothFriendsAccepted && (
                 <Alert variant="default" className="bg-green-500/10 border-green-500/30 text-green-700">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <AlertTitle className="font-headline text-green-700">It's a Mutual Match!</AlertTitle>
                    <AlertDescription className="font-body">
                        Great news! Both {profileCardA.friendName} and {profileCardB.friendName} have accepted the introduction.
                        You should now facilitate their contact. (Contact info sharing details are not yet implemented).
                    </AlertDescription>
                 </Alert>
            )}

            {anyFriendRejected && (
                 <Alert variant="destructive">
                    <XCircle className="h-5 w-5" />
                    <AlertTitle className="font-headline">Match Declined by Friend</AlertTitle>
                    <AlertDescription className="font-body">
                        Unfortunately, one of the friends has chosen not to proceed with this introduction. This match will not go forward.
                    </AlertDescription>
                 </Alert>
            )}
            
            {(friendAResponded || friendBResponded) && !anyFriendRejected && !bothFriendsAccepted && (
                <Card className="mt-4">
                    <CardHeader><CardTitle className="font-headline text-lg">Friend Responses So Far:</CardTitle></CardHeader>
                    <CardContent className="text-sm space-y-1">
                        {friendAResponded && <p>{profileCardA.friendName}'s response: {getStatusBadge(potentialMatch.statusFriendA)}</p>}
                        {friendBResponded && <p>{profileCardB.friendName}'s response: {getStatusBadge(potentialMatch.statusFriendB)}</p>}
                        {!friendAResponded && <p>{profileCardA.friendName}'s response: {getStatusBadge('pending')}</p>}
                        {!friendBResponded && <p>{profileCardB.friendName}'s response: {getStatusBadge('pending')}</p>}
                    </CardContent>
                </Card>
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

