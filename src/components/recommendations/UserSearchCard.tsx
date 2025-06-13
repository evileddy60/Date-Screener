"use client";

import type { UserProfile } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { HandHeart, Info } from 'lucide-react';

interface UserSearchCardProps {
  user: UserProfile;
  onRecommend: (userToRecommendFor: UserProfile) => void;
}

export function UserSearchCard({ user, onRecommend }: UserSearchCardProps) {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <Card className="shadow-lg hover:shadow-primary/20 transition-all duration-300 flex flex-col h-full">
      <CardHeader className="items-center text-center pb-3">
        <Avatar className="w-20 h-20 mb-3 border-2 border-primary/30">
          <AvatarImage src={user.photoUrl} alt={user.name} data-ai-hint="person portrait" />
          <AvatarFallback className="text-2xl bg-secondary text-secondary-foreground">{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <CardTitle className="font-headline text-xl text-primary">{user.name}</CardTitle>
        <Badge variant="outline" className="capitalize border-accent text-accent-foreground bg-accent/20">{user.role}</Badge>
      </CardHeader>
      <CardContent className="flex-grow text-center">
        <p className="font-body text-sm text-foreground/80 line-clamp-3 leading-relaxed flex items-start gap-1">
            <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary"/> <span>{user.bio || "No bio available."}</span></p>
      </CardContent>
      <CardFooter>
        {user.role === 'single' && (
          <Button onClick={() => onRecommend(user)} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow hover:shadow-md transition-all">
            <HandHeart className="mr-2 h-4 w-4" /> Recommend for {user.name}
          </Button>
        )}
         {user.role === 'recommender' && (
          <p className="font-body text-xs text-muted-foreground w-full text-center">This user is a recommender.</p>
        )}
      </CardFooter>
    </Card>
  );
}
