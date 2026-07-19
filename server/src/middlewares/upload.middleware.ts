import multer from "multer";
import path from "path";
import fs from 'fs';
import { NextFunction, Request, Response } from "express";

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, UPLOADS_DIR),
    filename: (_req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${Date.now()}-${Math.round(Math.random() *  1e9)}${ext}`);
    } 
});

export const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, //5MB
    fileFilter: (_req, file, cb) => {
        cb(null, file.mimetype.startsWith('image/'));
    }
});
// cria a pasta server/uploads/ e gera um nome único para cada arquivo (para um usuário não sobrescrever o do outro)

export const uploadErrorHandler = (
    error: unknown,
    _req: Request,
    res: Response,
    next: NextFunction
) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            res.status(413).json({ message: 'A imagem deve ter no máximo 5 MB' });
            return;
        }
        res.status(400).json({ message: 'Upload inválido' });
        return;
    }
    next(error);
}
