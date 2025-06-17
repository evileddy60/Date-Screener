
"use client";

import type { UserProfile, UserRole, PrivacySettingsData } from '@/types';
import { USER_ROLES } from '@/lib/constants';
import { defaultPrivacySettings } from '@/types'; 
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth, firebaseInitializationError } from '@/lib/firebase'; 
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";
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
      // Display a toast only on the client side if Firebase init failed
      if (typeof window !== 'undefined') {
        toast({ 
          variant: "destructive", 
          title: "Firebase Critical Error", 
          description: "Firebase services could not be initialized. Some features may not work. Please check console & environment variables.",
          duration: 10000 // Keep it visible longer
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
        try {
          let profile = await getUserProfile(user.uid); 
          
          if (profile) {
            if (!profile.privacySettings) {
              profile.privacySettings = defaultPrivacySettings;
            }
            setCurrentUser(profile);
          } else {
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
            await setUserProfile(newProfile); 
            setCurrentUser(newProfile);
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

  const loginUser = async (email: string, password_for_firebase: string) => {
    if (firebaseInitializationError || !auth) {
      toast({ variant: "destructive", title: "Login Error", description: "Firebase not initialized. Cannot log in." });
      setIsLoading(false); // Ensure loading state is reset
      return;
    }
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
     if (firebaseInitializationError || !auth) {
      toast({ variant: "destructive", title: "Signup Error", description: "Firebase not initialized. Cannot sign up." });
      setIsLoading(false); // Ensure loading state is reset
      return;
    }
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
      
      await setUserProfile(newUserProfile); 
      setCurrentUser(newUserProfile); 
      
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
    if (firebaseInitializationError || !auth) {
      toast({ variant: "destructive", title: "Logout Error", description: "Firebase not initialized. Cannot log out." });
      // Still attempt local cleanup
      setFirebaseUser(null);
      setCurrentUser(null);
      localStorage.removeItem('activeFirebaseUserId');
      router.push('/auth/login');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      await signOut(auth);
      // onAuthStateChanged will set currentUser and firebaseUser to null
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
    if (firebaseInitializationError) {
      toast({ variant: "destructive", title: "Update Error", description: "Firebase not initialized. Cannot update profile." });
      return;
    }
    if (firebaseUser && firebaseUser.uid === updatedProfile.id) {
      const profileToSave = {
        ...updatedProfile,
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
