import { describe, expect, it } from 'vitest';
import { HealthResponseSchema } from '@dungeon/shared';
import { buildApp } from '../app.js';

function appWithDatabase(up: boolean) {
  return buildApp({
    db: { ping: async () => up },
    version: 'test',
    environment: 'test',
  });
}

describe('GET /health', () => {
  it('returns 200 and status ok when the database answers', async () => {
    const app = await appWithDatabase(true);
    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    const body = HealthResponseSchema.parse(response.json());
    expect(body.status).toBe('ok');
    expect(body.checks.database).toBe('up');
  });

  it('returns 503 and status degraded when the database does not answer', async () => {
    const app = await appWithDatabase(false);
    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toMatchObject({ status: 'degraded', checks: { database: 'down' } });
  });

  it('exposes the OpenAPI document', async () => {
    const app = await appWithDatabase(true);
    const response = await app.inject({ method: 'GET', url: '/docs/json' });

    expect(response.statusCode).toBe(200);
    expect(response.json().paths).toHaveProperty('/health');
  });
});
