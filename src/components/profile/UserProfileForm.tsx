
"use client";

import React from 'react'; 
import type { UserProfile } from '@/types';
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
import { useAuth } from '@/contexts/AuthContext'; 
import { generateUniqueAvatarSvgDataUri } from '@/lib/utils';


const matcherProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters.").max(50, "Name cannot exceed 50 characters."),
  bio: z.string().max(500, "Bio cannot exceed 500 characters.").optional(),
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
    },
  });
  
  React.useEffect(() => {
    if (profile) {
      form.reset({
        name: profile.name,
        bio: profile.bio || '',
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
      photoUrl: profile.photoUrl || generateUniqueAvatarSvgDataUri(firebaseUser.uid), // Preserve existing or generate if missing
      // interests and preferences are not part of this form.
    };
    
    onSubmit(updatedProfileData); 
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
          Update your matchmaker details. Your email (<span className="font-semibold">{profile?.email || firebaseUser?.email}</span>) is linked to your account and cannot be changed here. Your avatar is automatically generated.
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
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body text-lg py-3 rounded-lg">
              <Save className="mr-2 h-5 w-5" /> Save Profile
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
