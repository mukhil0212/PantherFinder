import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';
import jwtDecode from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Set axios default headers
  const setAuthToken = (token) => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  };
  
  // Load user from token
  const loadUser = useCallback(async () => {
    if (!token) return;
    
    try {
      setAuthToken(token);
      
      // Check if token is expired
      const decoded = jwtDecode(token);
      if (decoded.exp * 1000 < Date.now()) {
        logout();
        return;
      }
      
      const res = await axios.get('/api/auth/profile');
      setUser(res.data);
    } catch (err) {
      console.error('Error loading user:', err);
      logout();
    }
  }, [token]);
  
  // Register user
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post('/api/auth/register', userData);
      
      setToken(res.data.access_token);
      setAuthToken(res.data.access_token);
      setUser(res.data.user);
      setLoading(false);
      
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.error ||
        'Registration failed. Please try again.'
      );
      throw err;
    }
  };
  
  // Login user
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.post('/api/auth/login', credentials);
      
      setToken(res.data.access_token);
      setAuthToken(res.data.access_token);
      setUser(res.data.user);
      setLoading(false);
      
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.error ||
        'Login failed. Please check your credentials.'
      );
      throw err;
    }
  };
  
  // Logout user
  const logout = () => {
    setToken(null);
    setUser(null);
    setAuthToken(null);
  };
  
  // Update user profile
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.put(`/api/users/${user.id}`, userData);
      setUser(res.data.user);
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.error ||
        'Failed to update profile. Please try again.'
      );
      throw err;
    }
  };
  
  // Change password
  const changePassword = async (passwordData) => {
    setLoading(true);
    setError(null);
    
    try {
      const res = await axios.put('/api/auth/change-password', passwordData);
      setLoading(false);
      return res.data;
    } catch (err) {
      setLoading(false);
      setError(
        err.response?.data?.error ||
        'Failed to change password. Please try again.'
      );
      throw err;
    }
  };
  
  const value = {
    user,
    token,
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