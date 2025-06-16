
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileCardsByMatcher, addProfileCard, updateProfileCard } from '@/lib/firestoreService';
import type { ProfileCard as ProfileCardType } from '@/types';
import { Button } from '@/components/ui/button';
import { ProfileCardDisplay } from '@/components/profile-cards/ProfileCardDisplay';
import { CreateEditProfileCardModal } from '@/components/profile-cards/CreateEditProfileCardModal';
import { Loader2, PlusCircle, UserX, BookOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { USER_ROLES } from '@/lib/constants';

export default function ProfileCardsPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [myProfileCards, setMyProfileCards] = useState<ProfileCardType[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfileCard, setEditingProfileCard] = useState<ProfileCardType | null>(null);

  useEffect(() => {
    async function fetchCards() {
      if (!authLoading && currentUser) {
        if (currentUser.role !== USER_ROLES.RECOMMENDER) {
          router.push('/dashboard');
          return;
        }
        setIsLoadingData(true);
        try {
          const cards = await getProfileCardsByMatcher(currentUser.id);
          setMyProfileCards(cards.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
        } catch (error) {
          console.error("Error fetching profile cards:", error);
          // Optionally, set an error state to display to the user
        } finally {
          setIsLoadingData(false);
        }
      } else if (!authLoading && !currentUser) {
        router.push('/auth/login');
      }
    }
    fetchCards();
  }, [currentUser, authLoading, router]);

  const handleOpenCreateModal = () => {
    setEditingProfileCard(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (profileCard: ProfileCardType) => {
    setEditingProfileCard(profileCard);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProfileCard(null);
  };
  
  const handleProfileCardSaved = async (savedCardData: Omit<ProfileCardType, 'id' | 'createdAt' | 'matcherName' | 'createdByMatcherId'>, existingCardId?: string) => {
    if (!currentUser) return;
    setIsLoadingData(true); // Indicate loading while saving and refetching

    try {
      if (existingCardId) {
        // This is an update
        const cardToUpdate: ProfileCardType = {
          ...savedCardData,
          id: existingCardId,
          createdByMatcherId: currentUser.id, // Ensure this is set
          matcherName: currentUser.name, // Ensure this is set
           // Retain original createdAt, or fetch original card to get it if not passed
          createdAt: myProfileCards.find(c => c.id === existingCardId)?.createdAt || new Date().toISOString(),
        };
        await updateProfileCard(cardToUpdate);
      } else {
        // This is a new card
        await addProfileCard(savedCardData, currentUser.id, currentUser.name);
      }
      
      // Re-fetch cards to update the list
      const cards = await getProfileCardsByMatcher(currentUser.id);
      setMyProfileCards(cards.sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));

    } catch (error) {
      console.error("Error saving profile card:", error);
      // Handle error (e.g., show toast)
    } finally {
      setIsLoadingData(false);
      handleCloseModal();
    }
  };

  const handleFindMatch = (profileCardId: string) => {
    router.push(`/find-matches?cardId=${profileCardId}`);
  };

  if (authLoading || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Loading Profile Cards...</p>
      </div>
    );
  }

  if (currentUser?.role !== USER_ROLES.RECOMMENDER) {
    return (
     <Alert variant="destructive" className="max-w-2xl mx-auto">
       <UserX className="h-4 w-4" />
       <AlertTitle className="font-headline">Access Denied</AlertTitle>
       <AlertDescription className="font-body">
         This page is for Matchmakers only.
       </AlertDescription>
     </Alert>
   );
 }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
            <h1 className="font-headline text-4xl font-semibold text-primary">My Profile Cards</h1>
        </div>
        <Button onClick={handleOpenCreateModal} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md">
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Profile Card
        </Button>
      </div>

      {myProfileCards.length === 0 ? (
        <Card className="text-center py-12">
          <CardHeader>
            <div className="mx-auto bg-secondary p-4 rounded-full w-fit mb-4">
              <BookOpen className="h-12 w-12 text-secondary-foreground" />
            </div>
            <CardTitle className="font-headline text-2xl">No Profile Cards Yet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-body text-muted-foreground">
              You haven't created any Profile Cards for your friends yet.
              Click the button above to get started!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myProfileCards.map(card => (
            <ProfileCardDisplay 
                key={card.id} 
                profileCard={card} 
                onEdit={() => handleOpenEditModal(card)}
                onFindMatch={() => handleFindMatch(card.id)}
            />
          ))}
        </div>
      )}

      <CreateEditProfileCardModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        profileCard={editingProfileCard}
        onSave={(data) => handleProfileCardSaved(data, editingProfileCard?.id)}
      />
    </div>
  );
}
