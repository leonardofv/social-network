const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) throw new Error('EXPO_PUBLIC_API_URL does not exists');

type LoginUserPayload = {
  message: string;
  data: {
    id: number;
  };
  token: string;
};

type RegisterUserPayload = {
  message: string;
  data: {
    id: number;
  };
  token: string;
};

export class AuthService {
  static async login(
    emailOrUsername: string,
    password: string,
  ): Promise<LoginUserPayload> {
    const res = await fetch(`${API_URL}/auth/login`, {
      body: JSON.stringify({
        emailOrUsername,
        password,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(
        res.status === 400 ? data.message : 'Algo deu errado. Tente novamente.',
      );
    }

    return data;
  }

  static async register({
    email,
    password,
    password2,
    username,
  }: {
    email: string;
    password: string;
    password2: string;
    username?: string;
  }): Promise<RegisterUserPayload | undefined> {
    const res = await fetch('http://localhost:3000/auth/register', {
      body: JSON.stringify({
        email,
        password,
        password2,
        username,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    const data = await res.json();

    if (res.status === 400) {
      alert(data.message);
      return;
    }

    if (res.status === 500) {
      alert('Something went wrong!');
      return;
    }

    return data;
  }
}
