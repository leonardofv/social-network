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

    if (!res.ok) {
      if (res.status === 400) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? 'Dados inválidos.');
      }
      throw new Error('Algo deu errado. Tente novamente.');
    }
    return res.json();
  }

  static async register({
    email,
    name,
    password,
    password2,
    username,
  }: {
    email: string;
    name: string;
    password: string;
    password2: string;
    username?: string;
  }): Promise<RegisterUserPayload> {
    const res = await fetch(`${API_URL}/auth/register`, {
      body: JSON.stringify({
        email,
        name,
        password,
        password2,
        username,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
    });

    if (!res.ok) {
      if (res.status === 400) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.message ?? 'Dados inválidos.');
      }
      throw new Error('Algo deu errado. Tente novamente.');
    }

    return res.json();
  }
}
