import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';
import supabase from '../utils/supabaseClient';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Set up Supabase auth state listener
  useEffect(() => {
    // Get initial session
    const initialSession = supabase.auth.getSession();
    setSession(initialSession);
    setUser(initialSession?.user ?? null);
    setLoading(false);

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
    } catch (err) {
      console.error('Error logging out:', err);
      setError('Failed to log out. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

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
      });
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load user profile.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Register user
  const register = async (userData) => {
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
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      return data;
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (userData) => {
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
      });

      return data;
    } catch (err) {
      setError(err.message || 'Failed to update profile. Please try again.');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const changePassword = async (passwordData) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.new_password
      });

      if (error) throw error;

      return { message: 'Password changed successfully' };
    } catch (err) {
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