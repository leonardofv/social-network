import db from "../database"

export const follow = async (followerId: number, followedId: number): Promise<void> => {
    await db('user_follow')
        .insert({ follower_id: followerId ,followed_id: followedId })
        .onConflict(['follower_id', 'followed_id'])
        .ignore();
};

export const unfollow = async (followerId: number, followedId: number): Promise<void> => {
    await db('user_follow').where({ follower_id: followerId, followed_id: followedId }).del();
};