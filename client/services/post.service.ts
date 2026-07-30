import { apiData, imageFormData } from '@/services/api';

export type Post = {
  id: number;
  path: string;
  description?: string;
  publishDate: string;
  userId: number;
};

export type PostWithAuthor = Post & {
  authorUsername: string;
  authorName: string;
  authorProfilePicture: string;
}

export class PostService {
  static getMyPosts(): Promise<Post[]> {
    return apiData<Post[]>('/posts');
  }

  static getById(id: number): Promise<Post> {
    return apiData<Post>(`/posts/${id}`);
  }

  static async createPost(uri: string, description?: string): Promise<Post> {
    const formData = await imageFormData('image', uri, 'post.jpg');
    if (description) formData.append('description', description);

    return apiData<Post>('/posts', {
      method: 'POST',
      body: formData,
      errors: {
        400: 'Envie uma imagem válida.',
        413: 'A imagem deve ter no máximo 5MB.',
      },
    });
  }

  static getFeed(): Promise<PostWithAuthor[]> {
    return apiData<PostWithAuthor[]>('/posts/feed');
  }
}
