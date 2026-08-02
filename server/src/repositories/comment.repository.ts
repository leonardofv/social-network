import db from "../database";
import type { User } from "./user.repository";

export type Comment = {
    id: number;
    postId: number;
    userId: User['id'];
    content: string;
    commentDate: Date;
}

export type CommentWithAuthor = Comment & {
    authorUsername: string;
    authorName: string;
    authorProfilePicture: string | null;
}

const commentWithAuthor = () => {
    return db.column('post_comment.id', 'post_comment.content', {
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
    .join('user_profile', 'post_comment.user_id', 'user_profile.user_id');
}

export const create = async ({ postId, userId, content }: Omit<Comment, 'id' | 'commentDate'>): Promise<CommentWithAuthor> => {
    const [inserted] = await db
        .insert({ post_id: postId, user_id: userId, content })
        .into('post_comment')
        .returning('id');
    
    return commentWithAuthor().where(`post_comment.id`, inserted.id).first();
}

export const getById = async (id: number): Promise<Comment | null> => {
    const comment = await db('post_comment')
        .column('id', 'content', {
            postId: 'post_id',
            userId: 'user_id',
            commentDate: 'comment_date',
        })
        .select()
        .where({ id })
        .first();

    return comment ?? null;
}

export const remove = async (id: number): Promise<void> => {
    await db('post_comment').where({ id }).del();
}

export const getByPostId = async (postId: number): Promise<CommentWithAuthor[]> => {
    return commentWithAuthor()
        .where({ 'post_comment.post_id': postId })
        .orderBy('post_comment.comment_date', 'asc');
}