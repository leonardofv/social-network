import { getToken } from '@/utils';
import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) throw new Error('EXPO_PUBLIC_API_URL does not exists');

const GENERIC_ERROR = 'Algo deu errado. Tente novamente.';

/** 401 da API: quem chama deve limpar o token e voltar para o login. */
export class SessionExpiredError extends Error {
  constructor() {
    super('Sessão expirada. Faça login novamente.');
    this.name = 'SessionExpiredError';
  }
}

export const mediaUrl = (path: string) => `${API_URL}${path}`;

/** A API responde `{ message, data }` em todas as rotas. */
type Envelope<T> = {
  message: string;
  data: T;
};

type RequestOptions = Omit<RequestInit, 'headers'> & {
  headers?: Record<string, string>;
  errors?: Record<number, string>;
};

export const apiFetch = async <T>(
  path: string,
  { errors = {}, headers, ...init }: RequestOptions = {},
): Promise<T> => {
  const token = await getToken();

  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...headers, Authorization: `Bearer ${token}` },
  });

  const body = await res.json().catch(() => null);

  if (!res.ok) {
    if (res.status === 401) throw new SessionExpiredError();
    throw new Error(errors[res.status] ?? body?.message ?? GENERIC_ERROR);
  }

  return body;
};

export const apiData = async <T>(
  path: string,
  options?: RequestOptions,
): Promise<T> => {
  const body = await apiFetch<Envelope<T>>(path, options);
  return body.data;
};

export const imageFormData = async (
  field: string,
  uri: string,
  fileName: string,
): Promise<FormData> => {
  const formData = new FormData();

  if (Platform.OS === 'web') {
    const blob = await (await fetch(uri)).blob();
    formData.append(field, blob, fileName);
  } else {
    formData.append(field, {
      uri,
      name: fileName,
      type: 'image/jpeg',
    } as unknown as Blob);
  }

  return formData;
};
