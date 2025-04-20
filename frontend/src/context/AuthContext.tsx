'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import supabase from '../lib/supabase';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  register: (userData: RegisterData) => Promise<any>;
  login: (credentials: LoginCredentials) => Promise<any>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (userData: ProfileData) => Promise<any>;
  changePassword: (passwordData: PasswordData) => Promise<any>;
  setError: (error: string | null) => void;
  supabase: typeof supabase;
}

interface AuthProviderProps {
  children: ReactNode;
}

interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone_number?: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface ProfileData {
  name?: string;
  phone_number?: string;
  [key: string]: any;
}

interface PasswordData {
  new_password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Set up Supabase auth state listener
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Set up listener for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Cleanup on unmount
    return () => subscription.unsubscribe();
  }, []);

  // Logout user
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      // Auth state listener will update the state
      router.push('/');
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Failed to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Load user data
  const loadUser = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      // Get user profile data from Supabase
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      // Combine auth data with profile data
      setUser({
        ...user,
        profile: data
      } as User);
    } catch (err: any) {
      console.error('Error loading user profile:', err);
      setError('Failed to load user profile.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Register user
  const register = async (userData: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      // Register with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone_number: userData.phone_number || '',
          }
        }
      });

      if (authError) throw authError;

      // Create profile record
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              name: userData.name,
              email: userData.email,
              phone_number: userData.phone_number || '',
              role: 'user',
            }
          ]);

        if (profileError) throw profileError;
      }

      return authData;
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      return data;
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData: ProfileData) => {
    if (!user) throw new Error('User not authenticated');

    setLoading(true);
    setError(null);

    try {
      // Update auth metadata if name is changing
      if (userData.name) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { name: userData.name }
        });

        if (authError) throw authError;
      }

      // Update profile record
      const { data, error: profileError } = await supabase
        .from('profiles')
        .update(userData)
        .eq('id', user.id)
        .select()
        .single();

      if (profileError) throw profileError;

      // Update local user state
      setUser({
        ...user,
        profile: data
      } as User);

      return data;
    } catch (err: any) {
      setError(err.message || 'Failed to update profile. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwordData: PasswordData) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password
      });

      if (error) throw error;

      return { message: 'Password changed successfully' };
    } catch (err: any) {
      setError(err.message || 'Failed to change password. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    session,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    loadUser,
    updateProfile,
    changePassword,
    setError,
    supabase
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
