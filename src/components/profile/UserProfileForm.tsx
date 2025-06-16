
"use client";

import React from 'react'; // Added React import
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
import { useAuth } from '@/contexts/AuthContext'; // To access current user ID

// Schema for Matcher's own profile
const matcherProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name cannot exceed 50 characters."),
  // Email is not editable through this form, it's tied to Firebase Auth
  bio: z.string().max(500, "Bio cannot exceed 500 characters.").optional(),
  photoUrl: z.string().url("Must be a valid URL for your photo.").optional().or(z.literal('')),
});

type MatcherProfileFormData = z.infer<typeof matcherProfileSchema>;

interface UserProfileFormProps {
  profile: UserProfile; // Matcher's profile (should always be provided now)
  onSubmit: (data: UserProfile) => void;
}

export function UserProfileForm({ profile, onSubmit }: UserProfileFormProps) {
  const { toast } = useToast();
  const { firebaseUser } = useAuth(); // Get firebaseUser for ID

  const form = useForm<MatcherProfileFormData>({
    resolver: zodResolver(matcherProfileSchema),
    defaultValues: {
      name: profile?.name || '',
      // email: profile?.email || '', // Not editable here
      bio: profile?.bio || '',
      photoUrl: profile?.photoUrl || '',
    },
  });
  
  // Reset form if profile prop changes (e.g., after initial load with default data)
  React.useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        bio: profile.bio || '',
        photoUrl: profile.photoUrl || '',
      });
    }
  }, [profile, form]);


  const handleSubmit = (data: MatcherProfileFormData) => {
    if (!firebaseUser) {
        toast({ variant: "destructive", title: "Error", description: "You are not logged in." });
        return;
    }
    const updatedProfile: UserProfile = {
      id: firebaseUser.uid, // Use Firebase UID as the profile ID
      email: firebaseUser.email || profile.email, // Email from Firebase or existing profile
      ...data,
      role: USER_ROLES.RECOMMENDER, // Ensure role is always recommender
    };
    onSubmit(updatedProfile); // This will update localStorage and AuthContext state via parent
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
          Update your matchmaker details. Your email (<span className="font-semibold">{profile?.email || firebaseUser?.email}</span>) is linked to your account and cannot be changed here.
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
