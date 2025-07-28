export { useAuth } from '@/lib/contexts/AuthContext';

// Extended useAuth hook that provides token access
import { useAuth as useAuthContext } from '@/lib/contexts/AuthContext';

export function useAuthWithToken() {
  const auth = useAuthContext();
  
  // In a real implementation, the token would be stored in the auth context
  // For now, we'll check localStorage (this should be managed by the auth context)
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  };

  return {
    ...auth,
    token: getToken(),
  };
}