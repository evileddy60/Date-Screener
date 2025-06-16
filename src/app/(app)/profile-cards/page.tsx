
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockProfileCards } from '@/lib/mockData'; 
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
    if (!authLoading && currentUser) {
      if (currentUser.role !== USER_ROLES.RECOMMENDER) {
        router.push('/dashboard');
        return;
      }
      // Simulate fetching profile cards created by the current matcher
      const cards = mockProfileCards.filter(card => card.createdByMatcherId === currentUser.id);
      setMyProfileCards(cards);
      setIsLoadingData(false);
    } else if (!authLoading && !currentUser) {
      router.push('/auth/login');
    }
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
  
  const handleProfileCardSaved = (savedCard: ProfileCardType) => {
    if (!currentUser) return; 

    // First, update the mockProfileCards array (our source of truth for the session)
    const mockIndex = mockProfileCards.findIndex(c => c.id === savedCard.id);
    if (mockIndex !== -1) {
        mockProfileCards[mockIndex] = savedCard; // Update existing
    } else {
        mockProfileCards.push(savedCard); // Add new
    }

    // Then, re-filter from the updated mockProfileCards to update the local state
    const updatedUserCards = mockProfileCards.filter(
      card => card.createdByMatcherId === currentUser.id
    );
    setMyProfileCards(updatedUserCards);

    handleCloseModal();
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
            <p className="font-body text-lg text-foreground/80 mt-2">
            Manage the profiles of your single friends. Create new cards or edit existing ones.
            </p>
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
        onSave={handleProfileCardSaved}
      />
    </div>
  );
}
