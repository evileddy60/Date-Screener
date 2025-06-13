"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileForm } from '@/components/profile/UserProfileForm';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import type { UserProfile as UserProfileType } from '@/types';
import { Button } from '@/components/ui/button';
import { mockUserProfiles } from '@/lib/mockData'; // To update mock data
import { Loader2, Edit3, Eye } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, isLoading: authLoading, login } = useAuth(); // Using login to refresh context
  const [profileData, setProfileData] = useState<UserProfileType | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentUser) {
      // Find the most up-to-date profile from mockUserProfiles, as AuthContext might have stale data if not refreshed
      const currentProfileFromMock = mockUserProfiles.find(p => p.id === currentUser.id);
      setProfileData(currentProfileFromMock || currentUser);
      if (!currentProfileFromMock) setIsEditing(true); // If new user, start in edit mode
    }
  }, [currentUser]);

  const handleProfileUpdate = (updatedProfile: UserProfileType) => {
    // In a real app, this would be an API call.
    // For mock, update the mockUserProfiles array and the local state.
    const profileIndex = mockUserProfiles.findIndex(p => p.id === updatedProfile.id);
    if (profileIndex !== -1) {
      mockUserProfiles[profileIndex] = updatedProfile;
    } else {
      mockUserProfiles.push(updatedProfile); // Should not happen if profile exists
    }
    setProfileData(updatedProfile);
    setIsEditing(false);
    // "Re-login" to update currentUser in AuthContext with new details
    // This is a workaround for mock context. In real app, context might update from API response.
    if(currentUser) login(currentUser.email, updatedProfile.role);
  };

  if (authLoading || !profileData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg font-medium text-foreground">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-4xl font-semibold text-primary">Your Profile</h1>
        <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="border-primary text-primary hover:bg-primary/10">
          {isEditing ? <><Eye className="mr-2 h-4 w-4" /> View Profile</> : <><Edit3 className="mr-2 h-4 w-4" /> Edit Profile</>}
        </Button>
      </div>

      {isEditing ? (
        <UserProfileForm profile={profileData} onSubmit={handleProfileUpdate} />
      ) : (
        <ProfileDisplay profile={profileData} />
      )}
    </div>
  );
}
