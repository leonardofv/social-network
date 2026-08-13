import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? '';

export type AuthenticatedRequest = Request & { userId?: number };

export const authMiddleware = (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
        res.status(401).json({ message: 'Missing or invalid token' });
        return;
    }

    const token = authHeader.slice('Bearer '.length);

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { id: number };
        req.userId = payload.id;
        next();
    }catch {
        res.status(401).json({ message: 'Missing or invalid token' });
    }
}