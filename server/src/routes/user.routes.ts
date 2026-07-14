import { Router } from "express";
import * as userRepository from '../repositories/user.repository';
import { authMiddleware, type AuthenticatedRequest } from '../middlewares/auth.middleware';

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

export default router;