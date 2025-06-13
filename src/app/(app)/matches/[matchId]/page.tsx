"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { mockRecommendations, mockUserProfiles, mockMatchFeedback } from '@/lib/mockData';
import type { Recommendation, UserProfile, MatchFeedback } from '@/types';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, ArrowLeft, CheckCircle, XCircle, MessageSquare, Star, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

export default function MatchDetailPage() {
  const params = useParams();
  const matchId = params.matchId as string;
  const router = useRouter();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [potentialMatchProfile, setPotentialMatchProfile] = useState<UserProfile | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [existingFeedback, setExistingFeedback] = useState<MatchFeedback | null>(null);

  useEffect(() => {
    if (matchId && currentUser) {
      const foundRec = mockRecommendations.find(rec => rec.id === matchId && rec.singleId === currentUser.id);
      if (foundRec) {
        setRecommendation(foundRec);
        const matchProfile = mockUserProfiles.find(p => p.id === foundRec.potentialMatchId);
        setPotentialMatchProfile(matchProfile || null);
        
        const feedback = mockMatchFeedback.find(f => f.recommendationId === foundRec.id && f.userId === currentUser.id);
        setExistingFeedback(feedback || null);
        if (feedback) {
            setFeedbackText(feedback.comments || '');
            setRating(feedback.rating || 0);
        }

      } else {
        // Recommendation not found or doesn't belong to user
        toast({ variant: "destructive", title: "Error", description: "Match recommendation not found." });
        router.push('/matches');
      }
      setIsLoading(false);
    }
  }, [matchId, currentUser, router, toast]);

  const handleFeedbackSubmit = (isInterested: boolean) => {
    if (!recommendation || !currentUser) return;
    setIsSubmitting(true);

    const newFeedback: MatchFeedback = {
      id: `fb-${Date.now()}`,
      recommendationId: recommendation.id,
      userId: currentUser.id,
      isInterested,
      comments: feedbackText,
      rating: rating,
      createdAt: new Date().toISOString(),
    };

    // Simulate API call
    setTimeout(() => {
      const existingFeedbackIndex = mockMatchFeedback.findIndex(f => f.recommendationId === recommendation.id && f.userId === currentUser.id);
      if (existingFeedbackIndex !== -1) {
        mockMatchFeedback[existingFeedbackIndex] = newFeedback;
      } else {
        mockMatchFeedback.push(newFeedback);
      }
      
      const recIndex = mockRecommendations.findIndex(r => r.id === recommendation.id);
      if(recIndex !== -1) {
        mockRecommendations[recIndex].status = isInterested ? 'accepted' : 'rejected';
        setRecommendation(mockRecommendations[recIndex]); // Update local state
      }

      setExistingFeedback(newFeedback); // Update local state for feedback
      setIsSubmitting(false);
      toast({
        title: `Match ${isInterested ? 'Accepted' : 'Declined'}!`,
        description: `Your decision has been recorded. ${isInterested ? 'Next step: We will notify the other party if they also accept!' : ''}`,
      });
      if(isInterested && recommendation.status === 'accepted' && potentialMatchProfile?.role === 'single'){
         // Simulate "email sending" part after both accept. This is a simplification.
         // A real system would check if the other party also accepted.
         toast({
            title: "Mutual Interest!",
            description: `Both you and ${potentialMatchProfile.name} have shown interest! An 'email' has been sent to connect you both. (Simulated)`,
            duration: 7000,
         });
      }
      // router.push('/matches'); // Optionally redirect
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!recommendation || !potentialMatchProfile) {
    return <p className="text-center font-body">Match details not found.</p>;
  }
  
  const alreadyResponded = recommendation.status === 'accepted' || recommendation.status === 'rejected';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <Button variant="outline" onClick={() => router.back()} className="mb-6 border-primary text-primary hover:bg-primary/10">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Matches
      </Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="font-headline text-3xl text-foreground mb-4">Potential Match:</h2>
          <ProfileDisplay profile={potentialMatchProfile} />
        </div>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-primary">Recommendation Details</CardTitle>
            <CardDescription className="font-body">
              Recommended by <span className="font-semibold">{recommendation.recommenderName}</span> on {format(new Date(recommendation.createdAt), "MMMM d, yyyy")}
            </CardDescription>
             <Badge variant={recommendation.status === 'pending' ? 'default' : recommendation.status === 'accepted' ? 'outline' : 'destructive'} className="capitalize self-start bg-primary/20 text-primary border-primary/30 mt-2">
                Status: {recommendation.status}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-headline text-lg text-foreground mb-1 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary"/>Recommender's Note:</h3>
              <p className="font-body text-foreground/90 whitespace-pre-line bg-secondary/30 p-3 rounded-md">{recommendation.notes}</p>
            </div>
            {recommendation.familyIntro && (
              <div>
                <h3 className="font-headline text-lg text-foreground mb-1">Family Introduction:</h3>
                <p className="font-body text-foreground/90 whitespace-pre-line bg-secondary/30 p-3 rounded-md">{recommendation.familyIntro}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">Your Thoughts?</CardTitle>
          { alreadyResponded && existingFeedback ? (
            <CardDescription className="font-body">You responded on {format(new Date(existingFeedback.createdAt), "MMMM d, yyyy")}. You can update your feedback if needed.</CardDescription>
          ) : (
            <CardDescription className="font-body">Let your recommender (and us) know what you think. This helps improve future matches!</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="feedbackText" className="font-body text-foreground/80 mb-1 block">Your Private Feedback/Notes:</Label>
            <Textarea
              id="feedbackText"
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Share your thoughts on this match..."
              className="min-h-[100px] font-body bg-card"
              disabled={isSubmitting}
            />
          </div>
          <div>
            <Label className="font-body text-foreground/80 mb-1 block">Rate this match suggestion (optional):</Label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map(star => (
                <Button
                  key={star}
                  variant="ghost"
                  size="icon"
                  onClick={() => setRating(star)}
                  className={`hover:text-primary ${rating >= star ? 'text-primary' : 'text-muted-foreground/50'}`}
                  disabled={isSubmitting}
                  aria-label={`Rate ${star} star`}
                >
                  <Star className={`w-6 h-6 ${rating >= star ? 'fill-current' : ''}`} />
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4 pt-6 border-t">
          { recommendation.status === 'pending' || !alreadyResponded ? (
            <>
            <Button
              onClick={() => handleFeedbackSubmit(true)}
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-body text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
              Accept Match
            </Button>
            <Button
              onClick={() => handleFeedbackSubmit(false)}
              disabled={isSubmitting}
              variant="destructive"
              className="w-full sm:w-auto font-body text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <XCircle className="mr-2 h-5 w-5" />}
              Decline Match
            </Button>
            </>
          ) : (
            <Button
              onClick={() => handleFeedbackSubmit(existingFeedback?.isInterested || false)} // Resubmit with existing decision or let them change
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground font-body text-lg py-3 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Send className="mr-2 h-5 w-5" />}
              Update Feedback
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
