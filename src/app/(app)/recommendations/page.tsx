"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { mockUserProfiles, mockRecommendations } from '@/lib/mockData';
import type { UserProfile, Recommendation } from '@/types';
import { UserSearchCard } from '@/components/recommendations/UserSearchCard';
import { RecommendModal } from '@/components/recommendations/RecommendModal';
import { Input } from '@/components/ui/input';
import { Loader2, Search, UserX } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useRouter } from 'next/navigation';

export default function RecommendationsPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUserToRecommendFor, setSelectedUserToRecommendFor] = useState<UserProfile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recommendationsMade, setRecommendationsMade] = useState<Recommendation[]>(mockRecommendations);

  useEffect(() => {
    if (!authLoading && currentUser) {
        if (currentUser.role !== 'recommender') {
            router.push('/dashboard');
            return;
        }
      // Simulate fetching all users except the current recommender
      const users = mockUserProfiles.filter(user => user.id !== currentUser.id && user.role === 'single');
      setAllUsers(users);
      setFilteredUsers(users);
    } else if (!authLoading && !currentUser) {
        router.push('/auth/login');
    }
  }, [currentUser, authLoading, router]);

  useEffect(() => {
    const lowerSearchTerm = searchTerm.toLowerCase();
    const filtered = allUsers.filter(user =>
      user.name.toLowerCase().includes(lowerSearchTerm) ||
      user.email.toLowerCase().includes(lowerSearchTerm) ||
      user.bio?.toLowerCase().includes(lowerSearchTerm)
    );
    setFilteredUsers(filtered);
  }, [searchTerm, allUsers]);

  const handleOpenRecommendModal = (user: UserProfile) => {
    setSelectedUserToRecommendFor(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUserToRecommendFor(null);
  };
  
  const handleNewRecommendation = (newRec: Recommendation) => {
    setRecommendationsMade(prev => [...prev, newRec]);
    // Optionally, refresh list or provide other UI updates
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (currentUser?.role !== 'recommender') {
    return (
     <Alert variant="destructive" className="max-w-2xl mx-auto">
       <UserX className="h-4 w-4" />
       <AlertTitle className="font-headline">Access Denied</AlertTitle>
       <AlertDescription className="font-body">
         This page is for users with the 'Recommender' role.
       </AlertDescription>
     </Alert>
   );
 }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="font-headline text-4xl font-semibold text-primary">Make a Recommendation</h1>
        <p className="font-body text-lg text-foreground/80 mt-2">
          Find a single person you know and suggest a potential match for them from other users.
        </p>
      </div>

      <div className="relative max-w-lg mx-auto">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search for singles (name, email, bio...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 py-3 text-lg font-body bg-card rounded-lg shadow"
        />
      </div>

      {filteredUsers.length === 0 && searchTerm ? (
        <p className="text-center font-body text-muted-foreground">No users found matching your search.</p>
      ) : filteredUsers.length === 0 && !searchTerm ? (
         <p className="text-center font-body text-muted-foreground">No single users available to recommend for.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredUsers.map(user => (
            <UserSearchCard key={user.id} user={user} onRecommend={handleOpenRecommendModal} />
          ))}
        </div>
      )}

      {selectedUserToRecommendFor && (
        <RecommendModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          singleToRecommendFor={selectedUserToRecommendFor}
          onRecommendationMade={handleNewRecommendation}
        />
      )}
    </div>
  );
}
