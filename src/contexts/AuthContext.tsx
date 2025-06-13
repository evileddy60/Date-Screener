"use client";

import type { UserProfile, UserRole } from '@/types';
import { mockUserProfiles } from '@/lib/mockData';
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  currentUser: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Simulate checking for an existing session
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = (email: string, roleToFind?: UserRole) => {
    // Find user by email, and optionally by role if multiple profiles for one email (not typical here)
    let user = mockUserProfiles.find(u => u.email.toLowerCase() === email.toLowerCase() && (roleToFind ? u.role === roleToFind : true));
    
    if (!user && email.includes("newrecommender")) { // Generic new recommender
      user = { id: Date.now().toString(), email, name: "New Recommender", role: 'recommender', bio: "Helping friends find love!" };
      mockUserProfiles.push(user);
    } else if (!user && email.includes("newsingle")) { // Generic new single
      user = { id: Date.now().toString(), email, name: "New Single", role: 'single', bio: "Ready for a new adventure." };
      mockUserProfiles.push(user);
    } else if (!user) { // Fallback if no specific role or new user type, try to find any match by email
      user = mockUserProfiles.find(u => u.email.toLowerCase() === email.toLowerCase());
    }


    if (user) {
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user));
      router.push('/dashboard');
    } else {
      // For demo, if user not found, create a generic one based on role or default to single
      const newUserRole = email.includes('recommender') ? 'recommender' : 'single';
      const newUser: UserProfile = {
        id: `new-${Date.now()}`,
        email,
        name: `User ${email.split('@')[0]}`,
        role: newUserRole,
        bio: 'Newly registered user.',
        photoUrl: `https://placehold.co/400x400?text=${email.charAt(0).toUpperCase()}`
      };
      mockUserProfiles.push(newUser); // Add to mock data for persistence in session
      setCurrentUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      router.push('/dashboard');
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    router.push('/auth/login');
  };
  
  const isAuthenticated = !!currentUser;

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
