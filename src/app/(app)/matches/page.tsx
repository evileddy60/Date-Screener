"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { mockRecommendations, mockUserProfiles } from '@/lib/mockData';
import type { Recommendation, UserProfile } from '@/types';
import { MatchCard } from '@/components/matches/MatchCard';
import { Loader2, Inbox } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function MatchesPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [userRecommendations, setUserRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && currentUser) {
      if (currentUser.role !== 'single') {
        router.push('/dashboard'); // Redirect if not a single
        return;
      }
      // Simulate fetching recommendations for the current user
      const fetchedRecommendations = mockRecommendations.filter(rec => rec.singleId === currentUser.id);
      setUserRecommendations(fetchedRecommendations);
      setIsLoading(false);
    } else if (!authLoading && !currentUser) {
      router.push('/auth/login');
    }
  }, [currentUser, authLoading, router]);

  const handleViewDetails = (recommendationId: string) => {
    router.push(`/matches/${recommendationId}`);
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg font-medium text-foreground">Loading Your Matches...</p>
      </div>
    );
  }
  
  if (currentUser?.role !== 'single') {
     return (
      <Alert variant="destructive" className="max-w-2xl mx-auto">
        <Inbox className="h-4 w-4" />
        <AlertTitle className="font-headline">Access Denied</AlertTitle>
        <AlertDescription className="font-body">
          This page is for users looking for matches.
        </AlertDescription>
      </Alert>
    );
  }


  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-semibold text-primary">Your Recommended Matches</h1>
        <p className="font-body text-lg text-foreground/80 mt-2">
          Here are some potential matches recommended by your friends and family.
        </p>
      </div>

      {userRecommendations.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <div className="mx-auto bg-secondary p-4 rounded-full w-fit mb-4">
              <Inbox className="h-12 w-12 text-secondary-foreground" />
            </div>
            <CardTitle className="font-headline text-2xl">No Recommendations Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-body text-muted-foreground">
              It looks like you don't have any match recommendations at the moment.
              Check back later, or perhaps gently remind your recommenders!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {userRecommendations.map(rec => (
            <MatchCard key={rec.id} recommendation={rec} onViewDetails={handleViewDetails} />
          ))}
        </div>
      )}
    </div>
  );
}
