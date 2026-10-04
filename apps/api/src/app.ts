import Fastify, { type FastifyServerOptions } from 'fastify';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { healthRoutes } from './routes/health.js';

/** The database port the app depends on. Kept tiny so tests can fake it. */
export interface Database {
  /** Resolves true when the database answers a trivial query. */
  ping(): Promise<boolean>;
}

export interface AppDeps {
  db: Database;
  version: string;
  environment: string;
}

export async function buildApp(deps: AppDeps, options: FastifyServerOptions = {}) {
  const app = Fastify({
    logger: options.logger ?? false,
    ...options,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(swagger, {
    openapi: {
      info: {
        title: 'Dungeon Booking API',
        description: 'Bookings for escape rooms and board-game cafés.',
        version: deps.version,
      },
    },
    transform: jsonSchemaTransform,
  });
  await app.register(swaggerUi, { routePrefix: '/docs' });

  app.decorate('deps', deps);

  await app.register(healthRoutes);

  return app;
}

declare module 'fastify' {
  interface FastifyInstance {
    deps: AppDeps;
  }
}

export type App = Awaited<ReturnType<typeof buildApp>>;
