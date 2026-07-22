import { getToken } from '@/utils';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) throw new Error('EXPO_PUBLIC_API_URL does not exists');

export type Post = {
  id: number;
  path: string;
  description?: string;
  publishDate: string;
  userId: number;
};

export class PostService {
  static async getMyPosts(): Promise<Post[]> {
    const token = await getToken();
    const res = await fetch(`${API_URL}/posts`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      throw new Error(
        res.status === 401
          ? 'Sessão expirada. Faça login novamente.'
          : 'Algo deu errado',
      );
    }
    const data = await res.json();
    return data.data;
  }
  static async createPost(uri: string, description?: string): Promise<Post> {
    const token = await getToken();

    const formData = new FormData();

    if (Platform.OS === 'web') {
      const blob = await (await fetch(uri)).blob();
      formData.append('image', blob, 'post.jpg');
    } else {
      formData.append('image', {
        uri,
        name: 'post.jpg',
        type: 'image/jpeg',
      } as unknown as Blob);
    }
    if (description) formData.append('description', description);

    const res = await fetch(`${API_URL}/posts`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    if (!res.ok) {
      if (res.status === 401)
        throw new Error('Sessão expirada. Faça login novamente.');
      if (res.status === 413)
        throw new Error('A imagem deve ter no máximo 5MB.');
      if (res.status === 400) throw new Error('Envie uma imagem válida.');
      throw new Error('Algo deu errado. Tente novamente.');
    }

    const data = await res.json();
    return data.data;
  }
}
