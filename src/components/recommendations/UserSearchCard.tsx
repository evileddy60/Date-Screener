
"use client";

// This component is no longer used directly as UserSearchCard.
// It has been replaced by ProfileCardDisplay.tsx for the new Profile Card concept.
// Keeping the file for reference or if it needs to be repurposed later.
// For now, it's effectively deprecated in the current app flow.

import type { UserProfile } from '@/types'; // This would need to be ProfileCard if reused
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HandHeart, Info } from 'lucide-react';

interface DeprecatedUserSearchCardProps {
  user: UserProfile; // Should be ProfileCard if adapted
  onRecommend: (userToRecommendFor: UserProfile) => void; // Action would change
}

export function UserSearchCard({ user, onRecommend }: DeprecatedUserSearchCardProps) {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="shadow-lg hover:shadow-primary/20 transition-all duration-300 flex flex-col h-full opacity-50 cursor-not-allowed">
      <CardHeader className="items-center text-center pb-3">
        <Avatar className="w-20 h-20 mb-3 border-2 border-primary/30">
          <AvatarImage src={user.photoUrl} alt={user.name} data-ai-hint="person portrait" />
          <AvatarFallback className="text-2xl bg-secondary text-secondary-foreground">{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <CardTitle className="font-headline text-xl text-primary">{user.name}</CardTitle>
        {/* <Badge variant="outline" className="capitalize border-accent text-accent-foreground bg-accent/20">{user.role}</Badge> */}
         <CardDescription className="font-body">DEPRECATED COMPONENT</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow text-center">
        <p className="font-body text-sm text-foreground/80 line-clamp-3 leading-relaxed flex items-start gap-1">
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary"/> <span>{user.bio || "No bio available."}</span></p>
      </CardContent>
      <CardFooter>
          <p className="font-body text-xs text-muted-foreground w-full text-center">This component (UserSearchCard) is deprecated.</p>
      </CardFooter>
    </Card>
  );
}
