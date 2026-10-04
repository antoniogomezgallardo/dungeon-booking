import { PrismaClient } from '@prisma/client';
import type { Database } from './app.js';

export function createPrismaClient(): PrismaClient {
  return new PrismaClient();
}

/** Adapts a PrismaClient to the small Database port the app depends on. */
export function prismaDatabase(prisma: PrismaClient): Database {
  return {
    async ping() {
      try {
        await prisma.$queryRaw`SELECT 1`;
        return true;
      } catch {
        return false;
      }
    },
  };
}
