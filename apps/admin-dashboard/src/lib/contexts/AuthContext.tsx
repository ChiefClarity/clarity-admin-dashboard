'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'CSM' | 'ADMIN' | 'TECH_MANAGER';
  permissions: string[];
  createdAt: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Protected routes configuration
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password', '/test'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const router = useRouter();
  const pathname = usePathname();

  // Route protection
  useEffect(() => {
    if (!authState.isLoading) {
      const isPublicRoute = PUBLIC_ROUTES.includes(pathname);
      
      if (!authState.isAuthenticated && !isPublicRoute) {
        router.push('/login');
      } else if (authState.isAuthenticated && pathname === '/login') {
        router.push('/dashboard');
      }
    }
  }, [authState.isAuthenticated, authState.isLoading, pathname, router]);

  const initializeAuth = async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        
        setAuthState({
          user: data,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        throw new Error('Not authenticated');
      }
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Mock authentication - in production, this would call a real API
      if (email === 'csm@claritypool.com' && password === 'csm123') {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Set mock token
        document.cookie = 'auth-token=mock-token; path=/; max-age=86400';
        
        const mockUser: User = {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'csm@claritypool.com',
          firstName: 'Sarah',
          lastName: 'CSM',
          role: 'CSM',
          permissions: ['bookings:read', 'bookings:write', 'technicians:read'],
          createdAt: new Date().toISOString(),
        };

        setAuthState({
          user: mockUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        router.push('/dashboard');
      } else {
        throw new Error('Invalid email or password');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: message,
      }));
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      // Clear auth cookie
      document.cookie = 'auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC';
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [router]);

  const refreshAuth = useCallback(async () => {
    await initializeAuth();
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
        refreshAuth,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}