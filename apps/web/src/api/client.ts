import { HealthResponseSchema, type HealthResponse } from '@dungeon/shared';

/** Base URL of the API. In dev and in the containers, `/api` is proxied to the Fastify server. */
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? '/api';

export async function fetchHealth(fetchImpl: typeof fetch = fetch): Promise<HealthResponse> {
  const response = await fetchImpl(`${API_BASE_URL}/health`);
  // 503 still carries a valid body (status: degraded); anything else is unexpected.
  if (!response.ok && response.status !== 503) {
    throw new Error(`Unexpected response ${response.status} from /health`);
  }
  return HealthResponseSchema.parse(await response.json());
}
