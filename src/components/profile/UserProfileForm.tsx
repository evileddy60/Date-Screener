
"use client";

import type { UserProfile, UserRole } from '@/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { USER_ROLES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Schema for Matcher's own profile
const matcherProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  // Role is fixed to recommender, not editable here for simplicity, set by system
  bio: z.string().optional().describe("Your bio as a matchmaker."),
  photoUrl: z.string().url("Must be a valid URL for your photo.").optional().or(z.literal('')),
});

type MatcherProfileFormData = z.infer<typeof matcherProfileSchema>;

interface UserProfileFormProps {
  profile?: UserProfile; // Matcher's profile
  onSubmit: (data: UserProfile) => void;
}

export function UserProfileForm({ profile, onSubmit }: UserProfileFormProps) {
  const { toast } = useToast();
  const form = useForm<MatcherProfileFormData>({
    resolver: zodResolver(matcherProfileSchema),
    defaultValues: {
      name: profile?.name || '',
      email: profile?.email || '',
      bio: profile?.bio || '', // Matcher's bio
      photoUrl: profile?.photoUrl || '',
    },
  });

  const handleSubmit = (data: MatcherProfileFormData) => {
    const updatedProfile: UserProfile = {
      ...(profile || { id: Date.now().toString(), role: USER_ROLES.RECOMMENDER }), // Keep existing ID or generate one
      ...data,
      role: USER_ROLES.RECOMMENDER, // Ensure role is always recommender
      // Clear out single-specific fields if they somehow existed
      interests: undefined, 
      preferences: undefined,
      recommenderNotes: undefined,
    };
    onSubmit(updatedProfile);
    toast({
      title: "Matchmaker Profile Saved!",
      description: "Your information has been updated.",
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
          <UserCircle className="w-7 h-7" /> {profile ? 'Edit Your Matchmaker Profile' : 'Create Your Matchmaker Profile'}
        </CardTitle>
        <CardDescription className="font-body">
          Tell us about yourself as a matchmaker. This information is for your account.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} className="font-body bg-card" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="you@example.com" {...field} className="font-body bg-card" readOnly={!!profile?.email} />
                  </FormControl>
                  {profile?.email && <FormDescription className="font-body text-xs">Email cannot be changed after account creation.</FormDescription>}
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
                    <Textarea placeholder="Tell us a bit about your matchmaking style or why you enjoy connecting people..." {...field} className="font-body min-h-[100px] bg-card" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Your Photo URL (Optional)</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/your-photo.jpg" {...field} className="font-body bg-card" />
                  </FormControl>
                  <FormDescription className="font-body text-xs">Link to your profile picture.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body text-lg py-3 rounded-lg">
              <Save className="mr-2 h-5 w-5" /> Save Profile
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
