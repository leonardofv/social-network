import { Response, Router } from 'express';
import * as postRepository from '../repositories/post.repository';
import * as commentRepository from '../repositories/comment.repository';
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

//List all Posts - feed
router.get('/feed', authMiddleware, async (req: AuthenticatedRequest, res) => {
  try {
    const posts = await postRepository.getAll();
    res.status(200).json({ message: 'OK', data: posts });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Algo deu errado' });
  }
});

router.get('/:id', authMiddleware, async (req:AuthenticatedRequest, res) => {
  try {
    const post = await postRepository.getById(Number(req.params.id));

    if (!post) {
      res.status(404).json({ message: 'Post não encontrado' });
      return;
    }
    res.status(200).json({ message: 'Ok', data: post });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Algo deu errado' });
  }
});

router.get('/:id/comments', authMiddleware, async (req:AuthenticatedRequest, res) => {

  const postId = Number(req.params.id);

  if (!Number.isInteger(postId)) {
    res.status(400).json({ message: 'Id de post inválido' });
    return;
  }

  try {
    const comments = await commentRepository.getByPostId(postId);

    res.status(200).json({ message: 'OK', data: comments });
  } catch(error) {
    console.log(error);
    res.status(500).json({ message: 'Algo deu errado' });
  }
});

router.post('/:id/comments', authMiddleware, async (req:AuthenticatedRequest, res) => {

  const postId = Number(req.params.id);

  if (!Number.isInteger(postId)) {
    res.status(400).json({ message: 'Id de post inválido' });
    return;
  }

  const content = typeof req.body.content === 'string' ? req.body.content.trim() : '';

  if (!content) {
    res.status(400).json({ message: 'Comentário não pode ser vazio' });
    return;
  }
  if (content.length > 500) {
    res.status(400).json({ message: 'Comentário não pode ser maior que 500 caracteres' });
    return;
  }

  try {
    const post = await postRepository.getById(postId);

    if (!post) {
      res.status(404).json({ message: 'Post não encontrado' });
      return;
    }

    const comment = await commentRepository.create({
      postId,
      userId: req.userId!,
      content
    });

    res.status(201).json({ message: 'OK', data: comment });
  } catch(error) {
    console.log(error);
    res.status(500).json({ message: 'Algo deu errado' });
  }
});

export default router;
