
"use client";

import type { UserProfile, UserRole, PrivacySettingsData } from '@/types';
import { USER_ROLES } from '@/lib/constants';
import { defaultPrivacySettings } from '@/types';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, firebaseInitializationError, db } from '@/lib/firebase'; // db is imported
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";
import { generateUniqueAvatarSvgDataUri } from '@/lib/utils';
import { getUserProfile, setUserProfile } from '@/lib/firestoreService';

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<void>;
  signupWithGoogle: () => Promise<void>;
  logoutUser: () => Promise<void>;
  isLoading: boolean;
  updateUserProfile: (updatedProfile: UserProfile) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Log the env vars the client-side sees - TEMPORARY for verification
    if (typeof window !== 'undefined') {
      console.log("CLIENT_SIDE_AUTH_CONTEXT: NEXT_PUBLIC_FIREBASE_API_KEY:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
      console.log("CLIENT_SIDE_AUTH_CONTEXT: NEXT_PUBLIC_FIREBASE_PROJECT_ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
    }

    if (firebaseInitializationError) {
      console.error("AuthContext: Firebase did not initialize correctly, AuthProvider will not proceed.", firebaseInitializationError);
      if (typeof window !== 'undefined') {
        toast({
          variant: "destructive",
          title: "Firebase Critical Error",
          description: `Firebase services could not be initialized. Some features may not work. Please check Firebase configuration in your Firebase Studio IDE (https://studio.firebase.google.com/) and console logs. Error: ${firebaseInitializationError}`,
          duration: 10000
        });
      }
      setIsLoading(false);
      return;
    }
    if (!auth) {
      console.error("AuthContext: Firebase auth instance is not available. Firebase might not have initialized correctly or is blocked.");
      if (typeof window !== 'undefined') {
        toast({
            variant: "destructive",
            title: "Firebase Auth Error",
            description: "Authentication service is unavailable. This might be due to a configuration issue in your Firebase Studio IDE (https://studio.firebase.google.com/) or network block. Please check console and Firebase configuration.",
            duration: 10000
        });
      }
      setIsLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setFirebaseUser(user);
        if (!db) {
          console.error("AuthContext: Firestore DB instance is not available. Cannot fetch/set user profile.");
          toast({ variant: "destructive", title: "Profile Error", description: "Database service unavailable. Cannot load profile." });
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }
        try {
          let profile = await getUserProfile(user.uid);

          if (profile) {
            if (!profile.privacySettings) {
              profile.privacySettings = defaultPrivacySettings;
            }
            setCurrentUser(profile);
          } else {
            // User authenticated with Firebase, but no profile in Firestore, create one.
            const defaultName = user.displayName || (user.email ? user.email.split('@')[0] : 'New Matcher');
            const newProfile: UserProfile = {
              id: user.uid,
              email: user.email || '',
              name: defaultName,
              role: USER_ROLES.RECOMMENDER, // Default to recommender
              bio: 'Welcome! Please complete your matchmaker profile.',
              photoUrl: user.photoURL || generateUniqueAvatarSvgDataUri(user.uid),
              privacySettings: defaultPrivacySettings,
            };
            await setUserProfile(newProfile);
            setCurrentUser(newProfile);
            // Redirect to profile page for completion if it's a new profile
             if (typeof window !== 'undefined' && window.location.pathname !== '/profile') {
                router.push('/profile');
            }
          }
        } catch (error: any) {
          console.error("AuthContext: Error fetching or setting up user profile:", error);
          setCurrentUser(null); // Clear currentUser on error
          setFirebaseUser(null); // Clear firebaseUser on profile error to force re-auth/re-check
          if (error.code === 'permission-denied' || (error.message && error.message.includes('Missing or insufficient permissions'))) {
             toast({ variant: "destructive", title: "Access Error", description: "Could not load your profile. Please check Firestore rules or contact support." });
          } else if (error.message && (error.message.includes('GetProjectConfig-are-blocked') || error.message.includes('getProjectConfig'))) {
            // This specific error might be caught here if auth object was initially available but subsequent calls fail
            toast({ variant: "destructive", title: "Firebase Config Error", description: "Failed to get project config. Check API key in your Firebase Studio IDE (https://studio.firebase.google.com/) env vars & Identity Toolkit API status in Google Cloud (https://console.cloud.google.com/)." });
          }
          else {
            toast({ variant: "destructive", title: "Profile Error", description: `Failed to load profile: ${error.message}` });
          }
        }
      } else {
        setFirebaseUser(null);
        setCurrentUser(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('activeFirebaseUserId'); // Optional: clear any related local storage
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast]);

  const handleGoogleSignIn = async (isSignUp: boolean = false) => {
    if (firebaseInitializationError || !auth) {
      toast({ variant: "destructive", title: "Sign-in Error", description: `Firebase not initialized or auth service unavailable. Cannot sign in. Please check environment variables in your Firebase Studio IDE (https://studio.firebase.google.com/). Error: ${firebaseInitializationError || 'Auth service missing.'}` });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // Profile creation/fetching is handled by onAuthStateChanged.
      toast({ title: isSignUp ? "Sign-Up Successful!" : "Sign-In Successful!", description: "Welcome to Date Screener!" });
      if (typeof window !== 'undefined' && (window.location.pathname === '/auth/login' || window.location.pathname === '/auth/signup')) {
         router.push('/dashboard'); // Optimistic navigation
      }

    } catch (error: any) {
      console.error("Firebase Google sign-in error:", error);
      let description = "Could not sign in with Google. Please try again.";
      if (error.code === 'auth/popup-closed-by-user') {
        description = "Sign-in cancelled. Please try again if you wish to proceed.";
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        description = "An account already exists with the same email address but different sign-in credentials. Try signing in using the original method."
      } else if (error.code === 'auth/popup-blocked') {
        description = "Sign-in popup was blocked by the browser. Please allow popups for this site and try again.";
      } else if (error.code && (error.code.includes('auth/network-request-failed') || error.code.includes('network-error'))) {
        description = "Network error during sign-in. Please check your internet connection and try again.";
      } else if (error.code === 'auth/unauthorized-domain') {
        description = "This domain is not authorized for OAuth operations. Please add it in your Firebase project (Authentication > Settings > Authorized domains) on https://console.firebase.google.com/.";
      }
      else if (error.code === 'auth/internal-error' && error.message && (error.message.includes('GetProjectConfig') || error.message.includes('getProjectConfig'))) {
        description = "Error fetching project configuration during Google Sign-In. Ensure API key is correct in your Firebase Studio IDE (https://studio.firebase.google.com/) env vars & Identity Toolkit API is enabled in Google Cloud (https://console.cloud.google.com/)."
      } else if (error.message && error.message.includes('GetProjectConfig-are-blocked')) {
         description = "Requests to fetch Firebase project configuration are blocked. Check API key in your Firebase Studio IDE (https://studio.firebase.google.com/) env vars, Identity Toolkit API status in GCP, and billing."
      } else {
        description = error.message || description;
      }
      toast({ variant: "destructive", title: isSignUp ? "Sign-Up Failed" : "Sign-In Failed", description });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    await handleGoogleSignIn(false);
  };

  const signupWithGoogle = async () => {
    await handleGoogleSignIn(true);
  };

  const logoutUser = async () => {
    if (firebaseInitializationError || !auth) {
      toast({ variant: "destructive", title: "Logout Error", description: "Firebase not initialized or auth service unavailable. Cannot log out." });
      setFirebaseUser(null);
      setCurrentUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('activeFirebaseUserId');
      }
      router.push('/auth/login');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      await signOut(auth);
      router.push('/auth/login'); 
      toast({ title: "Logged Out", description: "You have been successfully logged out." });
    } catch (error: any) {
      console.error("Firebase logout error:", error);
      toast({ variant: "destructive", title: "Logout Failed", description: error.message });
    } finally {
      setIsLoading(false); 
    }
  };
  
  const isAuthenticated = !!firebaseUser && !!currentUser && currentUser.role === USER_ROLES.RECOMMENDER && !firebaseInitializationError;

  const updateUserProfile = async (updatedProfile: UserProfile) => {
    if (firebaseInitializationError || !db) {
      toast({ variant: "destructive", title: "Update Error", description: "Firebase not initialized or DB unavailable. Cannot update profile." });
      return;
    }
    if (firebaseUser && firebaseUser.uid === updatedProfile.id) {
      const profileToSave = {
        ...updatedProfile,
        photoUrl: updatedProfile.photoUrl || firebaseUser.photoURL || generateUniqueAvatarSvgDataUri(firebaseUser.uid),
        privacySettings: updatedProfile.privacySettings || defaultPrivacySettings,
      };
      await setUserProfile(profileToSave);
      setCurrentUser(profileToSave); 
    } else {
      toast({ variant: "destructive", title: "Update Error", description: "Cannot update profile. User mismatch or not logged in." });
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      firebaseUser,
      isAuthenticated,
      loginWithGoogle,
      signupWithGoogle,
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
