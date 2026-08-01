import { apiData } from '@/services/api';

export type CommentWithAuthor = {
  id: number;
  postId: number;
  userId: number;
  content: string;
  commentDate: string;
  authorUsername: string;
  authorName: string;
  authorProfilePicture: string | null;
};

export class CommentService {
  static getByPostId(postId: number): Promise<CommentWithAuthor[]> {
    return apiData<CommentWithAuthor[]>(`/posts/${postId}/comments`);
  }

  static create(postId: number, content: string): Promise<CommentWithAuthor> {
    return apiData<CommentWithAuthor>(`/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
      errors: {
        400: 'Comentário inválido.',
        404: 'Esse post não existe mais.',
      },
    });
  }
}