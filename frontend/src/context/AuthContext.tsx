'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'PATIENT' | 'DOCTOR' | 'HOSPITAL' | 'ADMIN';
  verificationStatus: 'APPROVED' | 'PENDING' | 'REJECTED' | 'NOT_VERIFIED';
  profile?: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ requiresVerification?: boolean; userId?: string } | void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  verifyId: (userId: string, idNumber: string, idDocumentUrl?: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Configure axios defaults
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      setToken(storedToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
  }, []);

  // Load user data on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          const response = await axios.get('/api/auth/me');
          setUser(response.data.user);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('token');
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [token]);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/auth/login', { email, password }, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = response.data;
      
      // Backend returns: { user: {...}, access_token: "...", ... }
      const userData = data.user;
      const newToken = data.access_token;
      
      if (!newToken) {
        throw new Error('No token received from server');
      }
      
      if (!userData) {
        throw new Error('No user data received from server');
      }
      
      setUser(userData);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error: any) {
      // Check if verification is required
      if (error.response?.status === 403 && error.response?.data?.detail?.requires_verification) {
        return {
          requiresVerification: true,
          userId: error.response.data.detail.user_id
        };
      }
      
      const errorMessage = error.response?.data?.detail?.error || 
                          error.response?.data?.detail || 
                          error.response?.data?.message || 
                          'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const verifyId = async (userId: string, idNumber: string, idDocumentUrl?: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post('/api/auth/verify-id', {
        user_id: userId,
        id_number: idNumber,
        id_document_url: idDocumentUrl
      }, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = response.data;
      const userData = data.user || data;
      const newToken = data.access_token || data.token;
      
      if (!newToken) {
        throw new Error('No token received from server');
      }
      
      setUser(userData);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail?.error || 
                          error.response?.data?.detail || 
                          'Verification failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Registering user:', { email: userData.email, phone: userData.phone });
      
      const response = await axios.post('/api/auth/register', userData, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Registration response:', response.status, response.data);
      
      const data = response.data;
      
      // Backend returns: { user: {...}, access_token: "...", refresh_token: "...", ... }
      const newUser = data.user;
      const newToken = data.access_token;
      
      if (!newToken) {
        console.error('No token in response:', data);
        throw new Error('No token received from server');
      }
      
      if (!newUser) {
        console.error('No user in response:', data);
        throw new Error('No user data received from server');
      }
      
      setUser(newUser);
      setToken(newToken);
      localStorage.setItem('token', newToken);
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      return { user: newUser, token: newToken };
    } catch (error: any) {
      console.error('Registration error:', error);
      const errorDetails = {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: error.request
      };
      console.error('Error details:', errorDetails);
      // Log full error for debugging
      if (error.response?.data) {
        console.error('Full error response:', JSON.stringify(error.response.data, null, 2));
      }
      
      let errorMessage = 'Registration failed';
      
      if (error.response) {
        // Backend returned an error response
        const detail = error.response.data?.detail;
        if (typeof detail === 'string') {
          errorMessage = detail;
        } else if (detail?.error) {
          errorMessage = detail.error;
        } else if (error.response.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.status === 400) {
          errorMessage = 'Invalid registration data. Please check your information.';
        } else if (error.response.status === 500) {
          // Handle 500 errors with better detail extraction
          const errorData = error.response.data;
          if (errorData) {
            if (typeof errorData === 'string') {
              errorMessage = errorData;
            } else if (errorData.detail) {
              errorMessage = typeof errorData.detail === 'string' ? errorData.detail : errorData.detail.error || errorData.detail.message || JSON.stringify(errorData.detail);
            } else if (errorData.message) {
              errorMessage = errorData.message;
            } else if (errorData.error) {
              errorMessage = errorData.error;
            } else {
              errorMessage = `Server error: ${JSON.stringify(errorData)}`;
            }
          } else {
            errorMessage = 'Server error occurred. Please check the backend logs.';
          }
        } else {
          errorMessage = `Error ${error.response.status}: ${error.response.data?.detail || error.response.data?.message || JSON.stringify(error.response.data)}`;
        }
      } else if (error.request) {
        // Request was made but no response received
        errorMessage = 'Cannot connect to server. Please make sure the backend is running on http://localhost:8000';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    error,
    verifyId,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
