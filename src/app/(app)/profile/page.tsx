
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileForm } from '@/components/profile/UserProfileForm';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import type { UserProfile as UserProfileType } from '@/types'; // Ensure PrivacySettingsData is implicitly part of UserProfileType via import
import { Button } from '@/components/ui/button';
import { Loader2, Edit3, Eye } from 'lucide-react';
import { USER_ROLES } from '@/lib/constants';
import { defaultPrivacySettings } from '@/types'; // Import default settings

export default function ProfilePage() {
  const { currentUser, isLoading: authLoading, firebaseUser, updateUserProfile } = useAuth();
  const [profileData, setProfileData] = useState<UserProfileType | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.role === USER_ROLES.RECOMMENDER) {
      // Ensure currentUser always has privacySettings, even if just defaults
      const fullProfile = {
        ...currentUser,
        privacySettings: currentUser.privacySettings || defaultPrivacySettings,
      };
      setProfileData(fullProfile);
      if (currentUser.bio === 'Just joined! Ready to make some matches.' || currentUser.bio === 'Enthusiastic new matchmaker!' || !currentUser.name.includes(' ') || currentUser.bio === 'Welcome! Please complete your matchmaker profile.') {
        setIsEditing(true);
      }
    }
  }, [currentUser]);

  const handleProfileUpdate = (updatedProfile: UserProfileType) => {
    if (firebaseUser && firebaseUser.uid === updatedProfile.id) {
      updateUserProfile(updatedProfile); // AuthContext function handles saving and updating context
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
  
  if (!profileData && firebaseUser) {
    // This block might be redundant given the loading state above, but as a fallback
    // for scenarios where currentUser might be briefly null after firebaseUser is set.
    // The useEffect should populate profileData correctly.
    if (!isEditing && (currentUser?.bio === 'Welcome! Please complete your matchmaker profile.' || 
                      !currentUser?.name.includes(' ') || 
                      currentUser?.bio === 'Just joined! Ready to make some matches.' || 
                      currentUser?.bio === 'Enthusiastic new matchmaker!')) {
      setIsEditing(true); 
    }
  } else if (!profileData && !firebaseUser) {
    return <p className="text-center font-body">Profile data not available. Please ensure you are logged in.</p>;
  }


  if (currentUser?.role !== USER_ROLES.RECOMMENDER) {
      return <p className="text-center font-body">This profile page is for Matchmakers.</p>;
  }


  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-4xl font-semibold text-primary">Your Matchmaker Settings</h1>
        {profileData && 
          <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="border-primary text-primary hover:bg-primary/10">
            {isEditing ? <><Eye className="mr-2 h-4 w-4" /> View Profile & Settings</> : <><Edit3 className="mr-2 h-4 w-4" /> Edit Profile & Settings</>}
          </Button>
        }
      </div>

      {/* Ensure profileData is passed and is not null */}
      {isEditing && profileData ? ( 
        <UserProfileForm profile={profileData} onSubmit={handleProfileUpdate} />
      ) : profileData ? ( 
        <ProfileDisplay profile={profileData} />
      ) : (
        // Fallback for initial state or if profileData is somehow null but firebaseUser exists
        // This tries to use currentUser or an empty shell if currentUser is also null.
        // It's important that profileData becomes non-null quickly via useEffect.
        <UserProfileForm 
          profile={currentUser || { 
              id: '', email: '', name: '', role: USER_ROLES.RECOMMENDER, 
              privacySettings: defaultPrivacySettings 
            } as UserProfileType} 
          onSubmit={handleProfileUpdate} 
        />
      )}
    </div>
  );
}
