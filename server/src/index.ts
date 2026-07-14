import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import postRoutes from './routes/post.routes';

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT ?? 3000;

app.get('/', (_, res) => {
  res.status(200).json({ message: 'Hello, World 🗺️!' });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/posts', postRoutes);

app.listen(PORT, () =>
  console.log(`🚀 Server running on http://localhost:${PORT}`),
);
