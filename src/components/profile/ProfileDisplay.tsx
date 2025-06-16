
"use client";

import type { UserProfile, PrivacySettingsData } from '@/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as ShadCardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AtSign, Briefcase, Heart, Info, MessageSquare, Users, ShieldCheck, Eye, Bell, Mail } from 'lucide-react';
import { generateUniqueAvatarSvgDataUri } from '@/lib/utils';
import { defaultPrivacySettings } from '@/types';

interface ProfileDisplayProps {
  profile: UserProfile;
}

export function ProfileDisplay({ profile }: ProfileDisplayProps) {
  const getInitials = (name: string) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const photoUrlToDisplay = profile.photoUrl || generateUniqueAvatarSvgDataUri(profile.id);
  const privacy = profile.privacySettings || defaultPrivacySettings;

  const getProfileVisibilityText = (value: string) => {
    switch(value) {
      case 'recommenders_only': return 'Visible to Other Matchmakers';
      case 'network_only': return 'Visible to Matchmakers in Your Network (Future)';
      case 'private': return 'Private / Invite Only (Future)';
      default: return 'Setting not specified';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="items-center text-center">
          <Avatar className="w-24 h-24 mb-4 border-4 border-primary/50">
            <AvatarImage src={photoUrlToDisplay} alt={profile.name} data-ai-hint="abstract avatar" />
            <AvatarFallback className="text-3xl bg-secondary text-secondary-foreground">{getInitials(profile.name)}</AvatarFallback>
          </Avatar>
          <CardTitle className="font-headline text-3xl text-primary">{profile.name}</CardTitle>
          <ShadCardDescription className="font-body text-foreground/80 flex items-center justify-center gap-1">
            <AtSign className="w-4 h-4" /> {profile.email}
          </ShadCardDescription>
          <Badge variant={profile.role === 'single' ? "default" : "secondary"} className="mt-2 capitalize bg-primary text-primary-foreground">
            {profile.role}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-headline text-lg text-foreground mb-1 flex items-center gap-2"><Info className="w-5 h-5 text-primary" /> Bio</h3>
            <p className="font-body text-foreground/90 whitespace-pre-line leading-relaxed pl-7">
              {profile.bio || "No bio provided."}
            </p>
          </div>

          {/* Interests and Preferences are less relevant for the Matchmaker's own profile but kept for structure */}
          {profile.interests && profile.interests.length > 0 && (
            <div>
              <h3 className="font-headline text-lg text-foreground mb-1 flex items-center gap-2"><Heart className="w-5 h-5 text-primary" /> Interests</h3>
              <div className="flex flex-wrap gap-2 pl-7">
                {profile.interests.map((interest, index) => (
                  <Badge key={index} variant="outline" className="font-body border-primary/50 text-primary bg-primary/10">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-xl text-primary flex items-center gap-2"><ShieldCheck className="w-6 h-6"/> Privacy Settings</CardTitle>
          <ShadCardDescription className="font-body">Your current privacy preferences.</ShadCardDescription>
        </CardHeader>
        <CardContent className="space-y-3 font-body text-sm text-foreground/90">
          <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/20">
            <Eye className="w-5 h-5 text-primary shrink-0" />
            <div>
              <span className="font-semibold">Profile Card Visibility:</span> {getProfileVisibilityText(privacy.profileVisibility)}
              <p className="text-xs text-muted-foreground">Who can see the profile cards you create for friends.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/20">
            <Mail className="w-5 h-5 text-primary shrink-0" />
            <div>
              <span className="font-semibold">New Match Suggestion Emails:</span> {privacy.emailNotificationsForNewMatches ? 'Enabled' : 'Disabled'}
               <p className="text-xs text-muted-foreground">Notifications for AI-suggested matches involving your cards.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 p-2 rounded-md bg-secondary/20">
            <Bell className="w-5 h-5 text-primary shrink-0" />
            <div>
              <span className="font-semibold">Match Status Update Emails:</span> {privacy.emailNotificationsForMatchUpdates ? 'Enabled' : 'Disabled'}
              <p className="text-xs text-muted-foreground">Notifications when other matchmakers act on shared potential matches.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
