
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { ProfileCard } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription as ShadDialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Save, UserPlus, X, Edit } from 'lucide-react';

interface CreateEditProfileCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileCard?: ProfileCard | null;
  onSave: (data: Omit<ProfileCard, 'id' | 'createdAt' | 'matcherName' | 'createdByMatcherId'>, existingCardId?: string) => void;
}

const SEEKING_OPTIONS = ["Long-term relationship", "Companionship", "Friendship", "Casual dating", "Marriage", "Prefer not to say"];
const GENDER_OPTIONS = ["Men", "Women", "Other"];
const MIN_AGE = 18;
const MAX_AGE = 99;
const MIN_PROXIMITY = 0;
const MAX_PROXIMITY = 250; // km
const PROXIMITY_STEP = 5; // km

const profileCardSchema = z.object({
  friendName: z.string().min(2, "Friend's name must be at least 2 characters."),
  friendEmail: z.string().email("Invalid email address for friend.").optional().or(z.literal('')),
  bio: z.string().min(30, "Bio must be at least 30 characters.").max(1000, "Bio cannot exceed 1000 characters."),
  interests: z.string().min(1, "Please list at least one interest.").transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  photoUrl: z.string().url("Invalid URL format for photo.").optional().or(z.literal('')),
  preferences: z.object({
    ageRange: z.string()
      .refine(val => !val || /^\d{1,2}-\d{1,2}$/.test(val), { message: "Age range must be in 'min-max' format (e.g., '25-35') or empty."})
      .optional().or(z.literal('')),
    seeking: z.array(z.string()).optional().default([]),
    gender: z.enum([...GENDER_OPTIONS, ""] as const).optional(),
    location: z.string()
      .refine(val => !val || /^\d+ km$/.test(val), { message: "Proximity must be in 'X km' format (e.g., '50 km') or empty."})
      .optional().or(z.literal('')),
  }).optional().default({ ageRange: "", seeking: [], gender: "", location: ""}),
});

type ProfileCardFormData = z.infer<typeof profileCardSchema>;

export function CreateEditProfileCardModal({ isOpen, onClose, profileCard, onSave }: CreateEditProfileCardModalProps) {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Local state for slider values
  const [currentAgeRange, setCurrentAgeRange] = useState<[number, number]>([MIN_AGE, MIN_AGE + 10]);
  const [currentProximity, setCurrentProximity] = useState<number>(50);

  const form = useForm<ProfileCardFormData>({
    resolver: zodResolver(profileCardSchema),
    defaultValues: {
      friendName: '',
      friendEmail: '',
      bio: '',
      interests: [], // Handled as string in form, transformed by Zod
      photoUrl: '',
      preferences: {
        ageRange: '',
        seeking: [],
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
            seeking: profileCard.preferences?.seeking || [],
            gender: profileCard.preferences?.gender || '',
            location: profileCard.preferences?.location || '',
          },
        });
        // Initialize sliders from profileCard
        if (profileCard.preferences?.ageRange) {
          const [min, max] = profileCard.preferences.ageRange.split('-').map(Number);
          if (!isNaN(min) && !isNaN(max)) setCurrentAgeRange([min, max]);
          else setCurrentAgeRange([MIN_AGE, MIN_AGE + 10]);
        } else {
          setCurrentAgeRange([MIN_AGE, MIN_AGE + 10]);
        }
        if (profileCard.preferences?.location) {
          const prox = parseInt(profileCard.preferences.location);
          if (!isNaN(prox)) setCurrentProximity(prox);
          else setCurrentProximity(50);
        } else {
          setCurrentProximity(50);
        }
      } else {
        form.reset({
          friendName: '', friendEmail: '', bio: '', interests: '', photoUrl: '',
          preferences: { ageRange: '', seeking: [], gender: '', location: '' },
        });
        setCurrentAgeRange([MIN_AGE, MIN_AGE + 10]);
        setCurrentProximity(50);
        // Set default slider string values in form on create
        form.setValue('preferences.ageRange', `${MIN_AGE}-${MIN_AGE + 10}`);
        form.setValue('preferences.location', `${50} km`);
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
      interests: data.interests, // Zod transformed this
      photoUrl: data.photoUrl,
      preferences: {
        ageRange: data.preferences?.ageRange,
        seeking: data.preferences?.seeking,
        gender: data.preferences?.gender,
        location: data.preferences?.location,
      },
    };

    try {
      await onSave(dataToSave, profileCard?.id);
      toast({ title: `Profile Card ${profileCard ? 'Updated' : 'Created'}!`, description: `${data.friendName}'s profile is ready.` });
    } catch (error) {
      console.error("Error in onSave callback:", error);
      toast({ variant: 'destructive', title: 'Save Failed', description: 'Could not save the profile card.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    if (!isSubmitting) {
      form.reset();
      onClose();
    }
  };
  
  const memoizedSeekingOptions = useMemo(() => SEEKING_OPTIONS, []);
  const memoizedGenderOptions = useMemo(() => GENDER_OPTIONS, []);


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
              name="interests"
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
              render={({ field }) => ( // field is not directly used by slider, currentAgeRange is
                <FormItem>
                  <FormLabel className="font-body">Preferred Age Range: {currentAgeRange[0]} - {currentAgeRange[1]}</FormLabel>
                  <Slider
                    value={currentAgeRange}
                    onValueChange={(newVal) => {
                      setCurrentAgeRange(newVal);
                      field.onChange(`${newVal[0]}-${newVal[1]}`); // Update RHF field
                    }}
                    min={MIN_AGE}
                    max={MAX_AGE}
                    step={1}
                    className="py-2"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferences.seeking"
              render={() => (
                <FormItem>
                  <FormLabel className="font-body">What They're Seeking</FormLabel>
                  <div className="space-y-2">
                    {memoizedSeekingOptions.map((option) => (
                      <FormField
                        key={option}
                        control={form.control}
                        name="preferences.seeking"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(option)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...(field.value || []), option])
                                    : field.onChange(
                                        (field.value || []).filter(
                                          (value) => value !== option
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-body font-normal text-sm">
                              {option}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
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
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      {memoizedGenderOptions.map((option) => (
                        <FormItem key={option} className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value={option} />
                          </FormControl>
                          <FormLabel className="font-body font-normal text-sm">{option}</FormLabel>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferences.location"
              render={({ field }) => ( // field not directly used, currentProximity is
                <FormItem>
                  <FormLabel className="font-body">Preferred Proximity: {currentProximity} km</FormLabel>
                   <Slider
                    value={[currentProximity]} // Slider expects an array
                    onValueChange={(newVal) => {
                        setCurrentProximity(newVal[0]);
                        field.onChange(`${newVal[0]} km`); // Update RHF field
                    }}
                    min={MIN_PROXIMITY}
                    max={MAX_PROXIMITY}
                    step={PROXIMITY_STEP}
                    className="py-2"
                  />
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
