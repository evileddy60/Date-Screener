
"use client";

import React from 'react'; 
import type { UserProfile, PrivacySettingsData } from '@/types';
import { useForm, Controller } from 'react-hook-form'; // Added Controller
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { USER_ROLES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as ShadCardDescription } from '@/components/ui/card';
import { Save, UserCircle, ShieldCheck, Mail, Bell } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext'; 
import { generateUniqueAvatarSvgDataUri } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { defaultPrivacySettings } from '@/types';

const matcherProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name cannot exceed 50 characters."),
  bio: z.string().max(500, "Bio cannot exceed 500 characters.").optional(),
  // Privacy Settings Fields
  profileVisibility: z.string().default(defaultPrivacySettings.profileVisibility),
  emailNotificationsForNewMatches: z.boolean().default(defaultPrivacySettings.emailNotificationsForNewMatches),
  emailNotificationsForMatchUpdates: z.boolean().default(defaultPrivacySettings.emailNotificationsForMatchUpdates),
});

type MatcherProfileFormData = z.infer<typeof matcherProfileSchema>;

interface UserProfileFormProps {
  profile: UserProfile; 
  onSubmit: (data: UserProfile) => void;
}

export function UserProfileForm({ profile, onSubmit }: UserProfileFormProps) {
  const { toast } = useToast();
  const { firebaseUser } = useAuth(); 

  const form = useForm<MatcherProfileFormData>({
    resolver: zodResolver(matcherProfileSchema),
    defaultValues: {
      name: profile?.name || '',
      bio: profile?.bio || '',
      profileVisibility: profile?.privacySettings?.profileVisibility || defaultPrivacySettings.profileVisibility,
      emailNotificationsForNewMatches: profile?.privacySettings?.emailNotificationsForNewMatches ?? defaultPrivacySettings.emailNotificationsForNewMatches,
      emailNotificationsForMatchUpdates: profile?.privacySettings?.emailNotificationsForMatchUpdates ?? defaultPrivacySettings.emailNotificationsForMatchUpdates,
    },
  });
  
  React.useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        bio: profile.bio || '',
        profileVisibility: profile.privacySettings?.profileVisibility || defaultPrivacySettings.profileVisibility,
        emailNotificationsForNewMatches: profile.privacySettings?.emailNotificationsForNewMatches ?? defaultPrivacySettings.emailNotificationsForNewMatches,
        emailNotificationsForMatchUpdates: profile.privacySettings?.emailNotificationsForMatchUpdates ?? defaultPrivacySettings.emailNotificationsForMatchUpdates,
      });
    }
  }, [profile, form]);


  const handleSubmit = (data: MatcherProfileFormData) => {
    if (!firebaseUser) {
        toast({ variant: "destructive", title: "Error", description: "You are not logged in." });
        return;
    }

    const updatedProfileData: UserProfile = {
      id: firebaseUser.uid,
      email: firebaseUser.email || profile.email, 
      name: data.name,
      bio: data.bio || '', 
      role: USER_ROLES.RECOMMENDER, 
      photoUrl: profile.photoUrl || generateUniqueAvatarSvgDataUri(firebaseUser.uid),
      privacySettings: {
        profileVisibility: data.profileVisibility,
        emailNotificationsForNewMatches: data.emailNotificationsForNewMatches,
        emailNotificationsForMatchUpdates: data.emailNotificationsForMatchUpdates,
      },
    };
    
    onSubmit(updatedProfileData); 
    toast({
      title: "Matchmaker Profile Saved!",
      description: "Your information and privacy settings have been updated.",
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
          <UserCircle className="w-7 h-7" /> {profile ? 'Edit Your Matchmaker Profile' : 'Create Your Matchmaker Profile'}
        </CardTitle>
        <ShadCardDescription className="font-body">
          Update your matchmaker details and privacy preferences. Your email (<span className="font-semibold">{profile?.email || firebaseUser?.email}</span>) is linked to your account and cannot be changed here. Your avatar is automatically generated.
        </ShadCardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
            
            <section className="space-y-6 p-4 border rounded-lg bg-card">
              <h3 className="font-headline text-xl text-foreground flex items-center gap-2"><UserCircle className="w-6 h-6 text-primary"/>Basic Information</h3>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body">Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your full name" {...field} className="font-body bg-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-body">Your Matchmaker Bio (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Tell us a bit about your matchmaking style or why you enjoy connecting people..." {...field} className="font-body min-h-[100px] bg-input" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </section>

            <section className="space-y-6 p-4 border rounded-lg bg-card">
                <h3 className="font-headline text-xl text-foreground flex items-center gap-2"><ShieldCheck className="w-6 h-6 text-primary"/>Privacy Settings</h3>
                <FormField
                  control={form.control}
                  name="profileVisibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Your Profile Card Visibility</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="font-body bg-input">
                            <SelectValue placeholder="Select who can see your profile cards" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="w-[var(--radix-select-trigger-width)]"> 
                          <SelectItem value="recommenders_only">Only Other Matchmakers</SelectItem>
                          <SelectItem value="network_only">Matchmakers in My Network (Future Feature)</SelectItem>
                          <SelectItem value="private">Private (Invite Only - Future Feature)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="font-body text-xs">
                        Control who can see the profile cards you create for your friends.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="emailNotificationsForNewMatches"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-input/30">
                      <div className="space-y-0.5">
                        <FormLabel className="font-body text-sm flex items-center gap-1"><Mail className="w-4 h-4 text-primary"/> Email for New Match Suggestions</FormLabel>
                        <FormDescription className="font-body text-xs">
                          Receive an email when the AI suggests a new potential match involving one of your cards.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="emailNotificationsForMatchUpdates"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 bg-input/30">
                      <div className="space-y-0.5">
                        <FormLabel className="font-body text-sm flex items-center gap-1"><Bell className="w-4 h-4 text-primary"/> Email for Match Status Updates</FormLabel>
                        <FormDescription className="font-body text-xs">
                          Get notified when another matchmaker accepts/rejects a match you're involved in.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
            </section>

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body text-lg py-3 rounded-lg mt-8">
              <Save className="mr-2 h-5 w-5" /> Save Profile & Settings
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
