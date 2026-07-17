import { getToken } from '@/utils';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) throw new Error('EXPO_PUBLIC_API_URL does not exists');

export type UserProfile = {
  id: number;
  email: string;
  username: string;
  name: string;
  profilePicture: string | null;
  bio: string | null;
};

type UserProfilePayload = {
  message: string;
  data: UserProfile;
};

export class UserService {
  static async getMe(): Promise<UserProfilePayload> {
    const token = await getToken();

    const res = await fetch(`${API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        res.status === 401
          ? 'Sessão expirada. Faça login novamente.'
          : 'Algo deu errado. Tente novamente.',
      );
    }

    return data;
  }

  static async uploadProfilePicture(
    uri: string,
  ): Promise<{ profilePicture: string }> {
    const token = await getToken();

    const formData = new FormData();

    if (Platform.OS === 'web') {
      const blob = await (await fetch(uri)).blob();
      formData.append('picture', blob, 'profile.jpg');
    } else {
      formData.append('picture', {
        uri,
        name: 'profile.jpg',
        type: 'image/jpeg',
      } as unknown as Blob);
    }
    
    const res = await fetch(`${API_URL}/users/me/picture`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        res.status === 401
          ? 'Sessão expirada. Faça login novamente.'
          : 'Algo deu errado. Tente novamente.',
      );
    }

    return data.data;
  }

  static async deleteProfilePicture(): Promise<void> {
    const token = await getToken();

    const res = await fetch(`${API_URL}/users/me/picture`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      throw new Error(
        res.status === 401
          ? 'Sessão expirada. Faça login novamente'
          : 'Algo deu errado. Tente novamente',
      );
    }
  }
}
