
"use client";

import type { UserProfile, UserRole } from '@/types';
import { USER_ROLES } from '@/lib/constants';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/lib/firebase'; // Firebase auth instance
import { 
  User as FirebaseUser, 
  onAuthStateChanged, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { useToast } from "@/hooks/use-toast";
import { mockUserProfiles } from '@/lib/mockData'; // Still needed for other user's data temporarily

interface AuthContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null; // Expose Firebase user object if needed
  isAuthenticated: boolean;
  loginUser: (email: string, password_unused?: string) => Promise<void>; // Password will be used by Firebase
  signupUser: (email: string, password_unused?: string, name?: string) => Promise<void>; // Password will be used by Firebase
  logoutUser: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoading(true);
      if (user) {
        setFirebaseUser(user);
        // Try to load enhanced profile from localStorage
        const storedProfile = localStorage.getItem(`userProfile-${user.uid}`);
        if (storedProfile) {
          setCurrentUser(JSON.parse(storedProfile));
        } else {
          // If no local profile, create a basic one (e.g., first login on new device)
          // This part will be enhanced when Firestore profiles are used.
          const defaultName = user.email ? user.email.split('@')[0] : 'New Matcher';
          const basicProfile: UserProfile = {
            id: user.uid,
            email: user.email || '',
            name: user.displayName || defaultName,
            role: USER_ROLES.RECOMMENDER,
            bio: 'Welcome! Please complete your matchmaker profile.',
            photoUrl: user.photoURL || `https://placehold.co/400x400?text=${user.email ? user.email.charAt(0).toUpperCase() : 'M'}`,
          };
          setCurrentUser(basicProfile);
          localStorage.setItem(`userProfile-${user.uid}`, JSON.stringify(basicProfile));
        }
      } else {
        setFirebaseUser(null);
        setCurrentUser(null);
        localStorage.removeItem('activeFirebaseUserId'); // Clear active user ID
        // Potentially clear all userProfile-* keys if needed, or manage individually
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginUser = async (email: string, password_for_firebase: string) => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password_for_firebase);
      const fbUser = userCredential.user;
      // onAuthStateChanged will handle setting firebaseUser and currentUser
      // Forcing a profile check/creation here as onAuthStateChanged might be slightly delayed
      const storedProfile = localStorage.getItem(`userProfile-${fbUser.uid}`);
      if (storedProfile) {
        setCurrentUser(JSON.parse(storedProfile));
      } else {
        const defaultName = fbUser.email ? fbUser.email.split('@')[0] : 'Matcher';
        const basicProfile: UserProfile = {
            id: fbUser.uid,
            email: fbUser.email || '',
            name: fbUser.displayName || defaultName,
            role: USER_ROLES.RECOMMENDER,
            photoUrl: `https://placehold.co/400x400?text=${fbUser.email ? fbUser.email.charAt(0).toUpperCase() : 'M'}`,
        };
        setCurrentUser(basicProfile);
        localStorage.setItem(`userProfile-${fbUser.uid}`, JSON.stringify(basicProfile));
      }
      localStorage.setItem('activeFirebaseUserId', fbUser.uid);
      router.push('/dashboard');
      toast({ title: "Login Successful", description: "Welcome back!" });
    } catch (error: any) {
      console.error("Firebase login error:", error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message || "Invalid credentials." });
      setCurrentUser(null);
      setFirebaseUser(null);
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
        photoUrl: `https://placehold.co/400x400?text=${(name_from_form || fbUser.email!).charAt(0).toUpperCase()}`,
        // interests and preferences can be added via profile page
      };
      
      setCurrentUser(newUserProfile);
      setFirebaseUser(fbUser); // Ensure firebaseUser is also set
      localStorage.setItem(`userProfile-${fbUser.uid}`, JSON.stringify(newUserProfile));
      localStorage.setItem('activeFirebaseUserId', fbUser.uid);
      
      // Update mockUserProfiles with the new user FOR THIS SESSION ONLY for display purposes of other users
      // This is a temporary measure until Firestore is used for all profiles
      const existingMockUserIndex = mockUserProfiles.findIndex(p => p.email === newUserProfile.email);
      if (existingMockUserIndex === -1) {
          mockUserProfiles.push(newUserProfile);
      } else {
          mockUserProfiles[existingMockUserIndex] = newUserProfile;
      }

      router.push('/profile'); // Redirect new users to complete their matcher profile
      toast({ title: "Signup Successful!", description: "Welcome! Please complete your profile." });
    } catch (error: any) {
      console.error("Firebase signup error:", error);
      toast({ variant: "destructive", title: "Signup Failed", description: error.message || "Could not create account." });
      setCurrentUser(null);
      setFirebaseUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      // onAuthStateChanged will clear firebaseUser and currentUser
      localStorage.removeItem(`userProfile-${firebaseUser?.uid}`); // Remove specific user's profile
      localStorage.removeItem('activeFirebaseUserId');
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

  // Function to update current user's profile in context and localStorage
  // This will be called from the profile page after saving.
  const updateUserProfileInContext = (updatedProfile: UserProfile) => {
    if (firebaseUser && firebaseUser.uid === updatedProfile.id) {
      setCurrentUser(updatedProfile);
      localStorage.setItem(`userProfile-${firebaseUser.uid}`, JSON.stringify(updatedProfile));
    }
  };


  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      firebaseUser,
      isAuthenticated, 
      loginUser, // renamed from login
      signupUser, // new function
      logoutUser: logoutUser, // renamed from logout
      isLoading 
      // updateUserProfileInContext might be exposed if needed by profile page directly
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
