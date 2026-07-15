import { getToken } from '@/utils';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) throw new Error('EXPO_PUBLIC_API_URL does not exists');

export type UserProfile = {
    id: number;
    email: string;
    username?: string;
    name: string | null;
    profilePicture: string | null;
    bio: string | null;
};

type UserProfilePayload = {
    message: string;
    data: UserProfile;
}

export class UserService {
  static async getMe(): Promise<UserProfilePayload> {
    const token = await getToken();

    const res = await fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        res.status === 401 ? 'Sessão expirada. Faça login novamente.' : 'Algo deu errado. Tente novamente.'
      );
    }

    return data;
  }
}
