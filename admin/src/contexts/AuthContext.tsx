'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { authApi } from '@/lib/api';
import { AuthUser } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, mfaCode?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      const userData = response.data || response; // handle wrapped response
      // Only allow staff roles
      if (!['ADMIN', 'SALES', 'SUPPORT', 'PARTNER'].includes(userData.role)) {
        Cookies.remove('accessToken');
        Cookies.remove('refreshToken');
        setUser(null);
        router.push('/admin/login?error=unauthorized');
        return;
      }
      setUser(userData);
    } catch {
      setUser(null);
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
    }
  }, [router]);

  useEffect(() => {
    const initAuth = async () => {
      const token = Cookies.get('accessToken');
      if (token) {
        await refreshUser();
      }
      setIsLoading(false);
    };
    initAuth();
  }, [refreshUser]);

  const login = async (email: string, password: string, mfaCode?: string) => {
    const response = await authApi.login(email, password, mfaCode);
    const result = response.data || response;

    // Check if MFA is required
    if (result.requiresMfa || result.mfaRequired) {
      const err = new Error('MFA_REQUIRED') as Error & { mfaRequired: boolean };
      err.mfaRequired = true;
      throw err;
    }

    // Backend may not return user if something went wrong
    if (!result.user) {
      throw new Error('Giriş başarısız');
    }

    // Only allow staff roles (ADMIN, SALES, PARTNER)
    if (!['ADMIN', 'SALES', 'SUPPORT', 'PARTNER'].includes(result.user.role)) {
      throw new Error('Bu panele erişim yetkiniz yok');
    }

    // Store tokens
    Cookies.set('accessToken', result.accessToken, { expires: 1 });
    Cookies.set('refreshToken', result.refreshToken, { expires: 7 });

    setUser(result.user);
    router.push('/');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setUser(null);
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
      router.push('/admin/login');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshUser,
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

// Auth guard HOC for protected routes
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/admin/login');
      }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
      return (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          Loading...
        </div>
      );
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}
