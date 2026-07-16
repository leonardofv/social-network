import { Router } from "express";
import * as userRepository from '../repositories/user.repository';
import { authMiddleware, type AuthenticatedRequest } from '../middlewares/auth.middleware';
import { upload } from "../middlewares/upload.middleware";

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
            res.status(400).json({ message: 'Something went wrong 😢❌' });
            return;
        }
        
        const profilePicture = `/uploads/${req.file.filename}`;
        await userRepository.updateProfilePicture(req.userId!, profilePicture)
        
        res.status(200).json({ message: 'OK ✅', data: { profilePicture }});
    } catch(error) {
        console.log(error);
        res.status(500).json({ message: 'Something went wrong 😢❌' });
    }
});

export default router;