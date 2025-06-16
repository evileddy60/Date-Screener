
"use client";

import type { UserProfile } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AtSign, Briefcase, Heart, Info, MessageSquare, Users } from 'lucide-react';
import { generateUniqueAvatarSvgDataUri } from '@/lib/utils'; // Import for fallback

interface ProfileDisplayProps {
  profile: UserProfile;
}

export function ProfileDisplay({ profile }: ProfileDisplayProps) {
  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Ensure photoUrl always has a value, generate if missing (should be rare)
  const photoUrlToDisplay = profile.photoUrl || generateUniqueAvatarSvgDataUri(profile.id);

  return (
    <Card className="shadow-lg">
      <CardHeader className="items-center text-center">
        <Avatar className="w-24 h-24 mb-4 border-4 border-primary/50">
          {/* data-ai-hint is not directly applicable to SVG data URIs for Unsplash search, but good for placeholders */}
          <AvatarImage src={photoUrlToDisplay} alt={profile.name} data-ai-hint="abstract avatar" />
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

        {/* These sections are less relevant for a recommender's own profile but kept for structure if UserProfile type evolves */}
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

        {/* Recommender notes are not applicable for the Matchmaker's own profile */}
      </CardContent>
    </Card>
  );
}
