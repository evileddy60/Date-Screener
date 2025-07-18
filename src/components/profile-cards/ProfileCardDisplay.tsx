
"use client";

import type { ProfileCard } from '@/types';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Info, Edit, Search, CalendarDays, AtSign, Heart, MapPin, UsersIcon, Trash2, Cake, VenetianMask, Home, GraduationCap, Briefcase, CheckCircle } from 'lucide-react'; // Added CheckCircle
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';
import { mockUserProfiles } from '@/lib/mockData'; 

interface ProfileCardDisplayProps {
  profileCard: ProfileCard;
  onEdit: () => void;
  onFindMatch: (profileCardId: string) => void;
  onDeleteRequest: (profileCardId: string) => void;
}

export function ProfileCardDisplay({ profileCard, onEdit, onFindMatch, onDeleteRequest }: ProfileCardDisplayProps) {
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  const router = useRouter();

  const handleFindMatchClick = () => {
    onFindMatch(profileCard.id);
  };
  
  const handleDeleteClick = () => {
    onDeleteRequest(profileCard.id);
  };

  const matcherProfile = mockUserProfiles.find(user => user.id === profileCard.createdByMatcherId);
  const displayMatcherName = matcherProfile?.name || profileCard.matcherName || 'Unknown Matcher';
  const isMatched = profileCard.matchStatus === 'matched';

  return (
    <Card className="shadow-lg hover:shadow-primary/20 transition-all duration-300 flex flex-col h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4 mb-3">
          <Avatar className="w-16 h-16 border-2 border-secondary">
            <AvatarImage src={profileCard.photoUrl} alt={profileCard.friendName} data-ai-hint="person portrait"/>
            <AvatarFallback className="text-xl bg-secondary text-secondary-foreground">
              {getInitials(profileCard.friendName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="font-headline text-2xl text-primary">{profileCard.friendName}</CardTitle>
            <CardDescription className="font-body text-sm text-foreground/70 flex items-center gap-1">
              <User className="w-3 h-3"/> Card by: {displayMatcherName}
            </CardDescription>
             {profileCard.friendEmail && (
                <CardDescription className="font-body text-xs text-foreground/60 flex items-center gap-1 mt-0.5">
                    <AtSign className="w-3 h-3"/> {profileCard.friendEmail}
                </CardDescription>
             )}
             <div className="flex flex-wrap gap-x-2">
                {profileCard.friendAge && (
                    <CardDescription className="font-body text-xs text-foreground/60 flex items-center gap-1 mt-0.5">
                        <Cake className="w-3 h-3"/> Age: {profileCard.friendAge}
                    </CardDescription>
                )}
                {profileCard.friendGender && (
                    <CardDescription className="font-body text-xs text-foreground/60 flex items-center gap-1 mt-0.5">
                        <VenetianMask className="w-3 h-3"/> Gender: {profileCard.friendGender}
                    </CardDescription>
                )}
                {profileCard.friendPostalCode && (
                     <CardDescription className="font-body text-xs text-foreground/60 flex items-center gap-1 mt-0.5">
                        <Home className="w-3 h-3"/> Postal Code: {profileCard.friendPostalCode}
                    </CardDescription>
                )}
                {profileCard.educationLevel && (
                     <CardDescription className="font-body text-xs text-foreground/60 flex items-center gap-1 mt-0.5">
                        <GraduationCap className="w-3 h-3"/> {profileCard.educationLevel}
                    </CardDescription>
                )}
                {profileCard.occupation && (
                     <CardDescription className="font-body text-xs text-foreground/60 flex items-center gap-1 mt-0.5">
                        <Briefcase className="w-3 h-3"/> {profileCard.occupation}
                    </CardDescription>
                )}
             </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-1 items-center">
            {isMatched && (
                <Badge variant="default" className="w-fit bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle className="mr-1 h-3 w-3" /> Matched
                </Badge>
            )}
            {profileCard.matchAttempts !== undefined && profileCard.matchAttempts > 0 && (
                <Badge variant="secondary" title={`This card has been in ${profileCard.matchAttempts} potential match suggestion${profileCard.matchAttempts === 1 ? '' : 's'}.`}>
                    <UsersIcon className="mr-1 h-3 w-3" /> Attempts: {profileCard.matchAttempts}
                </Badge>
            )}
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
          <div className="font-body text-xs text-muted-foreground space-y-1 border-t border-border/50 pt-2 mt-2">
            <h4 className="font-semibold text-foreground/70 mb-1">Preferences for Matches:</h4>
            {profileCard.preferences.ageRange && (
              <p className="flex items-center gap-1"><CalendarDays className="w-3 h-3 text-primary/70"/> Desired Age: {profileCard.preferences.ageRange}</p>
            )}
            {profileCard.preferences.seeking && profileCard.preferences.seeking.length > 0 && (
              <p className="flex items-start gap-1">
                <Heart className="w-3 h-3 text-primary/70 mt-0.5" /> Seeking: { 
                    Array.isArray(profileCard.preferences.seeking) 
                        ? profileCard.preferences.seeking.join(', ') 
                        : profileCard.preferences.seeking 
                }
              </p>
            )}
            {profileCard.preferences.gender && ( // This is the GENDER THEY ARE SEEKING
              <p className="flex items-center gap-1"><UsersIcon className="w-3 h-3 text-primary/70"/> Interested in: {profileCard.preferences.gender}</p>
            )}
            {profileCard.preferences.location && ( // This is the PROXIMITY from their postal code
              <p className="flex items-center gap-1"><MapPin className="w-3 h-3 text-primary/70"/> Proximity: {profileCard.preferences.location}</p>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 pt-4 border-t">
        <div className="flex justify-between items-center w-full">
            <p className="font-body text-xs text-muted-foreground flex items-center gap-1">
            <CalendarDays className="w-3 h-3" /> Created {formatDistanceToNow(new Date(profileCard.createdAt), { addSuffix: true })}
            </p>
            <div className="flex gap-2">
              <Button onClick={onEdit} size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary/10" disabled={isMatched} title={isMatched ? 'Cannot edit a matched profile' : 'Edit profile'}>
                  <Edit className="mr-2 h-4 w-4" /> Edit
              </Button>
              <Button onClick={handleDeleteClick} size="sm" variant="destructive" className="bg-destructive/90 hover:bg-destructive text-destructive-foreground" disabled={isMatched} title={isMatched ? 'Cannot delete a matched profile' : 'Delete profile'}>
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
        </div>
        <Button onClick={handleFindMatchClick} size="sm" variant="default" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground rounded-md shadow hover:shadow-md transition-all" disabled={isMatched} title={isMatched ? 'This friend has been successfully matched' : `Find a match for ${profileCard.friendName}` }>
          <Search className="mr-2 h-4 w-4" /> {isMatched ? 'Successfully Matched!' : `Find Match for ${profileCard.friendName}`}
        </Button>
      </CardFooter>
    </Card>
  );
}
