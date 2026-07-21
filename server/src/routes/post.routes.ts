import { Router } from 'express';
import * as postRepository from '../repositories/post.repository';
import { authMiddleware, type AuthenticatedRequest } from '../middlewares/auth.middleware';

const router = Router();

// Create a new Post
router.post('/', authMiddleware, async (req: AuthenticatedRequest, res) => {
  const { path, description } = req.body;

  if (!path) {
    res.status(401).json({ message: 'caminho da imagem obrigatório' });
    return;
  }

  try {
    const post = await postRepository.create({
      path,
      description,
      userId: req.userId!,
    });
    
    res.status(201).json({ message: 'Post criado com sucesso', data: post });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Algo deu errado' });
  }
});

// List all Posts
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
