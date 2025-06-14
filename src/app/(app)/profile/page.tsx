
"use client";

import { useState, useEffect }
from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileForm } from '@/components/profile/UserProfileForm';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import type { UserProfile as UserProfileType } from '@/types';
import { Button } from '@/components/ui/button';
import { mockUserProfiles } from '@/lib/mockData'; 
import { Loader2, Edit3, Eye } from 'lucide-react';
import { USER_ROLES } from '@/lib/constants';

export default function ProfilePage() {
  const { currentUser, isLoading: authLoading, login } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileType | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.role === USER_ROLES.RECOMMENDER) {
      const currentProfileFromMock = mockUserProfiles.find(p => p.id === currentUser.id);
      setProfileData(currentProfileFromMock || currentUser);
      // If profile is very basic (e.g., new user redirected here), start in edit mode
      if (!currentProfileFromMock?.bio && !currentProfileFromMock?.photoUrl) {
        setIsEditing(true);
      }
    }
  }, [currentUser]);

  const handleProfileUpdate = (updatedProfile: UserProfileType) => {
    // Ensure the role remains recommender
    updatedProfile.role = USER_ROLES.RECOMMENDER;

    const profileIndex = mockUserProfiles.findIndex(p => p.id === updatedProfile.id);
    if (profileIndex !== -1) {
      mockUserProfiles[profileIndex] = updatedProfile;
    } else {
      mockUserProfiles.push(updatedProfile); 
    }
    setProfileData(updatedProfile);
    setIsEditing(false);
    
    // Update AuthContext's currentUser by "re-logging in" with the existing email and new role.
    if(currentUser) login(currentUser.email, USER_ROLES.RECOMMENDER);
  };

  if (authLoading || !profileData) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg font-medium text-foreground">Loading Your Matchmaker Profile...</p>
      </div>
    );
  }

  // This page is for Matchmaker's profile.
  if (currentUser?.role !== USER_ROLES.RECOMMENDER) {
      return <p className="text-center font-body">This profile page is for Matchmakers.</p>;
  }


  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-4xl font-semibold text-primary">Your Matchmaker Profile</h1>
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
