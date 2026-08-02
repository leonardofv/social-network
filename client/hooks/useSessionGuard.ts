import { useCurrentUser } from '@/contexts/UserContext';
import { SessionExpiredError } from '@/services/api';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

/**
 * Devolve um handler que retorna true quando o erro era de sessão expirada —
 * nesse caso token e usuário já foram limpos e o redirect já aconteceu.
 */
export const useSessionGuard = () => {
  const router = useRouter();
  const { logout } = useCurrentUser();

  return useCallback(
    async (error: unknown) => {
      if (!(error instanceof SessionExpiredError)) return false;

      await logout();
      router.replace('/login');
      return true;
    },
    [logout, router],
  );
};