
"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { addProfileCard, getProfileCardById, updateProfileCard } from '@/lib/firestoreService';
import type { ProfileCard } from '@/types';
import { ProfileCardForm, type ProfileCardFormData } from '@/components/profile-cards/ProfileCardForm';
import { useToast } from '@/hooks/use-toast';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

function ManageProfileCardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const cardIdToEdit = searchParams.get('edit');
  const mode = cardIdToEdit ? 'edit' : 'create';

  const [initialCardData, setInitialCardData] = useState<ProfileCard | null>(null);
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCardToEdit() {
      if (mode === 'edit' && cardIdToEdit && currentUser) {
        setIsLoading(true);
        try {
          const card = await getProfileCardById(cardIdToEdit);
          if (card) {
            if (card.createdByMatcherId !== currentUser.id) {
              setError("You don't have permission to edit this card.");
              setInitialCardData(null);
            } else {
              setInitialCardData(card);
            }
          } else {
            setError("Profile card not found.");
            setInitialCardData(null);
          }
        } catch (err: any) {
          console.error("Error fetching card to edit:", err);
          setError(err.message || "Could not load profile card data.");
          setInitialCardData(null);
        } finally {
          setIsLoading(false);
        }
      } else if (mode === 'create') {
        setIsLoading(false);
        setInitialCardData(null); 
      }
    }
    if (currentUser) {
        fetchCardToEdit();
    } else if (!currentUser) { 
        router.push('/auth/login');
    }
  }, [cardIdToEdit, mode, currentUser, router]);

  const handleFormSubmit = async (formData: ProfileCardFormData) => {
    if (!currentUser || !currentUser.id || !currentUser.name) {
      toast({ variant: 'destructive', title: 'Error', description: 'User not authenticated or profile incomplete.' });
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const dataToSave: Omit<ProfileCard, 'id' | 'createdAt' | 'matcherName' | 'createdByMatcherId'> = {
        friendName: formData.friendName,
        friendEmail: formData.friendEmail,
        friendAge: formData.friendAge,
        friendGender: formData.friendGender,
        friendPostalCode: formData.friendPostalCode,
        educationLevel: formData.educationLevel,
        occupation: formData.occupation,
        bio: formData.bio,
        interests: formData.interests, 
        photoUrl: formData.photoUrl,
        preferences: {
            ageRange: formData.preferences?.ageRange,
            seeking: formData.preferences?.seeking, 
            gender: formData.preferences?.gender,
            location: formData.preferences?.location,
        },
    };

    try {
      if (mode === 'edit' && initialCardData) {
        const cardToUpdate: ProfileCard = {
          ...dataToSave,
          id: initialCardData.id,
          createdByMatcherId: currentUser.id,
          matcherName: currentUser.name,
          createdAt: initialCardData.createdAt,
        };
        await updateProfileCard(cardToUpdate);
        setIsSubmitting(false); 
        toast({ title: 'Profile Card Updated!', description: `${cardToUpdate.friendName}'s profile has been successfully updated.` });
        router.push('/profile-cards');
      } else { 
        await addProfileCard(dataToSave, currentUser.id, currentUser.name);
        setIsSubmitting(false); 
        toast({ title: 'Profile Card Created!', description: `${formData.friendName}'s profile has been successfully created.` });
        router.push('/profile-cards');
      }
    } catch (err: any) {
      console.error('Error saving profile card:', err);
      setError(err.message || 'Could not save profile card.');
      setIsSubmitting(false); 
      toast({ variant: 'destructive', title: 'Save Failed', description: err.message || 'An unexpected error occurred.' });
    } finally {
      if (isSubmitting) { 
        setIsSubmitting(false);
      }
    }
  };

  const handleCancel = () => {
    router.push('/profile-cards');
  };

  if (isLoading && mode === 'edit') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="font-body text-lg text-muted-foreground">Loading profile card details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="max-w-xl mx-auto my-10">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/profile-cards">Back to My Profile Cards</Link>
          </Button>
        </div>
      </Alert>
    );
  }

  if (mode === 'edit' && !initialCardData && !isLoading) {
     return (
       <Alert variant="destructive" className="max-w-xl mx-auto my-10">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Not Found</AlertTitle>
        <AlertDescription>The profile card you are trying to edit could not be found or you do not have permission.</AlertDescription>
         <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/profile-cards">Back to My Profile Cards</Link>
          </Button>
        </div>
      </Alert>
     );
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <ProfileCardForm
        initialData={initialCardData}
        onSubmit={handleFormSubmit}
        onCancel={handleCancel}
        mode={mode}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

export default function ManageProfileCardPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="ml-2">Loading Form...</p>
            </div>
        }>
            <ManageProfileCardContent />
        </Suspense>
    );
}
