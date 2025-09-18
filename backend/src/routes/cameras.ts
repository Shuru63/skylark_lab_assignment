import { Hono } from 'hono';
import { z } from 'zod';
import { prisma } from '../utils/database';
import { validateBody } from '../middleware/validation';

const cameraRoutes = new Hono();

const cameraSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  rtspUrl: z.string().min(1, 'RTSP URL is required'),
  location: z.string().optional(),
});

const updateCameraSchema = z.object({
  name: z.string().min(1).optional(),
  rtspUrl: z.string().min(1).optional(),
  location: z.string().optional(),
  isActive: z.boolean().optional(),
});

// Get all cameras for user
cameraRoutes.get('/', async (c) => {
  const user = c.get('user');
  try {
    const cameras = await prisma.camera.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });
    return c.json(cameras);
  } catch (error) {
    console.error('Error fetching cameras:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get single camera
cameraRoutes.get('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  try {
    const camera = await prisma.camera.findFirst({ where: { id, userId: user.id } });
    if (!camera) return c.json({ error: 'Camera not found' }, 404);
    return c.json(camera);
  } catch (error) {
    console.error('Error fetching camera:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Create camera
cameraRoutes.post('/', validateBody(cameraSchema), async (c) => {
  const user = c.get('user');
  const cameraData = c.get('validatedBody');
  try {
    const camera = await prisma.camera.create({
      data: { ...cameraData, userId: user.id },
    });
    return c.json(camera, 201);
  } catch (error) {
    console.error('Error creating camera:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Update camera
cameraRoutes.put('/:id', validateBody(updateCameraSchema), async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  const cameraData = c.get('validatedBody');
  try {
    const camera = await prisma.camera.findFirst({ where: { id, userId: user.id } });
    if (!camera) return c.json({ error: 'Camera not found' }, 404);
    const updated = await prisma.camera.update({ where: { id }, data: cameraData });
    return c.json(updated);
  } catch (error) {
    console.error('Error updating camera:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Delete camera
cameraRoutes.delete('/:id', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  try {
    const camera = await prisma.camera.findFirst({ where: { id, userId: user.id } });
    if (!camera) return c.json({ error: 'Camera not found' }, 404);
    await prisma.camera.delete({ where: { id } });
    return c.json({ message: 'Camera deleted successfully' });
  } catch (error) {
    console.error('Error deleting camera:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Start/stop endpoints toggle isActive and are placeholders for worker messaging
cameraRoutes.post('/:id/start', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  try {
    const camera = await prisma.camera.findFirst({ where: { id, userId: user.id } });
    if (!camera) return c.json({ error: 'Camera not found' }, 404);
    const updated = await prisma.camera.update({ where: { id }, data: { isActive: true } });
    // TODO: notify worker to start processing
    return c.json(updated);
  } catch (error) {
    console.error('Error starting camera:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

cameraRoutes.post('/:id/stop', async (c) => {
  const user = c.get('user');
  const id = c.req.param('id');
  try {
    const camera = await prisma.camera.findFirst({ where: { id, userId: user.id } });
    if (!camera) return c.json({ error: 'Camera not found' }, 404);
    const updated = await prisma.camera.update({ where: { id }, data: { isActive: false } });
    // TODO: notify worker to stop processing
    return c.json(updated);
  } catch (error) {
    console.error('Error stopping camera:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export { cameraRoutes };
