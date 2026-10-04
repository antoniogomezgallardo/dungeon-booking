import { expect, test } from '@playwright/test';
import { HealthResponseSchema } from '@dungeon/shared';

// Smoke = the minimum that proves the deployment is alive. Tagged so release pipelines can run only these.
test.describe('API health', { tag: '@smoke' }, () => {
  test('GET /health answers 200 with a valid contract and the database up', async ({ request }) => {
    const response = await request.get('/health');

    expect(response.status()).toBe(200);
    const body = HealthResponseSchema.parse(await response.json());
    expect(body.status).toBe('ok');
    expect(body.checks.database).toBe('up');
  });

  test('GET /docs/json exposes the OpenAPI document', async ({ request }) => {
    const response = await request.get('/docs/json');

    expect(response.status()).toBe(200);
    const openapi = (await response.json()) as { openapi: string; paths: Record<string, unknown> };
    expect(openapi.openapi).toMatch(/^3\./);
    expect(openapi.paths).toHaveProperty('/health');
  });
});
