import { PrismaClient } from '@prisma/client';
import type { Database } from './app.js';

export function createPrismaClient(): PrismaClient {
  return new PrismaClient();
}

/** Adapts a PrismaClient to the small Database port the app depends on. */
export function prismaDatabase(prisma: PrismaClient): Database {
  return {
    async ping() {
      // Let the error propagate: the caller decides how to report it (and logs the cause).
      await prisma.$queryRaw`SELECT 1`;
    },
  };
}
