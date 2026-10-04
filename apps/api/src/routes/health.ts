import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import { HealthResponseSchema } from '@dungeon/shared';

export const healthRoutes: FastifyPluginAsyncZod = async (app) => {
  app.get(
    '/health',
    {
      schema: {
        tags: ['system'],
        summary: 'Liveness and readiness of the API',
        response: {
          200: HealthResponseSchema,
          503: HealthResponseSchema,
        },
      },
    },
    async (_request, reply) => {
      const databaseUp = await app.deps.db.ping();
      const body = {
        status: databaseUp ? ('ok' as const) : ('degraded' as const),
        version: app.deps.version,
        environment: app.deps.environment,
        timestamp: new Date().toISOString(),
        checks: { database: databaseUp ? ('up' as const) : ('down' as const) },
      };
      return reply.code(databaseUp ? 200 : 503).send(body);
    },
  );
};
