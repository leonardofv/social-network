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

export const isFollowing = async (followerId: number, followedId: number): Promise<boolean> => {
    const row = await db('user_follow')
        .where({ follower_id: followerId, followed_id: followedId })
        .first();

    return !!row;
};

export const getFollowCounts = async (userId: number): Promise<{ followersCount: number, followingCount: number }> => {
    const [followers, following] = await Promise.all([
        db('user_follow').where({ followed_id: userId }).count('* as count').first(),
        db('user_follow').where({ follower_id: userId }).count('* as count').first(),
    ]);

    return {
        followersCount: Number(followers?.count ?? 0),
        followingCount: Number(following?.count ?? 0),
    };
};