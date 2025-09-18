import { Hono } from 'hono';
import { z } from 'zod';
import { prisma } from '../utils/database';
import { validateQuery } from '../middleware/validation';
import { broadcastAlert } from '../utils/websocket';

const alertRoutes = new Hono();

const querySchema = z.object({
  cameraId: z.string().optional(),
  limit: z.string().transform(Number).optional().default('50'),
});

// Get alerts
alertRoutes.get('/', validateQuery(querySchema), async (c) => {
  const user = c.get('user');
  const { cameraId, limit } = c.get('validatedQuery') as { cameraId?: string; limit: number };

  try {
    const where: any = { userId: user.id };
    if (cameraId) where.cameraId = cameraId;

    const alerts = await prisma.alert.findMany({
      where,
      include: {
        camera: { select: { name: true } },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });

    const formatted = alerts.map((alert) => ({
      id: alert.id,
      cameraId: alert.cameraId,
      cameraName: alert.camera?.name ?? null,
      timestamp: alert.timestamp,
      confidence: alert.confidence,
      imageUrl: alert.imageUrl,
    }));

    return c.json(formatted);
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create alert (called by trusted worker)
alertRoutes.post('/', async (c) => {
  try {
    const alertData = await c.req.json();

    // Basic validation
    if (!alertData.cameraId || !alertData.userId || typeof alertData.confidence !== 'number') {
      return c.json({ error: 'Missing required fields' }, 400);
    }

    const alert = await prisma.alert.create({
      data: {
        cameraId: alertData.cameraId,
        userId: alertData.userId,
        confidence: alertData.confidence,
        imageUrl: alertData.imageUrl || null,
        timestamp: alertData.timestamp ? new Date(alertData.timestamp) : undefined,
      },
      include: { camera: { select: { name: true } } },
    });

    const formatted = {
      id: alert.id,
      cameraId: alert.cameraId,
      cameraName: alert.camera?.name ?? null,
      timestamp: alert.timestamp,
      confidence: alert.confidence,
      imageUrl: alert.imageUrl,
    };

    broadcastAlert(alert.userId, formatted);

    return c.json(formatted, 201);
  } catch (error) {
    console.error('Error creating alert:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export { alertRoutes };
