import { z } from 'zod';

/** Roles a user can have inside Dungeon Booking. */
export const UserRoleSchema = z.enum(['OWNER', 'STAFF', 'CUSTOMER']);
export type UserRole = z.infer<typeof UserRoleSchema>;

/** A venue is an escape room business or board-game café that publishes rooms. */
export const VenueSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be kebab-case'),
  /** IANA time zone, e.g. "Europe/Madrid". All slots are interpreted in this zone. */
  timezone: z.string().min(1),
  ownerId: z.string().uuid(),
  createdAt: z.string().datetime(),
});
export type Venue = z.infer<typeof VenueSchema>;

/** A room (or table) inside a venue that can be booked for a time slot. */
export const RoomSchema = z.object({
  id: z.string().uuid(),
  venueId: z.string().uuid(),
  name: z.string().min(1).max(120),
  capacity: z.number().int().positive(),
  durationMinutes: z.number().int().positive(),
  createdAt: z.string().datetime(),
});
export type Room = z.infer<typeof RoomSchema>;
