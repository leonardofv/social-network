import { Response, Router } from 'express';
import * as postRepository from '../repositories/post.repository';
import { authMiddleware, type AuthenticatedRequest } from '../middlewares/auth.middleware';
import { upload, uploadErrorHandler } from '../middlewares/upload.middleware';

const router = Router();

// Create a new Post
router.post('/', authMiddleware, upload.single('image'), uploadErrorHandler, async (req: AuthenticatedRequest, res: Response) => {
  const { description } = req.body;

  if (!req.file) {
    res.status(400).json({ message: 'Envie uma imagem válida' });
    return;
  };

  try {
    const post = await postRepository.create({
      path: `/uploads/${req.file.filename}`,
      description,
      userId: req.userId!,
    });

    res.status(201).json({ message: 'Post criado com sucesso', data: post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Algo deu errado' });
  }
});

// List all Posts to User
router.get('/', authMiddleware, async (req:AuthenticatedRequest, res) => {
  try {
    const posts = await postRepository.getByUserId(req.userId!);
    res.status(200).json({ message: 'OK', data: posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Algo deu errado' });
  }
});

export default router;
