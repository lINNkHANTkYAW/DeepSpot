import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

export function isDatabaseConfigured(): boolean {
  const databaseUrl = process.env.DATABASE_URL?.trim();
  return Boolean(databaseUrl && !databaseUrl.includes('YOUR_') && !databaseUrl.includes('your_'));
}

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
