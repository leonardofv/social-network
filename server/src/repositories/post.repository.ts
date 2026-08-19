import db from '../database';
import type { User } from './user.repository';

type Post = {
  id: number;
  path: string;
  publishDate: Date;
  userId: User['id'];
  description?: string;
};

type PostWithAuthor = Post & {
  authorUsername: string;
  authorName: string;
  authorProfilePicture: string | null;
  likeCount: number;
  likedByMe: boolean;
}

export const create = async ({
  path,
  userId,
  description,
}: Omit<Post, 'id' | 'publishDate'>): Promise<Post> => {
  const [post] = await db
    .insert({ path, description, user_id: userId })
    .into('post')
    .returning(['id', 'path', 'description', 'publish_date', 'user_id']);

  return {
    id: post.id,
    path: post.path,
    publishDate: post.publish_date,
    userId: post.user_id,
    description: post.description,
  };
};

export const getAll = async (currentUserId: number): Promise<PostWithAuthor[]> => {
  return db
    .column('post.id', 'post.path', 'post.description', {
      publishDate: 'post.publish_date',
      userId: 'post.user_id',
      authorUsername: 'users.username',
      authorName: 'user_profile.name',
      authorProfilePicture: 'user_profile.profile_picture',
      likeCount: db.raw('(select count(*)::int from post_like where post_like.post_id = post.id)'),
      likedByMe: db.raw('exists(select 1 from post_like where post_like.post_id = post.id and post_like.user_id = ?)', [currentUserId]),
    })
    .select()
    .from('post')
    .join('users', 'post.user_id', 'users.id')
    .join('user_profile', 'post.user_id', 'user_profile.user_id')
    .orderBy('post.publish_date', 'desc');
};

export const getById = async (id: number, currentUserId: number): Promise<PostWithAuthor | undefined> => {
  return db
    .column('post.id', 'post.path', 'post.description', {
      publishDate: 'post.publish_date',
      userId: 'post.user_id',
      authorUsername: 'users.username',
      authorName: 'user_profile.name',
      authorProfilePicture: 'user_profile.profile_picture',
      likeCount: db.raw('(select count(*)::int from post_like where post_like.post_id = post.id)'),
      likedByMe: db.raw('exists(select 1 from post_like where post_like.post_id = post.id and post_like.user_id = ?)', [currentUserId]),
    })
    .select()
    .from('post')
    .join('users', 'post.user_id', 'users.id')
    .join('user_profile', 'post.user_id', 'user_profile.user_id')
    .where({ 'post.id': id })
    .first();
};

export const remove = async (id: number) => {
  await db('post').where({ id }).del();
};

export const getByUserId = async (userId: User['id']): Promise<Post[]> => {
  return db
    .column('id', 'path', 'description', {
      publishDate: 'publish_date',
      userId: 'user_id',
    })
    .select()
    .from('post')
    .where({ user_id: userId })
    .orderBy('publish_date', 'desc');
};
