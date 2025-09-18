// src/middleware/auth.ts
import { Context, Next } from 'hono';
import { verifyToken, JwtPayload } from '../utils/jwt';
import { prisma } from '../utils/database';

export const authMiddleware = async (c: Context, next: Next) => {
  try {
    // Get Authorization header
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return c.json({ error: 'Authorization header missing or invalid' }, 401);
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT token
    let payload: JwtPayload;
    try {
      payload = await verifyToken(token);
    } catch (err) {
      return c.json({ error: 'Invalid or expired token' }, 401);
    }

    // Verify user exists in DB
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, username: true },
    });

    if (!user) {
      return c.json({ error: 'User not found' }, 401);
    }

    // Attach user to context
    c.set('user', user);

    // Continue to next middleware/handler
    await next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return c.json({ error: 'Unauthorized' }, 401);
  }
};
