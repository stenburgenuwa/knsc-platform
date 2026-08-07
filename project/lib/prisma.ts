import { PrismaClient } from '@prisma/client';

// Reuse a single client across hot reloads in dev so we don't exhaust
// Postgres connections; Vercel's serverless functions get a fresh module
// scope per cold start, which this pattern also handles correctly.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
