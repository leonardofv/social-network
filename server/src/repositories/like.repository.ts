import db from "../database";

export const add  = async (postId: number, userId: number): Promise<void> => {
    await db('post_like')
        .insert({ post_id: postId, user_id: userId })
        .onConflict(['post_id', 'user_id'])
        .ignore();
};

export const remove = async (postId: number, userId: number): Promise<void> => {
    await db('post_like').where({ post_id: postId, user_id: userId }).del();
};