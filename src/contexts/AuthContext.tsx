
"use client";

import type { UserProfile, UserRole } from '@/types';
import { mockUserProfiles } from '@/lib/mockData';
import { USER_ROLES } from '@/lib/constants';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => void; // Role is optional, for signup flow primarily
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      const user: UserProfile = JSON.parse(storedUser);
      // Ensure users from old sessions are treated as recommenders if their role was single
      if (user.role === USER_ROLES.SINGLE) {
        user.role = USER_ROLES.RECOMMENDER; 
        localStorage.setItem('currentUser', JSON.stringify(user));
      }
      setCurrentUser(user);
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, roleFromSignup?: UserRole) => {
    let user = mockUserProfiles.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
      // If existing user is found but was 'single', update to 'recommender' for this new app logic
      if (user.role === USER_ROLES.SINGLE) {
        user.role = USER_ROLES.RECOMMENDER;
        // Optionally update in mockUserProfiles array if you want this change to persist for the session for that mock user
        const userIndex = mockUserProfiles.findIndex(u => u.id === user!.id);
        if (userIndex !== -1) {
            mockUserProfiles[userIndex].role = USER_ROLES.RECOMMENDER;
        }
      }
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      router.push('/dashboard');
    } else {
      // New user registration: always as recommender
      const newUser: UserProfile = {
        id: `new-${Date.now()}`,
        email,
        name: `${email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)} (Matcher)`, // Default name
        role: USER_ROLES.RECOMMENDER, // All new users are recommenders
        bio: 'Enthusiastic new matchmaker!',
        photoUrl: `https://placehold.co/400x400?text=${email.charAt(0).toUpperCase()}`
      };
      mockUserProfiles.push(newUser);
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      router.push('/profile'); // Redirect new users to complete their matcher profile
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    router.push('/auth/login');
  };
  
  const isAuthenticated = !!currentUser && currentUser.role === USER_ROLES.RECOMMENDER;

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, login, logout, isLoading }}>
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
