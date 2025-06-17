
"use client";

import type { UserProfile, UserRole, PrivacySettingsData } from '@/types';
import { USER_ROLES } from '@/lib/constants';
import { defaultPrivacySettings } from '@/types'; 
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, firebaseInitializationError, db } from '@/lib/firebase';
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  // createUserWithEmailAndPassword, // No longer needed
  // signInWithEmailAndPassword, // No longer needed
  signOut,
  GoogleAuthProvider, // Added
  signInWithPopup // Added
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
    if (firebaseInitializationError) {
      console.error("AuthContext: Firebase did not initialize correctly, AuthProvider will not proceed.", firebaseInitializationError);
      if (typeof window !== 'undefined') {
        toast({ 
          variant: "destructive", 
          title: "Firebase Critical Error", 
          description: "Firebase services could not be initialized. Some features may not work. Please check console & environment variables.",
          duration: 10000 
        });
      }
      setIsLoading(false);
      return;
    }
    if (!auth) {
      console.error("AuthContext: Firebase auth instance is not available. Firebase might not have initialized correctly.");
      if (typeof window !== 'undefined') {
        toast({ 
            variant: "destructive", 
            title: "Firebase Auth Error", 
            description: "Authentication service is unavailable. Please check console.",
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
            // User signed in with Google for the first time, create their profile
            const defaultName = user.displayName || (user.email ? user.email.split('@')[0] : 'New Matcher');
            const newProfile: UserProfile = {
              id: user.uid,
              email: user.email || '', // Email from Google
              name: defaultName, // Name from Google
              role: USER_ROLES.RECOMMENDER,
              bio: 'Welcome! Please complete your matchmaker profile.',
              photoUrl: user.photoURL || generateUniqueAvatarSvgDataUri(user.uid), // Photo from Google or fallback
              privacySettings: defaultPrivacySettings,
            };
            await setUserProfile(newProfile); 
            setCurrentUser(newProfile);
            // Redirect to profile page for new users to complete their info
            if (router.pathname !== '/profile') {
                router.push('/profile');
            }
          }
        } catch (error: any) {
          console.error("AuthContext: Error fetching or setting up user profile:", error);
          setCurrentUser(null); 
          setFirebaseUser(null); 
          if (error.code === 'permission-denied' || error.message.includes('Missing or insufficient permissions')) {
             toast({ variant: "destructive", title: "Access Error", description: "Could not load your profile. Please check permissions or contact support." });
          } else {
            toast({ variant: "destructive", title: "Profile Error", description: `Failed to load profile: ${error.message}` });
          }
        }
      } else {
        setFirebaseUser(null);
        setCurrentUser(null);
        localStorage.removeItem('activeFirebaseUserId'); 
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [router, toast]);

  const handleGoogleSignIn = async () => {
    if (firebaseInitializationError || !auth) {
      toast({ variant: "destructive", title: "Sign-in Error", description: "Firebase not initialized. Cannot sign in." });
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      // onAuthStateChanged will handle fetching/creating Firestore profile
      // For new users, they are redirected to /profile by onAuthStateChanged logic
      // For existing users, redirect to dashboard.
      const userProfile = await getUserProfile(result.user.uid);
      if (userProfile && userProfile.bio !== 'Welcome! Please complete your matchmaker profile.') {
        router.push('/dashboard');
      }
      // If it's a new user, onAuthStateChanged's logic will redirect to /profile
      toast({ title: "Sign-In Successful", description: "Welcome!" });
    } catch (error: any) {
      console.error("Google sign-in error:", error);
      let description = "Could not sign in with Google. Please try again.";
      if (error.code === 'auth/popup-closed-by-user') {
        description = "Sign-in cancelled. Please try again if you wish to proceed.";
      } else if (error.code === 'auth/account-exists-with-different-credential') {
        description = "An account already exists with the same email address but different sign-in credentials. Try signing in using the original method."
      }
      toast({ variant: "destructive", title: "Sign-In Failed", description });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    await handleGoogleSignIn();
  };

  const signupWithGoogle = async () => {
    // Signup and Login with Google are effectively the same flow
    await handleGoogleSignIn();
  };

  const logoutUser = async () => {
    if (firebaseInitializationError || !auth) {
      toast({ variant: "destructive", title: "Logout Error", description: "Firebase not initialized. Cannot log out." });
      setFirebaseUser(null);
      setCurrentUser(null);
      localStorage.removeItem('activeFirebaseUserId');
      router.push('/auth/login'); // Redirect to login after logout
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      await signOut(auth);
      router.push('/auth/login'); // Redirect to login after logout
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
