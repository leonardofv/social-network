import { Response, Router } from "express";
import * as userRepository from '../repositories/user.repository';
import { authMiddleware, type AuthenticatedRequest } from '../middlewares/auth.middleware';
import { upload, uploadErrorHandler } from "../middlewares/upload.middleware";
import path from "path";
import fs from 'fs/promises';
import { isValidUsername } from "../utils/username";

const router = Router();

router.get('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const user = await userRepository.findProfileById(req.userId!);

        if (!user) {
            res.status(404).json({ message: 'User not found 😢❌' });
            return;
        }

        res.status(200).json({ message: 'OK ✅', data: user });
    } catch(error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong 😢❌' });
    }
});

router.put('/me', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const { name, username, bio } = req.body;

        if (!name.trim() || !username.trim()) {
            res.status(400).json({ message: 'Nome e nome de usuário são obrigatórios' });
            return;
        };
        
        if (!isValidUsername(username.trim())) {
            res.status(400).json({ message: 'Nome de usuário deve ter de 3 a 20 caracteres, apenas letras minúsculas, números, "_" e "."' });
            return;
        };

        if (bio && bio.length > 160) {
            res.status(400).json({ message: 'A biografia deve ter no máximo 160 caracteres' });
            return;
        };

        await userRepository.updateProfile(req.userId!, {
            name: name.trim(),
            username: username.trim(),
            bio: bio || null,
        });

        const user = await userRepository.findProfileById(req.userId!);
        res.status(200).json({ message: 'OK', data: user });
    } catch(error) {
        const isUniqueConstraint = !!(error as { constraint?: string }).constraint?.includes('unique');
        
        if (isUniqueConstraint) {
            res.status(400).json({ message: 'Nome de usuário já está em uso' });
            return;
        }
        console.log(error);
        res.status(500).json({ message: 'Algo deu errado' });
    }
});

router.put('/me/picture', authMiddleware, upload.single('picture'), uploadErrorHandler, async (req: AuthenticatedRequest, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'Envie um arquivo de imagem válido' });
            return;
        }
        // busca perfil para saber caminho da foto antiga
        const current = await userRepository.findProfileById(req.userId!);
        
        const profilePicture = `/uploads/${req.file.filename}`;
        await userRepository.updateProfilePicture(req.userId!, profilePicture);

        //apaga arquivo do disco depois que o banco aponta para a nova
        if (current?.profilePicture) {
            const oldPath = path.resolve(__dirname, '../../uploads', path.basename(current.profilePicture));
            await fs.unlink(oldPath).catch(() => {});
        };
        
        res.status(200).json({ message: 'OK ✅', data: { profilePicture }});
    } catch(error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong 😢❌' });
    }
});

router.delete('/me/picture', authMiddleware, async (req: AuthenticatedRequest, res) => {
    try {
        const user = await userRepository.findProfileById(req.userId!);

        if (!user?.profilePicture) {
            res.status(404).json({ message: 'No profile picture 😢❌' });
            return;
        };

        await userRepository.updateProfilePicture(req.userId!, null);
        
        const filePath = path.resolve(__dirname, '../../uploads', path.basename(user.profilePicture));
        await fs.unlink(filePath).catch(() => {});

        res.status(200).json({ message: 'OK ✅', data: { profilePicture: null } });
    } catch(error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong 😢❌' });
    }
});

export default router;