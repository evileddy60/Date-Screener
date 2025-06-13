"use client";

import type { UserProfile } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AtSign, Briefcase, Heart, Info, MessageSquare, Users } from 'lucide-react';

interface ProfileDisplayProps {
  profile: UserProfile;
}

export function ProfileDisplay({ profile }: ProfileDisplayProps) {
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="items-center text-center">
        <Avatar className="w-24 h-24 mb-4 border-4 border-primary/50">
          <AvatarImage src={profile.photoUrl || `https://placehold.co/200x200?text=${getInitials(profile.name)}`} alt={profile.name} data-ai-hint="profile person" />
          <AvatarFallback className="text-3xl bg-secondary text-secondary-foreground">{getInitials(profile.name)}</AvatarFallback>
        </Avatar>
        <CardTitle className="font-headline text-3xl text-primary">{profile.name}</CardTitle>
        <CardDescription className="font-body text-foreground/80 flex items-center gap-1">
          <AtSign className="w-4 h-4" /> {profile.email}
        </CardDescription>
        <Badge variant={profile.role === 'single' ? "default" : "secondary"} className="mt-2 capitalize bg-primary text-primary-foreground">
          {profile.role}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-headline text-lg text-foreground mb-2 flex items-center gap-2"><Info className="w-5 h-5 text-primary" /> Bio</h3>
          <p className="font-body text-foreground/90 whitespace-pre-line leading-relaxed">
            {profile.bio || "No bio provided."}
          </p>
        </div>

        {profile.interests && profile.interests.length > 0 && (
          <div>
            <h3 className="font-headline text-lg text-foreground mb-2 flex items-center gap-2"><Heart className="w-5 h-5 text-primary" /> Interests</h3>
            <div className="flex flex-wrap gap-2">
              {profile.interests.map((interest, index) => (
                <Badge key={index} variant="outline" className="font-body border-primary/50 text-primary bg-primary/10">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {profile.preferences && Object.keys(profile.preferences).length > 0 && (
           <div>
            <h3 className="font-headline text-lg text-foreground mb-2 flex items-center gap-2"><Briefcase className="w-5 h-5 text-primary" /> Preferences</h3>
            <ul className="font-body list-disc list-inside space-y-1 text-foreground/90">
                {Object.entries(profile.preferences).map(([key, value]) => (
                    <li key={key}><span className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}:</span> {String(value)}</li>
                ))}
            </ul>
          </div>
        )}

        {profile.role === 'single' && profile.recommenderNotes && profile.recommenderNotes.length > 0 && (
          <div>
            <h3 className="font-headline text-lg text-foreground mb-2 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-primary" /> Notes from Recommenders</h3>
            <div className="space-y-3">
            {profile.recommenderNotes.map((note, index) => (
              <Card key={index} className="bg-secondary/50">
                <CardHeader className="pb-2">
                  <CardDescription className="font-body text-xs text-secondary-foreground/80 flex items-center gap-1">
                    <Users className="w-3 h-3"/> From: {note.recommenderName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="font-body text-sm text-secondary-foreground">{note.notes}</p>
                </CardContent>
              </Card>
            ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
