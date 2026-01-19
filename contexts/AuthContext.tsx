import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import {
  decodeGoogleToken,
  jwtPayloadToUser,
  storeAuthToken,
  clearAuthToken,
  tryRestoreSession,
  isAuthorizedUser,
} from '../services/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credential: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Try to restore session on mount
  useEffect(() => {
    const restoredUser = tryRestoreSession();
    if (restoredUser) {
      setUser(restoredUser);
    }
    setIsLoading(false);
  }, []);

  const login = useCallback((credential: string): { success: boolean; error?: string } => {
    const payload = decodeGoogleToken(credential);
    if (!payload) {
      return { success: false, error: 'Invalid credentials. Please try again.' };
    }

    // Check if user is authorized
    if (!isAuthorizedUser(payload.email)) {
      return {
        success: false,
        error: `Access denied. ${payload.email} is not authorized to access this dashboard.`
      };
    }

    const newUser = jwtPayloadToUser(payload);
    storeAuthToken(credential, newUser);
    setUser(newUser);
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    clearAuthToken();
    setUser(null);
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to access auth context
 * Must be used within an AuthProvider
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
