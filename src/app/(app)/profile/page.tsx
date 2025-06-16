
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserProfileForm } from '@/components/profile/UserProfileForm';
import { ProfileDisplay } from '@/components/profile/ProfileDisplay';
import type { UserProfile as UserProfileType } from '@/types';
import { Button } from '@/components/ui/button';
import { Loader2, Edit3, Eye } from 'lucide-react';
import { USER_ROLES } from '@/lib/constants';
// mockUserProfiles is no longer the primary source for the logged-in user's profile
// It might still be used if UserProfileForm needs to interact with it for other reasons,
// but for the current user, AuthContext.currentUser is the source.

export default function ProfilePage() {
  const { currentUser, isLoading: authLoading, firebaseUser } = useAuth(); // firebaseUser can be used to confirm auth state
  const [profileData, setProfileData] = useState<UserProfileType | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.role === USER_ROLES.RECOMMENDER) {
      setProfileData(currentUser);
      // If profile is very basic (e.g., new user redirected here), start in edit mode
      // A more robust check for "basic" would be good, e.g. default bio
      if (currentUser.bio === 'Just joined! Ready to make some matches.' || currentUser.bio === 'Enthusiastic new matchmaker!' || !currentUser.name.includes(' ')) {
        setIsEditing(true);
      }
    }
  }, [currentUser]);

  const handleProfileUpdate = (updatedProfile: UserProfileType) => {
    // Ensure the role remains recommender
    updatedProfile.role = USER_ROLES.RECOMMENDER;
    
    // The AuthContext now needs a way to update its currentUser and localStorage
    // For now, we'll assume a function exists in AuthContext or update it directly here
    // This is a temporary solution before full Firestore integration for profiles.
    if (firebaseUser && firebaseUser.uid === updatedProfile.id) {
        localStorage.setItem(`userProfile-${firebaseUser.uid}`, JSON.stringify(updatedProfile));
        // Ideally, AuthContext provides a method to update its internal currentUser state
        // Forcing a reload or having AuthContext re-read from localStorage could be alternatives
        // For simplicity now, just update local state and localStorage. AuthContext will pick up on next load/event.
        setProfileData(updatedProfile); 
        // Potentially call a function from useAuth() to update the context's currentUser
        // e.g. updateAuthContextProfile(updatedProfile);
    }
    
    setIsEditing(false);
  };

  if (authLoading || !profileData && firebaseUser) { // Check firebaseUser to ensure we're not just waiting for profile to load after auth
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg font-medium text-foreground">Loading Your Matchmaker Profile...</p>
      </div>
    );
  }
  
  // If still no profileData but auth is done and firebaseUser exists, it means something is off or user needs to create one.
  // This case might be covered by redirect in AppLayout if currentUser is null.
  if (!profileData) {
      // This state should ideally not be reached if AppLayout correctly redirects unauthenticated users
      // or if onAuthStateChanged always creates a basic profile for authenticated users.
      // If it is reached, it implies an authenticated user has no profile data yet.
      // We can prompt to create or redirect.
      if (firebaseUser) {
          // New user, push to edit mode.
           if (!isEditing) setIsEditing(true); // Should already be set by useEffect if basic
      } else {
         return <p className="text-center font-body">Profile data not available. Please ensure you are logged in.</p>;
      }
  }


  // This page is for Matchmaker's profile.
  if (currentUser?.role !== USER_ROLES.RECOMMENDER) {
      return <p className="text-center font-body">This profile page is for Matchmakers.</p>;
  }


  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="font-headline text-4xl font-semibold text-primary">Your Matchmaker Profile</h1>
        {profileData && /* Only show button if profileData exists */
          <Button onClick={() => setIsEditing(!isEditing)} variant="outline" className="border-primary text-primary hover:bg-primary/10">
            {isEditing ? <><Eye className="mr-2 h-4 w-4" /> View Profile</> : <><Edit3 className="mr-2 h-4 w-4" /> Edit Profile</>}
          </Button>
        }
      </div>

      {isEditing && profileData ? ( // Ensure profileData exists for the form
        <UserProfileForm profile={profileData} onSubmit={handleProfileUpdate} />
      ) : profileData ? ( // Ensure profileData exists for display
        <ProfileDisplay profile={profileData} />
      ) : (
        // Fallback or specific message if profileData is still null after loading
        <p className="text-center font-body">Loading profile or create one by clicking "Edit Profile".</p>
      )}
    </div>
  );
}
