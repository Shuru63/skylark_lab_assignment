// src/routes/auth.ts
import { Hono } from 'hono';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../utils/database';
import { validateBody } from '../middleware/validation';
import { generateToken, verifyToken } from '../utils/jwt';
import { authMiddleware } from '../middleware/auth';

const authRoutes = new Hono();

// -------------------- Schemas --------------------
const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

// -------------------- Login --------------------
authRoutes.post('/login', validateBody(loginSchema), async (c) => {
  try {
    const validated = c.get('validatedBody') as { username: string; password: string };
    if (!validated) return c.json({ error: 'Invalid request body' }, 400);

    const { username, password } = validated;

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return c.json({ error: 'Invalid credentials' }, 401);

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return c.json({ error: 'Invalid credentials' }, 401);

    // ✅ Await token generation
    const token = await generateToken({ userId: user.id, username: user.username });

    return c.json({
      user: { id: user.id, username: user.username },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// -------------------- Register --------------------
authRoutes.post('/register', validateBody(registerSchema), async (c) => {
  try {
    const validated = c.get('validatedBody') as { username: string; password: string };
    if (!validated) return c.json({ error: 'Invalid request body' }, 400);

    const { username, password } = validated;

    const existing = await prisma.user.findUnique({ where: { username } });
    if (existing) return c.json({ error: 'Username already exists' }, 409);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, password: hashedPassword },
    });

    // ✅ Await token generation
    const token = await generateToken({ userId: user.id, username: user.username });

    return c.json({ user: { id: user.id, username: user.username }, token }, 201);
  } catch (error) {
    console.error('Registration error:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// -------------------- Get Current User --------------------
authRoutes.get('/me', authMiddleware, async (c) => {
  const user = c.get('user');
  return c.json(user || null);
});

export { authRoutes };

