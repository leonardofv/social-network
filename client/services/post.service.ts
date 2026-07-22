import { getToken } from "@/utils";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_URL) throw new Error('EXPO_PUBLIC_API_URL does not exists');

export type Post = {
    id: number;
    path: string;
    description?: string;
    publishDate: string;
    userId: number;
};

export class PostService {
    static async getMyPosts():Promise<Post[]> {
        const token = await getToken();
        const res = await fetch(`${API_URL}/posts`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!res.ok) {
            throw new Error(
                res.status === 401 ? 'Sessão expirada. Faça login novamente.'
                : 'Algo deu errado'
            );
        }
        const data = await res.json();
        return data.data;
    };
};