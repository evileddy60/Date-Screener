
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileForm } from '@/components/profile/UserProfileForm';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import type { UserProfile as UserProfileType } from '@/types';
import { Button } from '@/components/ui/button';
import { Loader2, Edit3, Eye } from 'lucide-react';
import { USER_ROLES } from '@/lib/constants';

export default function ProfilePage() {
  const { currentUser, isLoading: authLoading, firebaseUser, updateUserProfile } = useAuth(); // Added updateUserProfile
  const [profileData, setProfileData] = useState<UserProfileType | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.role === USER_ROLES.RECOMMENDER) {
      setProfileData(currentUser);
      if (currentUser.bio === 'Just joined! Ready to make some matches.' || currentUser.bio === 'Enthusiastic new matchmaker!' || !currentUser.name.includes(' ') || currentUser.bio === 'Welcome! Please complete your matchmaker profile.') {
        setIsEditing(true);
      }
    }
  }, [currentUser]);

  const handleProfileUpdate = (updatedProfile: UserProfileType) => {
    updatedProfile.role = USER_ROLES.RECOMMENDER; // Ensure role remains recommender
    
    if (firebaseUser && firebaseUser.uid === updatedProfile.id) {
      updateUserProfile(updatedProfile); // Use context function to update
      // setProfileData(updatedProfile); // This will be updated by the useEffect when currentUser changes
    }
    
    setIsEditing(false);
  };

  if (authLoading || (!profileData && firebaseUser)) { 
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg font-medium text-foreground">Loading Your Matchmaker Profile...</p>
      </div>
    );
  }
  
  if (!profileData) {
      if (firebaseUser) {
           if (!isEditing && currentUser?.bio === 'Welcome! Please complete your matchmaker profile.') {
             setIsEditing(true); 
           } else if (!isEditing && (!currentUser || currentUser.bio === 'Just joined! Ready to make some matches.' || currentUser.bio === 'Enthusiastic new matchmaker!')) {
             setIsEditing(true);
           }
      } else {
         return <p className="text-center font-body">Profile data not available. Please ensure you are logged in.</p>;
      }
  }

  if (currentUser?.role !== USER_ROLES.RECOMMENDER) {
      return <p className="text-center font-body">This profile page is for Matchmakers.</p>;
  }


  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-4xl font-semibold text-primary">Your Matchmaker Profile</h1>
        {profileData && 
          <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="border-primary text-primary hover:bg-primary/10">
            {isEditing ? <><Eye className="mr-2 h-4 w-4" /> View Profile</> : <><Edit3 className="mr-2 h-4 w-4" /> Edit Profile</>}
          </Button>
        }
      </div>

      {isEditing && profileData ? ( 
        <UserProfileForm profile={profileData} onSubmit={handleProfileUpdate} />
      ) : profileData ? ( 
        <ProfileDisplay profile={profileData} />
      ) : (
        // Initial state before profileData is set or if form should be shown for new user
        <UserProfileForm profile={currentUser || {} as UserProfileType} onSubmit={handleProfileUpdate} />
      )}
    </div>
  );
}
