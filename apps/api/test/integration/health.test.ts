import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp, type App } from '../../src/app.js';
import { createPrismaClient, prismaDatabase } from '../../src/db.js';

// Integration level: real Fastify app wired to a real PostgreSQL through Prisma.
// Requires DATABASE_URL to point at a migrated database (see docs/runbooks/local-development.md).
describe('GET /health (integration)', () => {
  const prisma = createPrismaClient();
  let app: App;

  beforeAll(async () => {
    app = await buildApp({ db: prismaDatabase(prisma), version: 'it', environment: 'test' });
  });

  afterAll(async () => {
    await app.close();
    await prisma.$disconnect();
  });

  it('reports the database as up', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json().checks.database).toBe('up');
  });
});
