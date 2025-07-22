'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { z } from 'zod';
import { errorHandler } from '@/lib/utils/errorHandler';
import { logger } from '@/lib/utils/logger';

// Strict user schema
const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  role: z.enum(['CSM', 'ADMIN', 'TECH_MANAGER']),
  permissions: z.array(z.string()),
  createdAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().optional(),
});

export type User = z.infer<typeof UserSchema>;

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
const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth on mount
  useEffect(() => {
    initializeAuth();
  }, []);

  // Route protection
  useEffect(() => {
    if (!authState.isLoading) {
      const isPublicRoute = PUBLIC_ROUTES.some(route => pathname.startsWith(route));
      
      if (!authState.isAuthenticated && !isPublicRoute) {
        logger.info('Unauthenticated access to protected route', { pathname });
        router.push('/login');
      } else if (authState.isAuthenticated && pathname === '/login') {
        router.push('/');
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
        const validatedUser = UserSchema.parse(data);
        
        setAuthState({
          user: validatedUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });

        logger.info('Auth initialized', { userId: validatedUser.id });
      } else {
        throw new Error('Not authenticated');
      }
    } catch (error) {
      logger.warn('Auth initialization failed', error);
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

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }

      const data = await response.json();
      const validatedUser = UserSchema.parse(data.user);

      setAuthState({
        user: validatedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      logger.info('Login successful', { userId: validatedUser.id });
      router.push('/');
    } catch (error) {
      const appError = errorHandler.handleError(error, 'Login');
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: appError.message,
      }));
      throw error;
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });

      logger.info('Logout successful');
      router.push('/login');
    } catch (error) {
      logger.error('Logout failed', error);
      // Still clear local state even if API call fails
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      router.push('/login');
    }
  }, [router]);

  const refreshAuth = useCallback(async () => {
    await initializeAuth();
  }, []);

  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshAuth,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Permission check hook
export const usePermission = (permission: string) => {
  const { user } = useAuth();
  return user?.permissions.includes(permission) ?? false;
};

// Role check hook
export const useRole = (role: string) => {
  const { user } = useAuth();
  return user?.role === role;
};