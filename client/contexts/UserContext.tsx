import { UserProfile, UserService } from '@/services/user.service';
import { clearToken, getToken } from '@/utils';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type UserContextValue = {
  user: UserProfile | null;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);

  const refresh = useCallback(async () => {
    setUser(await UserService.getMe());
  }, []);

  // Limpa token e usuário juntos. Quem chama decide para onde navegar.
  const logout = useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  useEffect(() => {
    getToken().then((token) => {
      // token inválido cai no 401 da primeira chamada e o useSessionGuard redireciona
      if (token) refresh().catch(() => {});
    });
  }, [refresh]);

  const value = useMemo(
    () => ({ user, refresh, logout }),
    [user, refresh, logout],
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useCurrentUser = () => {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error('useCurrentUser precisa estar dentro de UserProvider');
  }

  return context;
};