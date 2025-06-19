
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProfileCardsByMatcher, addProfileCard, updateProfileCard, deleteProfileCard } from '@/lib/firestoreService';
import type { ProfileCard as ProfileCardType } from '@/types';
import { Button } from '@/components/ui/button';
import { ProfileCardDisplay } from '@/components/profile-cards/ProfileCardDisplay';
import { CreateEditProfileCardModal } from '@/components/profile-cards/CreateEditProfileCardModal';
import { Loader2, PlusCircle, UserX, BookOpen, Trash2, AlertTriangleIcon } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { USER_ROLES } from '@/lib/constants';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';

const MAX_PROFILE_CARDS_LIMIT = 5;

export default function ProfileCardsPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [myProfileCards, setMyProfileCards] = useState<ProfileCardType[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfileCard, setEditingProfileCard] = useState<ProfileCardType | null>(null);

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cardToDeleteId, setCardToDeleteId] = useState<string | null>(null);
  const [cardToDeleteName, setCardToDeleteName] = useState<string | null>(null);


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
        } catch (error: any) {
          console.error("Error fetching profile cards:", error);
          toast({ variant: "destructive", title: "Load Failed", description: `Could not fetch profile cards: ${error.message}` });
        } finally {
          setIsLoadingData(false);
        }
      } else if (!authLoading && !currentUser) {
        router.push('/auth/login');
      }
    }
    fetchCards();
  }, [currentUser, authLoading, router, toast]);

  const handleOpenCreateModal = () => {
    if (myProfileCards.length >= MAX_PROFILE_CARDS_LIMIT) {
      toast({
        variant: "destructive",
        title: "Profile Card Limit Reached",
        description: `You can only create up to ${MAX_PROFILE_CARDS_LIMIT} profile cards. Please delete an existing card to add a new one.`,
      });
      return;
    }
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
    if (!currentUser || !currentUser.id || !currentUser.name) {
      console.error("Cannot save profile card: current user data is incomplete or missing.", currentUser);
      toast({variant: "destructive", title: "Save Failed", description: "Your user data is incomplete. Please try logging out and back in."});
      handleCloseModal();
      return;
    }

    if (!existingCardId && myProfileCards.length >= MAX_PROFILE_CARDS_LIMIT) {
      toast({
        variant: "destructive",
        title: "Profile Card Limit Reached",
        description: `Cannot save new card. You have reached the limit of ${MAX_PROFILE_CARDS_LIMIT} profile cards.`,
      });
      handleCloseModal();
      return;
    }

    try {
      if (existingCardId) {
        const originalCard = myProfileCards.find(c => c.id === existingCardId);
        if (!originalCard) {
            console.error("Original card not found for update");
            toast({variant: "destructive", title: "Save Failed", description: "Original card data missing for update."})
            return;
        }
        const cardToUpdate: ProfileCardType = {
          ...savedCardData,
          id: existingCardId,
          createdByMatcherId: currentUser.id,
          matcherName: currentUser.name,
          createdAt: originalCard.createdAt,
        };
        await updateProfileCard(cardToUpdate);
        setMyProfileCards(prevCards =>
            prevCards
                .map(card => (card.id === existingCardId ? cardToUpdate : card))
                .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
        toast({ title: "Profile Card Updated!", description: `${cardToUpdate.friendName}'s profile has been successfully updated.` });

      } else {
        const newCard = await addProfileCard(savedCardData, currentUser.id, currentUser.name);
        setMyProfileCards(prevCards =>
            [newCard, ...prevCards]
                .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        );
        toast({ title: "Profile Card Created!", description: `${newCard.friendName}'s profile has been successfully created.` });
      }
    } catch (error: any) {
      console.error("Error saving profile card:", error);
      toast({variant: "destructive", title: "Save Failed", description: `Could not save profile card: ${error.message}`})
    } finally {
      handleCloseModal();
    }
  };

  const handleFindMatch = (profileCardId: string) => {
    router.push(`/find-matches?cardId=${profileCardId}`);
  };

  const handleOpenDeleteDialog = (cardId: string) => {
    const card = myProfileCards.find(c => c.id === cardId);
    if (card) {
      setCardToDeleteId(cardId);
      setCardToDeleteName(card.friendName);
      setIsDeleteDialogOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (cardToDeleteId) {
      try {
        await deleteProfileCard(cardToDeleteId);
        setMyProfileCards(prevCards => prevCards.filter(card => card.id !== cardToDeleteId));
        toast({ title: "Profile Card Deleted", description: `${cardToDeleteName || 'The card'}'s profile has been successfully deleted.` });
      } catch (error: any) {
        console.error("Error deleting profile card:", error);
        toast({ variant: "destructive", title: "Deletion Failed", description: `Could not delete ${cardToDeleteName || 'the card'}: ${error.message}` });
      } finally {
        setIsDeleteDialogOpen(false);
        setCardToDeleteId(null);
        setCardToDeleteName(null);
      }
    }
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

  const canCreateMoreCards = myProfileCards.length < MAX_PROFILE_CARDS_LIMIT;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="text-center sm:text-left">
            <h1 className="font-headline text-4xl font-semibold text-primary">My Profile Cards</h1>
             <p className="font-body text-muted-foreground">You have created {myProfileCards.length} of {MAX_PROFILE_CARDS_LIMIT} allowed profile cards.</p>
        </div>
        <Button
          onClick={handleOpenCreateModal}
          className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md"
          disabled={!canCreateMoreCards}
          title={!canCreateMoreCards ? `You have reached the limit of ${MAX_PROFILE_CARDS_LIMIT} profile cards.` : "Create a new profile card for a friend"}
        >
          <PlusCircle className="mr-2 h-5 w-5" /> Create New Profile Card
        </Button>
      </div>

      {!canCreateMoreCards && myProfileCards.length > 0 && (
        <Alert variant="default" className="bg-yellow-500/10 border-yellow-600/30 text-yellow-700">
          <AlertTriangleIcon className="h-4 w-4 !text-yellow-600" />
          <AlertTitle className="font-headline !text-yellow-700">Profile Card Limit Reached</AlertTitle>
          <AlertDescription className="!text-yellow-700/90">
            You have reached the maximum of {MAX_PROFILE_CARDS_LIMIT} profile cards. To create a new one, please delete an existing card.
          </AlertDescription>
        </Alert>
      )}

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
                onDeleteRequest={() => handleOpenDeleteDialog(card.id)}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreateEditProfileCardModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            profileCard={editingProfileCard}
            onSave={(data, id) => handleProfileCardSaved(data, id)}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-headline text-primary flex items-center gap-2">
              <Trash2 className="w-6 h-6"/> Are you sure you want to delete this Profile Card?
            </AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              This action will permanently delete the profile card for <span className="font-semibold">{cardToDeleteName || "this friend"}</span>. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              Yes, Delete Profile Card
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
