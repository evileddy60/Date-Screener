"use client";

import type { UserProfile, UserRole } from '@/types';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { USER_ROLES } from '@/lib/constants';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Save, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  email: z.string().email("Invalid email address."),
  role: z.enum([USER_ROLES.SINGLE, USER_ROLES.RECOMMENDER]),
  bio: z.string().optional(),
  interests: z.string().optional().transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  photoUrl: z.string().url().optional().or(z.literal('')),
  // Example preferences, extend as needed
  ageRangePreference: z.string().optional().describe("e.g., 25-35"),
  seekingPreference: z.string().optional().describe("e.g., Long-term, Casual, Friendship"),
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserProfileFormProps {
  profile?: UserProfile;
  onSubmit: (data: UserProfile) => void;
}

export function UserProfileForm({ profile, onSubmit }: UserProfileFormProps) {
  const { toast } = useToast();
  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || '',
      email: profile?.email || '',
      role: profile?.role || USER_ROLES.SINGLE,
      bio: profile?.bio || '',
      interests: profile?.interests?.join(', ') || '',
      photoUrl: profile?.photoUrl || '',
      ageRangePreference: profile?.preferences?.ageRange || '',
      seekingPreference: profile?.preferences?.seeking || '',
    },
  });

  const handleSubmit = (data: ProfileFormData) => {
    const updatedProfile: UserProfile = {
      ...(profile || { id: Date.now().toString() }), // Keep existing ID or generate one for new profile
      ...data,
      interests: data.interests,
      preferences: {
        ageRange: data.ageRangePreference,
        seeking: data.seekingPreference,
      }
    };
    onSubmit(updatedProfile);
    toast({
      title: "Profile Saved!",
      description: "Your profile information has been updated.",
    });
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl text-primary flex items-center gap-2">
          <UserCircle className="w-7 h-7" /> {profile ? 'Edit Profile' : 'Create Profile'}
        </CardTitle>
        <CardDescription className="font-body">
          {profile ? "Update your personal details below." : "Fill in your details to get started."}
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
                    <Input type="email" placeholder="you@example.com" {...field} className="font-body bg-card" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel className="font-body">Your Role</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1 font-body"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={USER_ROLES.SINGLE} />
                        </FormControl>
                        <FormLabel className="font-normal">Single (Looking for matches)</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value={USER_ROLES.RECOMMENDER} />
                        </FormControl>
                        <FormLabel className="font-normal">Recommender (Helping friends/family)</FormLabel>
                      </FormItem>
                    </RadioGroup>
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
                  <FormLabel className="font-body">Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us a bit about yourself..." {...field} className="font-body min-h-[100px] bg-card" />
                  </FormControl>
                  <FormDescription className="font-body">
                    Share your personality, what you're looking for, or your approach to recommending.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interests"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Interests</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., hiking, reading, cooking" {...field} className="font-body bg-card" />
                  </FormControl>
                  <FormDescription className="font-body">Separate interests with a comma.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Photo URL</FormLabel>
                  <FormControl>
                    <Input type="url" placeholder="https://example.com/your-photo.jpg" {...field} className="font-body bg-card" />
                  </FormControl>
                  <FormDescription className="font-body">Link to your profile picture.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.getValues("role") === USER_ROLES.SINGLE && (
              <>
                <FormField
                  control={form.control}
                  name="ageRangePreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Preferred Age Range</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 28-35" {...field} className="font-body bg-card" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seekingPreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Looking For</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Long-term relationship, friendship" {...field} className="font-body bg-card" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-body text-lg py-3 rounded-lg">
              <Save className="mr-2 h-5 w-5" /> Save Profile
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
