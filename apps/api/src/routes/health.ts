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
    async (request, reply) => {
      let databaseUp = true;
      try {
        await app.deps.db.ping();
      } catch (err) {
        databaseUp = false;
        // A 503 without a logged cause is undiagnosable from outside the container.
        request.log.warn({ err }, 'health check: database ping failed');
      }
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
