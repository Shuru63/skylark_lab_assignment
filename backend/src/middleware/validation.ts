// src/middleware/validation.ts
import { Context, Next } from 'hono';
import { ZodSchema } from 'zod';

// Validate request body
export const validateBody = (schema: ZodSchema<any>) => async (c: Context, next: Next) => {
  try {
    const json = await c.req.json();
    const validated = schema.parse(json);
    c.set('validatedBody', validated); // important!
    await next();
  } catch (err: any) {
    return c.json({ error: 'Invalid request body', details: err.errors || err.message }, 400);
  }
};

// Validate query params
export const validateQuery = (schema: ZodSchema<any>) => {
  return async (c: Context, next: Next) => {
    try {
      const url = new URL(c.req.url);
      const params: Record<string, string> = {};
      url.searchParams.forEach((v, k) => (params[k] = v));
      const parsed = schema.parse(params);
      c.set('validatedQuery', parsed);
      await next();
    } catch (error: any) {
      if (error?.issues) {
        return c.json({ error: 'Query validation failed', issues: error.issues }, 400);
      }
      return c.json({ error: 'Invalid query' }, 400);
    }
  };
};
