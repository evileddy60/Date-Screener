
"use client";

import type { ProfileCard } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Info, Edit, Search, CalendarDays, AtSign } from 'lucide-react'; // Changed SearchHeart to Search
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation'; // Added for navigation

interface ProfileCardDisplayProps {
  profileCard: ProfileCard;
  onEdit: () => void;
  onFindMatch: (profileCardId: string) => void; // Changed to accept ID
}

export function ProfileCardDisplay({ profileCard, onEdit, onFindMatch }: ProfileCardDisplayProps) {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  const router = useRouter(); // Initialize router

  const handleFindMatchClick = () => {
    onFindMatch(profileCard.id); // Call parent handler which should navigate
  };

  return (
    <Card className="shadow-lg hover:shadow-primary/20 transition-all duration-300 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4 mb-3">
          <Avatar className="w-16 h-16 border-2 border-secondary">
            <AvatarImage src={profileCard.photoUrl} alt={profileCard.friendName} data-ai-hint="person portrait" />
            <AvatarFallback className="text-xl bg-secondary text-secondary-foreground">
              {getInitials(profileCard.friendName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-2xl text-primary">{profileCard.friendName}</CardTitle>
            <CardDescription className="font-body text-sm text-foreground/70 flex items-center gap-1">
              <User className="w-3 h-3"/> Card by: {profileCard.matcherName}
            </CardDescription>
             {profileCard.friendEmail && (
                <CardDescription className="font-body text-xs text-foreground/60 flex items-center gap-1 mt-0.5">
                    <AtSign className="w-3 h-3"/> {profileCard.friendEmail}
                </CardDescription>
             )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
            {profileCard.interests.slice(0, 3).map(interest => (
                 <Badge key={interest} variant="secondary" className="font-body text-xs bg-accent/70 text-accent-foreground capitalize">{interest}</Badge>
            ))}
            {profileCard.interests.length > 3 && <Badge variant="outline" className="font-body text-xs">+{profileCard.interests.length-3} more</Badge>}
        </div>
      </CardHeader>
      <CardContent className="flex-grow space-y-3">
        <div className="font-body text-sm text-foreground/80 flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
          <p className="line-clamp-4 leading-relaxed">
            {profileCard.bio}
          </p>
        </div>
        {profileCard.preferences && (
            <div className="font-body text-xs text-muted-foreground space-y-0.5">
                {profileCard.preferences.ageRange && <p>Age: {profileCard.preferences.ageRange}</p>}
                {profileCard.preferences.seeking && <p>Seeking: {profileCard.preferences.seeking}</p>}
                {profileCard.preferences.location && <p>Location: {profileCard.preferences.location}</p>}
            </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-4 border-t">
        <div className="flex justify-between items-center w-full">
            <p className="font-body text-xs text-muted-foreground flex items-center gap-1">
            <CalendarDays className="w-3 h-3" /> Created {formatDistanceToNow(new Date(profileCard.createdAt), { addSuffix: true })}
            </p>
            <Button onClick={onEdit} size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10">
                <Edit className="mr-2 h-4 w-4" /> Edit
            </Button>
        </div>
        <Button onClick={handleFindMatchClick} size="sm" variant="default" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow hover:shadow-md transition-all">
          <Search className="mr-2 h-4 w-4" /> Find Match for {profileCard.friendName}
        </Button>
      </CardFooter>
    </Card>
  );
}
