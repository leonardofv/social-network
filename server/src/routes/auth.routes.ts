import { Router } from 'express';
import * as userRepository from '../repositories/user.repository';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET ?? '';

const router = Router();

const SALT_ROUNDS = 10;

type DatabaseError = { constraint?: string };

// Register User
router.post('/register', async (req, res) => {
  const { email, password, password2, username, name } = req.body;

  if (!email?.trim() || !username?.trim() || !name?.trim() || !password || !password2) {
    res.status(400).json({ message: 'All fields are required' });
    return;
  }

  if (password !== password2) {
    res.status(400).json({ message: 'Passwords must match' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  try {
    const user = await userRepository.create({
      email,
      password: hashedPassword,
      username,
      name
    });

    const token = jwt.sign({ id: user.id }, JWT_SECRET);

    res.status(201).json({
      message: 'User registered! ✅',
      data: { ...user, password: undefined },
      token,
    });
  } catch (err) {
    const isUniqueConstraint = !!(err as DatabaseError).constraint?.includes(
      'unique',
    );

    if (isUniqueConstraint) {
      res.status(400).json({ message: 'Nome de usuário ou e-mail já cadastrado' });
      return;
    }

    console.error(err);
    res.status(500).json({ message: 'Algo deu errado' });
  }
});

// Login User
router.post('/login', async (req, res) => {
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    res
      .status(400)
      .json({ message: 'email/username and password are required' });
    return;
  }

  try {
    const user = await userRepository.findByEmailOrUsername(emailOrUsername);

    if (!user) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const isCorrectPassword = await bcrypt.compare(password, user.password);

    if (!isCorrectPassword) {
      res.status(400).json({ message: 'Invalid email or password' });
      return;
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET);

    res.status(201).json({
      message: 'Login Successful✅',
      data: { ...user, password: undefined },
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Something went wrong 😢❌' });
  }
});

export default router;
