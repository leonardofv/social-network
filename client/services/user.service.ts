import { apiData, apiFetch, imageFormData } from '@/services/api';

export type UserProfile = {
  id: number;
  email: string;
  username: string;
  name: string;
  profilePicture: string | null;
  bio: string | null;
};

export type UserProfileInput = {
  name: string;
  username: string;
  bio: string | null;
};

export type UserSummary = {
  id: number;
  username: string;
  name: string;
  profilePicture: string | null;
};

export type PublicProfile = Omit<UserProfile, 'email'> & {
  isFollowing: boolean;
  followersCount: number;
  followingCount: number;
}

export class UserService {
  static getMe(): Promise<UserProfile> {
    return apiData<UserProfile>('/users/me');
  }

  static async uploadProfilePicture(
    uri: string,
  ): Promise<{ profilePicture: string }> {
    return apiData('/users/me/picture', {
      method: 'PUT',
      body: await imageFormData('picture', uri, 'profile.jpg'),
      errors: {
        400: 'Arquivo inválido. Envie uma imagem.',
        413: 'A imagem deve ter no máximo 5MB.',
      },
    });
  }

  static deleteProfilePicture(): Promise<void> {
    return apiFetch('/users/me/picture', { method: 'DELETE' });
  }

  static updateProfile(payload: UserProfileInput): Promise<UserProfile> {
    return apiData<UserProfile>('/users/me', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  }

  static searchUsers(query: string): Promise<UserSummary[]> {
    return apiData<UserSummary[]>(`/users/search?q=${encodeURIComponent(query)}`);
  }

  static getUserById(id: number) {
    return apiData<PublicProfile>(`/users/${id}`);
  }

  static follow(userId: number): Promise<void> {
    return apiFetch(`/users/${userId}/follow`, {
      method: 'POST'
    });
  }

  static unfollow(userId: number): Promise<void> {
    return apiFetch(`/users/${userId}/follow`, {
      method: 'DELETE'
    });
  }
}
