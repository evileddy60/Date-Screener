
"use client";

// This component is no longer used directly as MatchCard for single's recommendations.
// It will need to be significantly adapted or replaced to display
// "PotentialMatch" data between two ProfileCards for Matcher review.
// Keeping the file for reference, but it's effectively deprecated in its current form.

import type { Recommendation } from '@/types'; // This type is from the old flow
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, MessageSquare, CalendarDays, ArrowRight, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DeprecatedMatchCardProps {
  recommendation: Recommendation; // Old Recommendation type
  onViewDetails: (recommendationId: string) => void;
}

export function MatchCard({ recommendation, onViewDetails }: DeprecatedMatchCardProps) {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="shadow-lg hover:shadow-primary/20 transition-all duration-300 flex flex-col h-full opacity-50 cursor-not-allowed">
      <CardHeader className="pb-3">
         <CardDescription className="font-body text-center">DEPRECATED COMPONENT (MatchCard)</CardDescription>
        <div className="flex items-center gap-4 mb-3">
          <Avatar className="w-16 h-16 border-2 border-secondary">
            <AvatarImage src={recommendation.potentialMatchPhotoUrl} alt={recommendation.potentialMatchName} data-ai-hint="person portrait" />
            <AvatarFallback className="text-xl bg-secondary text-secondary-foreground">
              {getInitials(recommendation.potentialMatchName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-2xl text-primary">{recommendation.potentialMatchName}</CardTitle>
            <CardDescription className="font-body text-sm text-foreground/70 flex items-center gap-1">
              <User className="w-3 h-3"/> Recommended by: {recommendation.recommenderName}
            </CardDescription>
          </div>
        </div>
        <Badge variant={recommendation.status === 'pending' ? 'default' : recommendation.status === 'accepted' ? 'outline' : 'destructive'} className="capitalize self-start bg-primary/20 text-primary border-primary/30">
          Status: {recommendation.status}
        </Badge>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="font-body text-sm text-foreground/80 flex items-start gap-2">
          <MessageSquare className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
          <p className="line-clamp-3 leading-relaxed">
            <span className="font-semibold">Recommender's Note:</span> {recommendation.notes}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t">
        <p className="font-body text-xs text-muted-foreground mb-2 sm:mb-0 flex items-center gap-1">
          <CalendarDays className="w-3 h-3" /> Recommended {formatDistanceToNow(new Date(recommendation.createdAt), { addSuffix: true })}
        </p>
        <Button onClick={() => onViewDetails(recommendation.id)} size="sm" variant="default" className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow hover:shadow-md transition-all">
          View Details <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
}
