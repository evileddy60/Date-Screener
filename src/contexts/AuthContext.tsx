
"use client";

import type { UserProfile, UserRole, PrivacySettingsData } from '@/types';
import { USER_ROLES } from '@/lib/constants';
import { defaultPrivacySettings } from '@/types'; 
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase'; 
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";
// mockUserProfiles is removed from here as AuthContext will now rely on Firestore for user profiles
import { generateUniqueAvatarSvgDataUri } from '@/lib/utils'; 
import { getUserProfile, setUserProfile } from '@/lib/firestoreService'; // Import Firestore functions

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null; 
  isAuthenticated: boolean;
  loginUser: (email: string, password_unused?: string) => Promise<void>; 
  signupUser: (email: string, password_unused?: string, name?: string) => Promise<void>; 
  logoutUser: () => Promise<void>;
  isLoading: boolean;
  updateUserProfile: (updatedProfile: UserProfile) => Promise<void>; // Changed to Promise
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => { // Made async
      setIsLoading(true);
      if (user) {
        setFirebaseUser(user);
        let profile = await getUserProfile(user.uid); // Fetch from Firestore
        
        if (profile) {
          // Ensure privacySettings exist, apply defaults if not
          if (!profile.privacySettings) {
            profile.privacySettings = defaultPrivacySettings;
            await setUserProfile(profile); // Save updated profile to Firestore
          }
          setCurrentUser(profile);
        } else {
          // Profile not in Firestore, create default and save it
          const defaultName = user.displayName || (user.email ? user.email.split('@')[0] : 'New Matcher');
          const newProfile: UserProfile = {
            id: user.uid,
            email: user.email || '',
            name: defaultName,
            role: USER_ROLES.RECOMMENDER,
            bio: 'Welcome! Please complete your matchmaker profile.',
            photoUrl: user.photoURL || generateUniqueAvatarSvgDataUri(user.uid), 
            privacySettings: defaultPrivacySettings,
          };
          await setUserProfile(newProfile); // Save new profile to Firestore
          setCurrentUser(newProfile);
        }
      } else {
        setFirebaseUser(null);
        setCurrentUser(null);
        // localStorage cleanup for activeFirebaseUserId can remain if other parts of app use it,
        // but userProfile-uid is no longer the source of truth
        localStorage.removeItem('activeFirebaseUserId'); 
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginUser = async (email: string, password_for_firebase: string) => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password_for_firebase);
      // onAuthStateChanged will handle fetching/setting currentUser from Firestore
      router.push('/dashboard');
      toast({ title: "Login Successful", description: "Welcome back!" });
    } catch (error: any) {
      console.error("Firebase login error:", error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message || "Invalid credentials." });
    } finally {
      setIsLoading(false);
    }
  };

  const signupUser = async (email: string, password_for_firebase: string, name_from_form: string) => {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password_for_firebase);
      const fbUser = userCredential.user;
      
      const newUserProfile: UserProfile = {
        id: fbUser.uid,
        email: fbUser.email || email,
        name: name_from_form || (fbUser.email ? fbUser.email.split('@')[0] : 'New Matcher'),
        role: USER_ROLES.RECOMMENDER,
        bio: 'Just joined! Ready to make some matches.',
        photoUrl: fbUser.photoURL || generateUniqueAvatarSvgDataUri(fbUser.uid),
        privacySettings: defaultPrivacySettings,
      };
      
      await setUserProfile(newUserProfile); // Save to Firestore
      setCurrentUser(newUserProfile); 
      // No need to set activeFirebaseUserId in localStorage here, onAuthStateChanged handles it
      
      router.push('/profile'); 
      toast({ title: "Signup Successful!", description: "Welcome! Please complete your profile." });
    } catch (error: any) {
      console.error("Firebase signup error:", error);
      toast({ variant: "destructive", title: "Signup Failed", description: error.message || "Could not create account." });
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      // currentUser and firebaseUser will be set to null by onAuthStateChanged
      router.push('/auth/login');
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error: any) { // Corrected: Added opening curly brace
      console.error("Firebase logout error:", error);
      toast({ variant: "destructive", title: "Logout Failed", description: error.message });
    } finally {
      setIsLoading(false);
    }
  };
  
  const isAuthenticated = !!firebaseUser && !!currentUser && currentUser.role === USER_ROLES.RECOMMENDER;

  const updateUserProfile = async (updatedProfile: UserProfile) => { // Made async
    if (firebaseUser && firebaseUser.uid === updatedProfile.id) {
      const profileToSave = {
        ...updatedProfile,
        privacySettings: updatedProfile.privacySettings || defaultPrivacySettings,
      };
      await setUserProfile(profileToSave); // Save to Firestore
      setCurrentUser(profileToSave); 
      // No localStorage update needed here
    } else {
      toast({ variant: "destructive", title: "Update Error", description: "Cannot update profile. User mismatch or not logged in." });
    }
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      firebaseUser,
      isAuthenticated, 
      loginUser, 
      signupUser, 
      logoutUser, 
      isLoading,
      updateUserProfile
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
