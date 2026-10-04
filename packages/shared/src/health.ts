import { z } from 'zod';

/** Contract of `GET /health`. Shared so the web app and the E2E tests use the same shape. */
export const HealthResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  version: z.string(),
  environment: z.string(),
  timestamp: z.string().datetime(),
  checks: z.object({
    database: z.enum(['up', 'down']),
  }),
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;
