
"use client";

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { ProfileCard } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as ShadDialogDescription, DialogFooter } from '@/components/ui/dialog'; // DialogClose removed
import { Button } from '@/components/ui/button';
// Label removed as FormLabel is used
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Save, UserPlus, X, Edit } from 'lucide-react';

interface CreateEditProfileCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileCard?: ProfileCard | null; // Existing card for editing, null/undefined for creating
  onSave: (data: Omit<ProfileCard, 'id' | 'createdAt' | 'matcherName' | 'createdByMatcherId'>) => void; // Modified to pass only form data
}

const profileCardSchema = z.object({
  friendName: z.string().min(2, "Friend's name must be at least 2 characters."),
  friendEmail: z.string().email("Invalid email address for friend.").optional().or(z.literal('')),
  bio: z.string().min(30, "Bio must be at least 30 characters.").max(1000, "Bio cannot exceed 1000 characters."),
  interests: z.string().min(1, "Please list at least one interest.").transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  photoUrl: z.string().url("Invalid URL format for photo.").optional().or(z.literal('')),
  preferences: z.object({
      ageRange: z.string().optional(),
      seeking: z.string().optional(),
      gender: z.string().optional(), 
      location: z.string().optional(),
  }).optional(),
});

type ProfileCardFormData = z.infer<typeof profileCardSchema>;

export function CreateEditProfileCardModal({ isOpen, onClose, profileCard, onSave }: CreateEditProfileCardModalProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileCardFormData>({
    resolver: zodResolver(profileCardSchema),
    defaultValues: {
      friendName: '',
      friendEmail: '',
      bio: '',
      interests: [], // This will be a string in the form, transformed by Zod
      photoUrl: '',
      preferences: {
        ageRange: '',
        seeking: '',
        gender: '',
        location: '',
      },
    },
  });

  useEffect(() => {
    if (isOpen) {
        if (profileCard) {
            form.reset({
                friendName: profileCard.friendName,
                friendEmail: profileCard.friendEmail || '',
                bio: profileCard.bio,
                interests: profileCard.interests.join(', '),
                photoUrl: profileCard.photoUrl || '',
                preferences: {
                    ageRange: profileCard.preferences?.ageRange || '',
                    seeking: profileCard.preferences?.seeking || '',
                    gender: profileCard.preferences?.gender || '',
                    location: profileCard.preferences?.location || '',
                },
            });
        } else {
            form.reset({ 
                friendName: '',
                friendEmail: '',
                bio: '',
                interests: '', // Reset as string for form input
                photoUrl: '',
                preferences: {
                    ageRange: '',
                    seeking: '',
                    gender: '',
                    location: '',
                },
            });
        }
    }
  }, [profileCard, isOpen, form]);

  const handleSubmit = async (data: ProfileCardFormData) => {
    if (!currentUser) {
      toast({ variant: 'destructive', title: 'Error', description: 'You must be logged in to save a profile card.' });
      return;
    }
    setIsSubmitting(true);

    const dataToSave = {
        friendName: data.friendName,
        friendEmail: data.friendEmail,
        bio: data.bio,
        interests: data.interests, // Zod already transformed this to string[]
        photoUrl: data.photoUrl,
        preferences: data.preferences || {}, // Ensure preferences object exists
    };

    try {
        await onSave(dataToSave);
        toast({ title: `Profile Card ${profileCard ? 'Updated' : 'Created'}!`, description: `${data.friendName}'s profile is ready.` });
    } catch (error) {
        console.error("Error in onSave callback:", error);
        toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the profile card.'});
    } finally {
        setIsSubmitting(false);
        // Parent component's onSave handler is now responsible for closing the modal
    }
  };
  
  const handleDialogClose = () => {
    if (!isSubmitting) { // Prevent reset if a submission is in progress
        form.reset(); 
        onClose();
    }
  };

  if (!currentUser) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(openStatus) => { if (!openStatus) handleDialogClose(); }}>
      <DialogContent className="sm:max-w-lg bg-card overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl text-primary flex items-center gap-2">
            {profileCard ? <Edit className="w-7 h-7" /> : <UserPlus className="w-7 h-7" />}
            {profileCard ? `Edit ${profileCard.friendName}'s Profile Card` : 'Create New Profile Card'}
          </DialogTitle>
          <ShadDialogDescription className="font-body">
            Fill in the details for your single friend. This information will be used to find potential matches.
          </ShadDialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 py-4 pr-2">
            <FormField
              control={form.control}
              name="friendName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Friend's Full Name</FormLabel>
                  <FormControl><Input placeholder="e.g., Alex Johnson" {...field} className="font-body bg-card" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="friendEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Friend's Email (Optional)</FormLabel>
                  <FormControl><Input type="email" placeholder="e.g., friend@example.com" {...field} className="font-body bg-card" /></FormControl>
                  <FormDescription className="font-body text-xs">Used for notifications if a mutual match is accepted by everyone.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Bio / About Your Friend</FormLabel>
                  <FormControl><Textarea placeholder="Describe their personality, what they're like, key qualities..." {...field} className="min-h-[100px] font-body bg-card" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="interests" // Field expects string input, Zod transforms to array
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Interests</FormLabel>
                  <FormControl><Input placeholder="e.g., hiking, reading, cooking (comma-separated)" {...field} className="font-body bg-card" /></FormControl>
                  <FormDescription className="font-body text-xs">Separate interests with a comma.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="photoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Friend's Photo URL (Optional)</FormLabel>
                  <FormControl><Input type="url" placeholder="https://example.com/photo.jpg" {...field} className="font-body bg-card" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h3 className="font-headline text-lg text-primary pt-2">Matching Preferences (Optional)</h3>
            <FormField
              control={form.control}
              name="preferences.ageRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Preferred Age Range</FormLabel>
                  <FormControl><Input placeholder="e.g., 28-35" {...field} className="font-body bg-card" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="preferences.seeking"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">What They're Seeking</FormLabel>
                  <FormControl><Input placeholder="e.g., Long-term relationship, companionship" {...field} className="font-body bg-card" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="preferences.gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Interested In (Gender)</FormLabel>
                  <FormControl><Input placeholder="e.g., Men, Women, Any" {...field} className="font-body bg-card" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="preferences.location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-body">Preferred Location/Proximity</FormLabel>
                  <FormControl><Input placeholder="e.g., New York City, Within 50 miles" {...field} className="font-body bg-card" /></FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="sm:justify-between pt-4">
              <Button type="button" variant="outline" onClick={handleDialogClose} className="border-muted text-muted-foreground hover:bg-muted/20" disabled={isSubmitting}>
                <X className="mr-2 h-4 w-4" /> Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {isSubmitting ? <Save className="mr-2 h-4 w-4 animate-pulse" /> : <Save className="mr-2 h-4 w-4" />}
                {profileCard ? 'Save Changes' : 'Create Profile Card'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
