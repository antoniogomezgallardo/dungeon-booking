import { createRequire } from 'node:module';
import { buildApp } from './app.js';
import { loadConfig } from './config.js';
import { createPrismaClient, prismaDatabase } from './db.js';

const require = createRequire(import.meta.url);
const { version } = require('../package.json') as { version: string };

async function main() {
  const config = loadConfig();
  const prisma = createPrismaClient();

  const app = await buildApp(
    { db: prismaDatabase(prisma), version, environment: config.APP_ENV },
    { logger: { level: config.LOG_LEVEL } },
  );

  const shutdown = async (signal: string) => {
    app.log.info({ signal }, 'shutting down');
    await app.close();
    await prisma.$disconnect();
    process.exit(0);
  };
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('SIGTERM', () => void shutdown('SIGTERM'));

  await app.listen({ port: config.PORT, host: config.HOST });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
