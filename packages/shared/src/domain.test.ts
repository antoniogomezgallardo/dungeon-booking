import { describe, expect, it } from 'vitest';
import { VenueSchema } from './domain.js';

const validVenue = {
  id: '6f1c6d7e-8e3a-4f2b-9c1d-2a3b4c5d6e7f',
  name: 'Mystic Rooms',
  slug: 'mystic-rooms',
  timezone: 'Europe/Madrid',
  ownerId: '0b2e0f4d-1a2b-4c3d-8e9f-0a1b2c3d4e5f',
  createdAt: '2026-10-04T10:00:00.000Z',
};

describe('VenueSchema', () => {
  it('accepts a valid venue', () => {
    expect(VenueSchema.safeParse(validVenue).success).toBe(true);
  });

  it('rejects a slug that is not kebab-case', () => {
    const result = VenueSchema.safeParse({ ...validVenue, slug: 'Mystic Rooms' });
    expect(result.success).toBe(false);
  });
});
