import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, AuthState, LoginFormData, RegisterFormData } from '../types';
import { userAPI } from '../services/userAPI';

interface AuthContextType extends AuthState {
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check localStorage for existing token
        const token = localStorage.getItem('authToken');
        if (token) {
          // In a real app, you'd validate the token with your backend
          const userData = localStorage.getItem('userData');
          if (userData) {
            const user = JSON.parse(userData);
            setAuthState({
              user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    checkAuth();
  }, []);

  const login = async (data: LoginFormData): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await userAPI.loginUser(data);
      
      if (response.success && response.user) {
        // Transform API response to match our User type
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          role: 'jobseeker', // Default role since API might not store it
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Store user data and create a token
        const token = `token-${response.user.id}-${Date.now()}`;
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: response.message || 'Login failed'
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Login failed. Please try again.'
      });
    }
  };

  const register = async (data: RegisterFormData): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await userAPI.registerUser(data);
      
      if (response.success && response.user) {
        // Transform API response to match our User type
        const user: User = {
          id: response.user.id,
          email: response.user.email,
          firstName: response.user.firstName,
          lastName: response.user.lastName,
          role: data.role, // Use role from form data since API might not store it
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Store user data and create a token
        const token = `token-${response.user.id}-${Date.now()}`;
        localStorage.setItem('authToken', token);
        localStorage.setItem('userData', JSON.stringify(user));

        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: response.message || 'Registration failed'
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Registration failed. Please try again.'
      });
    }
  };

  const logout = (): void => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    });
  };

  const value: AuthContextType = {
    ...authState,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.log('useAuth must be used within an AuthProvider');
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
