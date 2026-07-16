import multer from "multer";
import path from "path";
import fs from 'fs';

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