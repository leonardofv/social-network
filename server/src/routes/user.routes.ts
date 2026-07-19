import { Router } from "express";
import * as userRepository from '../repositories/user.repository';
import { authMiddleware, type AuthenticatedRequest } from '../middlewares/auth.middleware';
import { upload } from "../middlewares/upload.middleware";
import path from "path";
import fs from 'fs/promises';

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

router.put('/me/picture', authMiddleware, upload.single('picture'), async (req: AuthenticatedRequest, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ message: 'Something went wronggg 😢❌' });
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