
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
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsLoading(true);
      if (user) {
        setFirebaseUser(user);
        try {
          let profile = await getUserProfile(user.uid); 
          
          if (profile) {
            if (!profile.privacySettings) {
              profile.privacySettings = defaultPrivacySettings;
              // No need to await setUserProfile here if it's just defaulting, 
              // but if critical for immediate next steps, can await.
              // For now, let's assume UI can handle transient state if settings are immediately used.
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
            await setUserProfile(newProfile); 
            setCurrentUser(newProfile);
          }
        } catch (error: any) {
          console.error("AuthContext: Error fetching or setting up user profile:", error);
          // If profile fetch fails due to permissions, user might be stuck in loading or redirected.
          // Depending on rules, they might not even be able to create their own profile.
          // This error needs to be handled gracefully, perhaps by redirecting to an error page or login.
          setCurrentUser(null); // Ensure no stale/partial user data
          setFirebaseUser(null); // Log out Firebase user state if profile is inaccessible
          if (error.code === 'permission-denied' || error.message.includes('Missing or insufficient permissions')) {
             toast({ variant: "destructive", title: "Access Error", description: "Could not load your profile. Please check permissions or contact support." });
             // Consider redirecting to login after a delay or if not already on login
             // router.push('/auth/login');
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
  }, [router, toast]); // Added router and toast to dependency array

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
  
  const isAuthenticated = !!firebaseUser && !!currentUser && currentUser.role === USER_ROLES.RECOMMENDER;

  const updateUserProfile = async (updatedProfile: UserProfile) => {
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
