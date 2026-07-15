import db from '../database';

export type User = {
  id: number;
  email: string;
  password: string;
  username: string;
};

export const create = async ({
  email,
  password,
  username,
  name,
}: Omit<User, 'id'> & { name: string }): Promise<User> => {
  const [user] = await db
    .insert({ email, password, username })
    .into('users')
    .returning(['id', 'email', 'username', 'password']);

  await db.insert({ user_id: user.id, name }).into('user_profile');

  return user;
};

export const findByEmailOrUsername = async (
  emailOrUsername: string,
): Promise<User | null> => {
  const user = await db('users')
    .where({ email: emailOrUsername })
    .orWhere({ username: emailOrUsername })
    .first();

  return user;
};

export type UserProfile = {
  id: number;
  email: string;
  username: string;
  name: string;
  profilePicture: string | null;
  bio: string | null;
};

export const findProfileById = async (
  id: number,
): Promise<UserProfile | null> => {
  const user = await db('users')
    .leftJoin('user_profile', 'users.id', 'user_profile.user_id')
    .column('users.id', 'users.email', 'users.username', {
      name: 'user_profile.name',
      profilePicture: 'user_profile.profile_picture',
      bio: 'user_profile.bio',
    })
    .where('users.id', id)
    .first();

  return user ?? null;
};

