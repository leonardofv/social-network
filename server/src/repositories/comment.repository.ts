import db from "../database";
import type { User } from "./user.repository";

type Comment = {
    id: number;
    postId: number;
    userId: User['id'];
    content: string;
    commentDate: Date;
}

type CommentWithAuthor = Comment & {
    authorUsername: string;
    authorName: string;
    authorProfilePicture: string | null;
}

export const create = async ({ postId, userId, content }: Omit<Comment, 'id' | 'commentDate'>): Promise<Comment> => {
    const [comment] = await db
        .insert({ post_id: postId, user_id: userId, content })
        .into('post_comment')
        .returning(['id', 'post_id', 'user_id', 'content', 'comment_date']);
    
    return {
        id: comment.id,
        postId: comment.post_id,
        userId: comment.user_id,
        content: comment.content,
        commentDate: comment.comment_date
    }
}

export const getByPostId = async (postId: number): Promise<CommentWithAuthor[]> => {
    return db
        .column('post_comment.id', 'post_comment.content', {
            postId: 'post_comment.post_id',
            userId: 'post_comment.user_id',
            commentDate: 'post_comment.comment_date',
            authorUsername: 'users.username',
            authorName: 'user_profile.name',
            authorProfilePicture: 'user_profile.profile_picture',
        })
        .select()
        .from('post_comment')
        .join('users', 'post_comment.user_id', 'users.id')
        .join('user_profile', 'post_comment.user_id', 'user_profile.user_id')
        .where({ 'post_comment.post_id': postId })
        .orderBy('post_comment.comment_date', 'asc');
}