import { apiData, apiFetch } from '@/services/api';

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

  static remove(postId: number, commentId: number): Promise<void> {
    return apiFetch(`/posts/${postId}/comments/${commentId}`, {
      method: 'DELETE',
      errors: {
        403: 'Você só pode excluir seus próprios comentários.',
        404: 'Esse comentário não existe mais.',
      },
    });
  }
}