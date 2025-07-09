
"use client";

import { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { ProfileCard } from '@/types';
import { FRIEND_GENDER_OPTIONS, PREFERRED_GENDER_OPTIONS, EDUCATION_LEVEL_OPTIONS } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, X, ImagePlus, Trash2, Loader2, Briefcase, GraduationCap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription as ShadCardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { storage } from '@/lib/firebase';
import { ref as storageRef, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

const SEEKING_OPTIONS = ["Long-term relationship", "Companionship", "Friendship", "Casual dating", "Marriage", "Prefer not to say"];
const MIN_AGE = 18;
const MAX_AGE = 99;
const MIN_PROXIMITY = 0;
const MAX_PROXIMITY = 250; // km
const PROXIMITY_STEP = 5; // km
const MAX_FILE_SIZE_MB = 2;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

const canadianPostalCodeRegex = /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/;

export const profileCardFormSchema = z.object({
  friendName: z.string().min(2, "Friend's name must be at least 2 characters."),
  friendEmail: z.string().email("Invalid email address for friend.").optional().or(z.literal('')),
  friendAge: z.coerce.number().min(MIN_AGE, `Age must be ${MIN_AGE} or older.`).max(MAX_AGE, `Age must be ${MAX_AGE} or younger.`),
  friendGender: z.enum(FRIEND_GENDER_OPTIONS, { required_error: "Please select your friend's gender."}),
  friendPostalCode: z.string()
    .regex(canadianPostalCodeRegex, "Invalid Canadian Postal Code format (e.g., A1A 1A1 or M5V2T6).")
    .transform(val => val.toUpperCase().replace(/[ -]/g, ''))
    .optional().or(z.literal('')),
  educationLevel: z.enum(EDUCATION_LEVEL_OPTIONS).optional().or(z.literal(undefined)),
  occupation: z.string().max(100, "Occupation cannot exceed 100 characters.").optional().or(z.literal('')),
  bio: z.string().min(30, "Bio must be at least 30 characters.").max(1000, "Bio cannot exceed 1000 characters."),
  interests: z.string().min(1, "Please list at least one interest.").transform(val => val ? val.split(',').map(s => s.trim()).filter(Boolean) : []),
  photoUrl: z.string().optional().or(z.literal('')),
  preferences: z.object({
    ageRange: z.string()
      .refine(val => !val || /^\d{1,2}-\d{1,2}$/.test(val), { message: "Age range must be in 'min-max' format (e.g., '25-35') or empty."})
      .optional().or(z.literal('')),
    seeking: z.array(z.string()).optional().default([]),
    gender: z.enum([...PREFERRED_GENDER_OPTIONS, ""] as const, {errorMap: () => ({ message: "Please select a preferred gender or leave blank." }) }).optional(),
    location: z.string()
      .refine(val => !val || /^\d+ km$/.test(val), { message: "Proximity must be in 'X km' format (e.g., '50 km') or empty."})
      .optional().or(z.literal('')),
  }).optional().default({ ageRange: "", seeking: [], gender: "", location: ""}),
});

export type ProfileCardFormData = z.infer<typeof profileCardFormSchema>;

interface ProfileCardFormProps {
  initialData?: ProfileCard | null;
  onSubmit: (data: ProfileCardFormData) => Promise<void>;
  onCancel: () => void;
  mode: 'create' | 'edit';
  isSubmitting?: boolean;
}

export function ProfileCardForm({ initialData, onSubmit, onCancel, mode, isSubmitting: parentIsSubmitting }: ProfileCardFormProps) {
  const [currentAgeRange, setCurrentAgeRange] = useState<[number, number]>([MIN_AGE, MIN_AGE + 10]);
  const [currentFriendAge, setCurrentFriendAge] = useState<number>(MIN_AGE);
  const [currentProximity, setCurrentProximity] = useState<number>(50);
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const form = useForm<ProfileCardFormData>({
    resolver: zodResolver(profileCardFormSchema),
    defaultValues: { 
      friendName: '',
      friendEmail: '',
      friendAge: MIN_AGE,
      friendGender: undefined, 
      friendPostalCode: '',
      educationLevel: undefined,
      occupation: '',
      bio: '',
      interests: '', 
      photoUrl: '',
      preferences: {
        ageRange: `${MIN_AGE}-${MIN_AGE + 10}`,
        seeking: [],
        gender: '',
        location: `${50} km`,
      },
    },
  });

  const { reset, setValue, watch, setError: setFormError, clearErrors: clearFormErrors } = form;

  useEffect(() => {
    let newDefaultValues: ProfileCardFormData;

    if (initialData && mode === 'edit') {
      
      newDefaultValues = {
        friendName: initialData.friendName || '',
        friendEmail: initialData.friendEmail || '',
        friendAge: initialData.friendAge || MIN_AGE,
        friendGender: initialData.friendGender || undefined,
        friendPostalCode: initialData.friendPostalCode || '',
        educationLevel: initialData.educationLevel,
        occupation: initialData.occupation || '',
        bio: initialData.bio || '',
        interests: Array.isArray(initialData.interests) ? initialData.interests.join(', ') : (initialData.interests || ''),
        photoUrl: initialData.photoUrl || '',
        preferences: {
          ageRange: initialData.preferences?.ageRange || `${MIN_AGE}-${MIN_AGE + 10}`,
          seeking: Array.isArray(initialData.preferences?.seeking) ? initialData.preferences.seeking : [],
          gender: initialData.preferences?.gender || '', 
          location: initialData.preferences?.location || `${50} km`,
        },
      };
      
      setCurrentFriendAge(newDefaultValues.friendAge);
      setImagePreview(initialData.photoUrl || null);
      setSelectedImageFile(null);
      setFileName(null);

      const ageRangePref = newDefaultValues.preferences.ageRange;
      let parsedMinAgeSlider = MIN_AGE;
      let parsedMaxAgeSlider = MIN_AGE + 10;
      if (typeof ageRangePref === 'string' && /^\d{1,2}-\d{1,2}$/.test(ageRangePref)) {
        const [minStr, maxStr] = ageRangePref.split('-');
        const min = parseInt(minStr, 10);
        const max = parseInt(maxStr, 10);
        if (!isNaN(min) && !isNaN(max) && min >= MIN_AGE && max <= MAX_AGE && min <= max) {
           parsedMinAgeSlider = min;
           parsedMaxAgeSlider = max;
        }
      }
      setCurrentAgeRange([parsedMinAgeSlider, parsedMaxAgeSlider]);

      const locationPref = newDefaultValues.preferences.location;
      let parsedProximitySlider = 50;
      if (typeof locationPref === 'string' && /^\d+ km$/.test(locationPref)) {
        const prox = parseInt(locationPref.replace(' km', ''), 10);
        if(!isNaN(prox) && prox >= MIN_PROXIMITY && prox <= MAX_PROXIMITY) {
            parsedProximitySlider = prox;
        }
      }
      setCurrentProximity(parsedProximitySlider);

    } else { 
      newDefaultValues = {
        friendName: '',
        friendEmail: '',
        friendAge: MIN_AGE,
        friendGender: undefined,
        friendPostalCode: '',
        educationLevel: undefined,
        occupation: '',
        bio: '',
        interests: '',
        photoUrl: '',
        preferences: {
          ageRange: `${MIN_AGE}-${MIN_AGE + 10}`,
          seeking: [],
          gender: '',
          location: `${50} km`,
        },
      };
      setCurrentFriendAge(MIN_AGE);
      setCurrentAgeRange([MIN_AGE, MIN_AGE + 10]);
      setCurrentProximity(50);
      setImagePreview(null);
      setSelectedImageFile(null);
      setFileName(null);
    }
    reset(newDefaultValues);
  }, [initialData, mode, reset]);

  const memoizedSeekingOptions = useMemo(() => SEEKING_OPTIONS, []);
  const memoizedFriendGenderOptions = useMemo(() => FRIEND_GENDER_OPTIONS, []);
  const memoizedPreferredGenderOptions = useMemo(() => PREFERRED_GENDER_OPTIONS, []);
  const memoizedEducationLevelOptions = useMemo(() => EDUCATION_LEVEL_OPTIONS, []);


  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setFormError("photoUrl", { type: "manual", message: `File size cannot exceed ${MAX_FILE_SIZE_MB}MB.` });
        return;
      }
      if (!file.type.startsWith('image/')) {
        setFormError("photoUrl", { type: "manual", message: "Invalid file type. Please select an image." });
        return;
      }

      clearFormErrors("photoUrl");
      setSelectedImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFileName(file.name);
      setValue('photoUrl', `placeholder_for_new_file_${file.name}_${file.lastModified}`, { shouldDirty: true });
    }
  };

  const handleRemoveImage = () => {
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setSelectedImageFile(null);
    setFileName(null);
    setValue('photoUrl', '', { shouldDirty: true, shouldValidate: true });
    const fileInput = document.getElementById('photoUrlInput') as HTMLInputElement | null;
    if (fileInput) {
        fileInput.value = ''; 
    }
  };

  const internalHandleSubmit = async (formData: ProfileCardFormData) => {
    if (!currentUser || !storage) {
        toast({ variant: "destructive", title: "Error", description: "User not authenticated or storage service unavailable." });
        return;
    }
    setIsUploadingImage(true);

    let finalPhotoUrl = initialData?.photoUrl || '';

    if (selectedImageFile) {
        try {
            if (mode === 'edit' && initialData?.photoUrl && initialData.photoUrl.includes('firebasestorage.googleapis.com')) {
                try {
                    const oldImageRef = storageRef(storage, initialData.photoUrl);
                    await deleteObject(oldImageRef);
                } catch (deleteError: any) {
                    console.warn("Could not delete old image from Firebase Storage:", deleteError);
                }
            }
            
            const filePath = `profileCardImages/${currentUser.id}/${Date.now()}_${selectedImageFile.name}`;
            const imageStorageRef = storageRef(storage, filePath);
            const uploadTask = await uploadBytesResumable(imageStorageRef, selectedImageFile);
            finalPhotoUrl = await getDownloadURL(uploadTask.ref);
        } catch (uploadError: any) {
            console.error('Error uploading image to Firebase Storage:', uploadError);
            toast({ variant: 'destructive', title: 'Image Upload Failed', description: uploadError.message || 'Could not upload the image.' });
            setIsUploadingImage(false);
            return;
        }
    } else if (formData.photoUrl === '' && initialData?.photoUrl && initialData.photoUrl.includes('firebasestorage.googleapis.com')) {
        finalPhotoUrl = '';
        if (mode === 'edit') { 
            try {
                const oldImageRef = storageRef(storage, initialData.photoUrl);
                await deleteObject(oldImageRef);
            } catch (deleteError: any) {
                console.warn("Could not delete old image from Firebase Storage during removal:", deleteError);
            }
        }
    }
    
    const dataToSubmit: ProfileCardFormData = {
        ...formData,
        photoUrl: finalPhotoUrl,
    };
    
    await onSubmit(dataToSubmit);
    setIsUploadingImage(false);
  };

  const combinedIsSubmitting = parentIsSubmitting || isUploadingImage;


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
            <form onSubmit={form.handleSubmit(internalHandleSubmit)} className="space-y-6">
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
                  name="friendAge"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-body">Friend's Age: {currentFriendAge}</FormLabel>
                      <FormControl>
                        <Slider
                            value={[currentFriendAge]}
                            onValueChange={(newVal) => {
                            setCurrentFriendAge(newVal[0]);
                            field.onChange(newVal[0]);
                            }}
                            min={MIN_AGE}
                            max={MAX_AGE}
                            step={1}
                            className="py-2"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                    control={form.control}
                    name="friendGender"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="font-body">Friend's Gender</FormLabel>
                        <FormControl>
                            <RadioGroup
                            onValueChange={(value) => field.onChange(value === '' ? undefined : value)}
                            value={field.value || ''} 
                            className="flex flex-row space-x-4 items-center pt-1"
                            >
                            {memoizedFriendGenderOptions.map((option) => (
                                <FormItem key={option} className="flex items-center space-x-2 space-y-0">
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
                  name="friendPostalCode"
                  render={({ field }) => (
                      <FormItem>
                      <FormLabel className="font-body">Friend's Canadian Postal Code (Optional)</FormLabel>
                      <FormControl><Input placeholder="e.g., M5V 2T6 or A1A1A1" {...field} className="font-body bg-card" /></FormControl>
                      <FormDescription className="font-body text-xs">This helps match with others in their vicinity. Used as the reference for their proximity preference.</FormDescription>
                      <FormMessage />
                      </FormItem>
                  )}
                />

                <FormField
                    control={form.control}
                    name="educationLevel"
                    render={({ field }) => {
                        const normalizedSelectValue = useMemo(() => {
                            if (!field.value) return undefined;
                            const matchingLevel = EDUCATION_LEVEL_OPTIONS.find(
                                (level) => level.toLowerCase() === field.value.toLowerCase()
                            );
                            return matchingLevel;
                        }, [field.value]);

                        return (
                            <FormItem>
                                <FormLabel className="font-body flex items-center gap-1"><GraduationCap className="w-4 h-4 text-primary" />Friend's Highest Education Level (Optional)</FormLabel>
                                <Select onValueChange={field.onChange} value={normalizedSelectValue ?? ''}>
                                    <FormControl>
                                        <SelectTrigger className="font-body bg-card">
                                            <SelectValue placeholder="-- Select Education Level --" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {memoizedEducationLevelOptions.map(option => (
                                            <SelectItem key={option} value={option}>{option}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />


                <FormField
                    control={form.control}
                    name="occupation"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="font-body flex items-center gap-1"><Briefcase className="w-4 h-4 text-primary"/>Friend's Occupation (Optional)</FormLabel>
                        <FormControl><Input placeholder="e.g., Software Engineer, Teacher, Artist" {...field} className="font-body bg-card" /></FormControl>
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

                <FormItem>
                    <FormLabel className="font-body">Friend's Photo (Optional)</FormLabel>
                    <FormControl>
                        <Input 
                            id="photoUrlInput"
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageChange} 
                            className="font-body bg-card"
                            disabled={combinedIsSubmitting}
                        />
                    </FormControl>
                    <FormDescription className="font-body text-xs">
                        Max {MAX_FILE_SIZE_MB}MB. JPG, PNG, GIF, WEBP accepted.
                        {fileName && <span className="block mt-1">Selected: {fileName}</span>}
                    </FormDescription>
                    {imagePreview && (
                        <div className="mt-2 relative w-40 h-40 border rounded-md overflow-hidden">
                            <Image src={imagePreview} alt="Selected preview" layout="fill" objectFit="cover" data-ai-hint="person profile image"/>
                            {!combinedIsSubmitting && (
                              <Button 
                                  type="button" 
                                  variant="destructive" 
                                  size="icon" 
                                  onClick={handleRemoveImage}
                                  className="absolute top-1 right-1 h-6 w-6"
                                  title="Remove image"
                              >
                                  <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                        </div>
                    )}
                     <FormMessage>{form.formState.errors.photoUrl?.message}</FormMessage>
                </FormItem>


                <h3 className="font-headline text-xl text-primary pt-4 border-t mt-6">Matching Preferences (Optional)</h3>

                <FormField
                control={form.control}
                name="preferences.ageRange"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel className="font-body">Preferred Age Range for Matches: {currentAgeRange[0]} - {currentAgeRange[1]}</FormLabel>
                     <FormControl>
                        <Slider
                            value={currentAgeRange}
                            onValueChange={(newVal) => {
                            setCurrentAgeRange(newVal as [number, number]);
                            field.onChange(`${newVal[0]}-${newVal[1]}`);
                            }}
                            min={MIN_AGE}
                            max={MAX_AGE}
                            step={1}
                            className="py-2"
                            disabled={combinedIsSubmitting}
                        />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="preferences.seeking"
                render={() => (
                    <FormItem>
                    <FormLabel className="font-body">What They're Seeking in a Match</FormLabel>
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
                                    checked={Array.isArray(field.value) && field.value?.includes(option)}
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
                                    disabled={combinedIsSubmitting}
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
                    <FormLabel className="font-body">Interested In (Gender for Matches)</FormLabel>
                    <FormControl>
                        <RadioGroup
                        onValueChange={(value) => field.onChange(value === '' ? undefined : value)}
                        value={field.value || ''} 
                        className="flex flex-row space-x-4 items-center pt-1"
                        >
                        {memoizedPreferredGenderOptions.map((option) => (
                            <FormItem key={option} className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                                <RadioGroupItem value={option} disabled={combinedIsSubmitting}/>
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
                    <FormLabel className="font-body">Preferred Proximity from their Postal Code: {currentProximity} km</FormLabel>
                     <FormControl>
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
                            disabled={combinedIsSubmitting}
                        />
                    </FormControl>
                     <FormDescription className="font-body text-xs">How far from their postal code they're willing to match.</FormDescription>
                    <FormMessage />
                    </FormItem>
                )}
                />

                <div className="flex justify-between pt-8">
                <Button type="button" variant="outline" onClick={onCancel} className="border-muted text-muted-foreground hover:bg-muted/20" disabled={combinedIsSubmitting}>
                    <X className="mr-2 h-4 w-4" /> Cancel
                </Button>
                <Button type="submit" disabled={combinedIsSubmitting || !form.formState.isDirty || !form.formState.isValid} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    {combinedIsSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    {mode === 'edit' ? 'Save Changes' : 'Create Profile Card'}
                </Button>
                </div>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}
