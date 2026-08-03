const USERNAME_REGEX = /^[a-z0-9_.]{3,20}$/;

export const isValidUsername = (username: string): boolean => USERNAME_REGEX.test(username);
