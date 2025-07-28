import { useRouter } from 'next/navigation';
import { getCookie, deleteCookie } from '@/lib/utils';

export function useAuth() {
  const router = useRouter();
  
  const logout = () => {
    deleteCookie('auth-token');
    router.push('/login');
  };

  const isAuthenticated = () => {
    return !!getCookie('auth-token');
  };

  return {
    logout,
    isAuthenticated,
    token: getCookie('auth-token'),
  };
}

export { useAuth as useAuthWithToken };