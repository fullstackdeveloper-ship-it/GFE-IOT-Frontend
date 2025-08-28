import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiService from '../services/apiService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  // Check token validity on app start only
  useEffect(() => {
    const checkAuthStatus = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken && !isAuthenticated) {
        try {
          const response = await apiService.request('/auth/verify', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${storedToken}`
            }
          });
          
          if (response.success) {
            setToken(storedToken);
            setIsAuthenticated(true);
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('authToken');
            setToken(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('authToken');
          setToken(null);
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []); // Only run on mount

  const login = async (password) => {
    try {
      setIsLoading(true);
      const response = await apiService.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password })
      });

      if (response.success) {
        const authToken = response.token;
        localStorage.setItem('authToken', authToken);
        setToken(authToken);
        setIsAuthenticated(true);
        toast.success('🔐 Login successful! Welcome to the system.');
        return { success: true };
      } else {
        toast.error(response.message || 'Login failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Login error:', error);
      // Show the actual error message from the server
      const errorMessage = error.message || 'Login failed. Please try again.';
      
      // Enhanced error messages based on common scenarios
      if (errorMessage.includes('Invalid password') || errorMessage.includes('password')) {
        toast.error('❌ Invalid password. Please try again.');
      } else if (errorMessage.includes('required')) {
        toast.error('⚠️ Password is required.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        toast.error('🌐 Network error. Please check your connection.');
      } else {
        toast.error(`❌ ${errorMessage}`);
      }
      
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setToken(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    toast.info('👋 Logged out successfully. You are now in guest mode.');
    
    // Redirect to overview page
    window.location.href = '/overview';
  };

  const changePassword = async (newPassword) => {
    try {
      setIsLoading(true);
      const response = await apiService.request('/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });

      if (response.success) {
        toast.success('🔒 Password changed successfully! Your new password is now active.');
        return { success: true };
      } else {
        toast.error(response.message || 'Password change failed');
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Password change error:', error);
      
      // Enhanced error messages for password change
      const errorMessage = error.message || 'Password change failed. Please try again.';
      
      if (errorMessage.includes('New password') || errorMessage.includes('6 characters')) {
        toast.error('⚠️ New password must be at least 6 characters long.');
      } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
        toast.error('🌐 Network error. Please check your connection.');
      } else {
        toast.error(`❌ ${errorMessage}`);
      }
      
      return { success: false, message: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    isAuthenticated,
    isLoading,
    login,
    logout,
    changePassword,
    token
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
