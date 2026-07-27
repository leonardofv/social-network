import { SessionExpiredError } from '@/services/api';
import { clearToken } from '@/utils';
import { useRouter } from 'expo-router';
import { useCallback } from 'react';

/**
 * Devolve um handler que retorna true quando o erro era de sessão expirada —
 * nesse caso o token já foi limpo e o redirect para o login já aconteceu.
 */
export const useSessionGuard = () => {
  const router = useRouter();

  return useCallback(
    async (error: unknown) => {
      if (!(error instanceof SessionExpiredError)) return false;

      await clearToken();
      router.replace('/login');
      return true;
    },
    [router],
  );
};
