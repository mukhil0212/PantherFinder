'use client';

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import * as api from '../lib/apiClient';
import supabase from '../lib/supabaseClient';

interface User {
  id: string;
  email: string;
  name: string;
  phone_number?: string;
  role?: string;
  profile?: object;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  register: (userData: RegisterData) => Promise<unknown>;
  login: (credentials: LoginCredentials) => Promise<unknown>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (userData: ProfileData) => Promise<unknown>;
  changePassword: (passwordData: PasswordData) => Promise<unknown>;
  setError: (error: string | null) => void;
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
  [key: string]: unknown;
}

interface PasswordData {
  current_password: string;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get the current Supabase session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          setLoading(false);
          return;
        }

        // Get user data from session
        const userData = session.user;

        // Create a user object from Supabase data
        const userObject: User = {
          id: userData.id,
          email: userData.email || '',
          name: userData.user_metadata?.name || '',
          phone_number: userData.user_metadata?.phone_number || '',
          role: 'user'
        };

        // Store the token for future use
        if (session.access_token) {
          localStorage.setItem('authToken', session.access_token);
          console.log('Auth token stored in localStorage');

          // Also set it as a cookie for better cross-tab support
          document.cookie = `authToken=${session.access_token}; path=/; max-age=3600; SameSite=Lax`;
        }

        // Set the user immediately with Supabase data
        setUser(userObject);
      } catch (err: unknown) {
        if (err instanceof Error) {
          console.error('Error checking auth:', err.message);
        } else {
          console.error('Error checking auth:', 'An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    // Initial auth check
    checkAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);

        if (session) {
          // User logged in or token refreshed
          const userData = session.user;

          // Store the refreshed token
          if (session.access_token) {
            localStorage.setItem('authToken', session.access_token);
            console.log('Auth token refreshed in localStorage');

            // Also update the cookie
            document.cookie = `authToken=${session.access_token}; path=/; max-age=3600; SameSite=Lax`;
          }

          // Create a user object from Supabase data
          const userObject: User = {
            id: userData.id,
            email: userData.email || '',
            name: userData.user_metadata?.name || '',
            phone_number: userData.user_metadata?.phone_number || '',
            role: 'user'
          };

          // Set the user immediately with Supabase data
          setUser(userObject);

          // Store the token for future use
          if (session.access_token) {
            localStorage.setItem('authToken', session.access_token);
          }
        } else {
          // User logged out
          setUser(null);
        }
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Logout user
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      // Sign out with Supabase
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Also call backend logout if needed
      try {
        await api.logout();
      } catch (apiErr: unknown) {
        if (apiErr instanceof Error) {
          console.error('Backend logout error (non-critical):', apiErr.message);
        } else {
          console.error('Backend logout error (non-critical):', 'An unknown error occurred');
        }
      }

      // Clear auth token from localStorage
      localStorage.removeItem('authToken');

      // Clear auth token cookie
      document.cookie = 'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';

      setUser(null);
      router.push('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  // Load user data
  const loadUser = useCallback(async () => {
    try {
      setLoading(true);

      // Get current session from Supabase
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      // Get user data from session
      const userData = session.user;

      // Create a user object from Supabase data
      const userObject: User = {
        id: userData.id,
        email: userData.email || '',
        name: userData.user_metadata?.name || '',
        phone_number: userData.user_metadata?.phone_number || '',
        role: 'user'
      };

      // Set the user immediately with Supabase data
      setUser(userObject);

      // Store the token for future use
      if (session.access_token) {
        localStorage.setItem('authToken', session.access_token);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Register user
  const register = async (userData: RegisterData) => {
    setLoading(true);
    setError(null);

    try {
      // Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
            phone_number: userData.phone_number || '',
          }
        }
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Registration failed. No user returned.');
      }

      // Store Supabase token
      if (data.session?.access_token) {
        localStorage.setItem('authToken', data.session.access_token);
      }

      // If backend registration fails, use Supabase user data
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || '',
        phone_number: data.user.user_metadata?.phone_number || '',
        role: 'user'
      });

      return { user: data.user, session: data.session };
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
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
      // Login with Supabase Auth
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Login failed. No user returned.');
      }

      // Login with backend
      try {
        const backendResponse = await api.login(credentials);

        // Store JWT token from backend if available
        if (backendResponse?.access_token) {
          localStorage.setItem('authToken', backendResponse.access_token);
        }

        // Use backend user data if available
        if (backendResponse?.user) {
          setUser(backendResponse.user);
          return backendResponse;
        }
      } catch (backendErr: unknown) {
        if (backendErr instanceof Error) {
          console.error('Backend login error (continuing with Supabase user):', backendErr.message);
        } else {
          console.error('Backend login error (continuing with Supabase user):', 'An unknown error occurred');
        }
      }

      // If backend login fails, use Supabase user data
      setUser({
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || '',
        phone_number: data.user.user_metadata?.phone_number || '',
        role: 'user'
      });

      return { user: data.user, session: data.session };
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData: ProfileData) => {
    setLoading(true);
    setError(null);

    try {
      // Update Supabase user metadata
      const { error: supabaseError } = await supabase.auth.updateUser({
        data: {
          name: userData.name,
          phone_number: userData.phone_number,
          ...userData
        }
      });

      if (supabaseError) throw supabaseError;

      // Update backend profile
      try {
        const updatedProfile = await api.updateProfile(userData);

        // Update local user state with backend data
        setUser(prev => prev ? { ...prev, ...updatedProfile } : null);
        return updatedProfile;
      } catch (backendErr: unknown) {
        if (backendErr instanceof Error) {
          console.error('Backend profile update error:', backendErr.message);
        } else {
          console.error('Backend profile update error:', 'An unknown error occurred');
        }

        // If backend update fails, update local state with provided data
        setUser(prev => prev ? { ...prev, ...userData } : null);
      }

      return userData;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
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
      // Change password with Supabase
      const { error: supabaseError } = await supabase.auth.updateUser({
        password: passwordData.new_password
      });

      if (supabaseError) throw supabaseError;

      // Also update password in backend if needed
      try {
        const response = await api.changePassword(passwordData);
        return response;
      } catch (backendErr: unknown) {
        if (backendErr instanceof Error) {
          console.error('Backend password change error (non-critical):', backendErr.message);
        } else {
          console.error('Backend password change error (non-critical):', 'An unknown error occurred');
        }
      }

      return { message: 'Password changed successfully' };
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    register,
    login,
    logout,
    loadUser,
    updateProfile,
    changePassword,
    setError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
