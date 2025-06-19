
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { ProfileCard } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Save, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as ShadCardDescription } from '@/components/ui/card';


const SEEKING_OPTIONS = ["Long-term relationship", "Companionship", "Friendship", "Casual dating", "Marriage", "Prefer not to say"];
const GENDER_OPTIONS = ["Men", "Women", "Other"]; // "Non-binary" or more specific options could be added
const MIN_AGE = 18;
const MAX_AGE = 99;
const MIN_PROXIMITY = 0;
const MAX_PROXIMITY = 250; // km
const PROXIMITY_STEP = 5; // km

// This schema should be consistent with what `CreateEditProfileCardModal` used.
export const profileCardFormSchema = z.object({
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

export type ProfileCardFormData = z.infer<typeof profileCardFormSchema>;

interface ProfileCardFormProps {
  initialData?: ProfileCard | null; // Used for pre-filling the form in edit mode
  onSubmit: (data: ProfileCardFormData) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
  isSubmitting?: boolean;
}

export function ProfileCardForm({ initialData, onSubmit, onCancel, mode, isSubmitting }: ProfileCardFormProps) {
  const [currentAgeRange, setCurrentAgeRange] = useState<[number, number]>([MIN_AGE, MIN_AGE + 10]);
  const [currentProximity, setCurrentProximity] = useState<number>(50);

  const form = useForm<ProfileCardFormData>({
    resolver: zodResolver(profileCardFormSchema),
    defaultValues: {
      friendName: '',
      friendEmail: '',
      bio: '',
      interests: [], // Will be a string in the form input
      photoUrl: '',
      preferences: {
        ageRange: `${MIN_AGE}-${MIN_AGE + 10}`,
        seeking: [],
        gender: '',
        location: `${50} km`,
      },
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        friendName: initialData.friendName,
        friendEmail: initialData.friendEmail || '',
        bio: initialData.bio,
        interests: initialData.interests.join(', '), // Convert array to comma-separated string for input
        photoUrl: initialData.photoUrl || '',
        preferences: {
          ageRange: initialData.preferences?.ageRange || `${MIN_AGE}-${MIN_AGE+10}`,
          seeking: initialData.preferences?.seeking || [],
          gender: initialData.preferences?.gender || '',
          location: initialData.preferences?.location || `${50} km`,
        },
      });
      if (initialData.preferences?.ageRange) {
        const [min, max] = initialData.preferences.ageRange.split('-').map(Number);
        if (!isNaN(min) && !isNaN(max) && min >= MIN_AGE && max <= MAX_AGE && min <=max) {
           setCurrentAgeRange([min, max]);
        }
      }
      if (initialData.preferences?.location) {
        const prox = parseInt(initialData.preferences.location);
        if(!isNaN(prox) && prox >= MIN_PROXIMITY && prox <= MAX_PROXIMITY) {
            setCurrentProximity(prox);
        }
      }
    } else {
      // Reset to default for create mode if initialData becomes null/undefined
      form.reset({
        friendName: '', friendEmail: '', bio: '', interests: '', photoUrl: '',
        preferences: { ageRange: `${MIN_AGE}-${MIN_AGE + 10}`, seeking: [], gender: '', location: `${50} km` },
      });
      setCurrentAgeRange([MIN_AGE, MIN_AGE + 10]);
      setCurrentProximity(50);
    }
  }, [initialData, form]);

  const memoizedSeekingOptions = useMemo(() => SEEKING_OPTIONS, []);
  const memoizedGenderOptions = useMemo(() => GENDER_OPTIONS, []);

  return (
    <Card className="shadow-xl">
        <CardHeader>
            <CardTitle className="font-headline text-3xl text-primary">
                {mode === 'edit' ? `Edit ${initialData?.friendName || 'Friend'}'s Profile Card` : 'Create New Profile Card'}
            </CardTitle>
            <ShadCardDescription className="font-body">
                Fill in the details for your single friend. This information will be used to find potential matches.
            </ShadCardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                    <FormControl><Input type="url" placeholder="https://placehold.co/600x400.png" {...field} className="font-body bg-card" /></FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <h3 className="font-headline text-xl text-primary pt-4 border-t mt-6">Matching Preferences (Optional)</h3>
                
                <FormField
                control={form.control}
                name="preferences.ageRange"
                render={({ field }) => ( 
                    <FormItem>
                    <FormLabel className="font-body">Preferred Age Range: {currentAgeRange[0]} - {currentAgeRange[1]}</FormLabel>
                    <Slider
                        value={currentAgeRange}
                        onValueChange={(newVal) => {
                        setCurrentAgeRange(newVal);
                        field.onChange(`${newVal[0]}-${newVal[1]}`); 
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
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
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
                                    const currentValue = Array.isArray(field.value) ? field.value : [];
                                    return checked
                                        ? field.onChange([...currentValue, option])
                                        : field.onChange(
                                            currentValue.filter(
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
                render={({ field }) => ( 
                    <FormItem>
                    <FormLabel className="font-body">Preferred Proximity: {currentProximity} km</FormLabel>
                    <Slider
                        value={[currentProximity]} 
                        onValueChange={(newVal) => {
                            setCurrentProximity(newVal[0]);
                            field.onChange(`${newVal[0]} km`); 
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

                <div className="flex justify-between pt-8">
                <Button type="button" variant="outline" onClick={onCancel} className="border-muted text-muted-foreground hover:bg-muted/20" disabled={isSubmitting}>
                    <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting || !form.formState.isDirty || !form.formState.isValid} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    {isSubmitting ? <Save className="mr-2 h-4 w-4 animate-pulse" /> : <Save className="mr-2 h-4 w-4" />}
                    {mode === 'edit' ? 'Save Changes' : 'Create Profile Card'}
                </Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
