
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
import { generateUniqueAvatarSvgDataUri } from '@/lib/utils'; // Import new avatar generator

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
        const storedProfile = localStorage.getItem(`userProfile-${user.uid}`);
        if (storedProfile) {
          setCurrentUser(JSON.parse(storedProfile));
        } else {
          const defaultName = user.email ? user.email.split('@')[0] : 'New Matcher';
          const basicProfile: UserProfile = {
            id: user.uid,
            email: user.email || '',
            name: user.displayName || defaultName,
            role: USER_ROLES.RECOMMENDER,
            bio: 'Welcome! Please complete your matchmaker profile.',
            photoUrl: generateUniqueAvatarSvgDataUri(user.uid), 
          };
          setCurrentUser(basicProfile);
          localStorage.setItem(`userProfile-${user.uid}`, JSON.stringify(basicProfile));
        }
      } else {
        setFirebaseUser(null);
        setCurrentUser(null);
        // Attempt to get activeFirebaseUserId before it's cleared, if needed for specific profile removal
        // However, a simple full clear or specific key removal is usually fine on logout.
        const activeId = localStorage.getItem('activeFirebaseUserId');
        if (activeId) {
            localStorage.removeItem(`userProfile-${activeId}`);
        }
        localStorage.removeItem('activeFirebaseUserId'); 
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
      // The onAuthStateChanged listener will handle setting firebaseUser and currentUser from localStorage
      // We just need to ensure activeFirebaseUserId is set.
      localStorage.setItem('activeFirebaseUserId', fbUser.uid);
      router.push('/dashboard');
      toast({ title: "Login Successful", description: "Welcome back!" });
    } catch (error: any) {
      console.error("Firebase login error:", error);
      toast({ variant: "destructive", title: "Login Failed", description: error.message || "Invalid credentials." });
      // No need to setCurrentUser(null) here, onAuthStateChanged handles it if auth state is truly null
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
        photoUrl: generateUniqueAvatarSvgDataUri(fbUser.uid),
      };
      
      // onAuthStateChanged will set firebaseUser. Here we set currentUser and store it.
      setCurrentUser(newUserProfile);
      localStorage.setItem(`userProfile-${fbUser.uid}`, JSON.stringify(newUserProfile));
      localStorage.setItem('activeFirebaseUserId', fbUser.uid);
      
      // Update mockUserProfiles if it's still being used for any other part (e.g., displaying other users)
      const existingMockUserIndex = mockUserProfiles.findIndex(p => p.email === newUserProfile.email);
      if (existingMockUserIndex === -1) {
          mockUserProfiles.push(newUserProfile);
      } else {
          mockUserProfiles[existingMockUserIndex] = newUserProfile;
      }

      router.push('/profile'); 
      toast({ title: "Signup Successful!", description: "Welcome! Please complete your profile." });
    } catch (error: any) {
      console.error("Firebase signup error:", error);
      toast({ variant: "destructive", title: "Signup Failed", description: error.message || "Could not create account." });
      // No need to setCurrentUser(null) here, onAuthStateChanged handles it
    } finally {
      setIsLoading(false);
    }
  };

  const logoutUser = async () => {
    setIsLoading(true);
    try {
      // The onAuthStateChanged listener will clear firebaseUser, currentUser, 
      // and remove userProfile from localStorage. We just call signOut.
      await signOut(auth);
      // activeFirebaseUserId is cleared by onAuthStateChanged when user becomes null
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

  // Function to allow components to update the currentUser in context and localStorage
  // This might be used by UserProfileForm after a successful profile update
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
      loginUser, 
      signupUser, 
      logoutUser: logoutUser, 
      isLoading 
      // If updateUserProfileInContext is needed by other components, expose it here:
      // updateUserProfile: updateUserProfileInContext 
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
