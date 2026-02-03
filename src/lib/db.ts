import { PrismaClient } from '@prisma/client';
import { env } from '$env/dynamic/private';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

// Use Prisma Accelerate URL if available for better performance and connection pooling
// Otherwise fall back to direct DATABASE_URL connection
const databaseUrl = env.PRISMA_DATABASE_URL || env.DATABASE_URL;

if (!databaseUrl) {
	throw new Error('DATABASE_URL or PRISMA_DATABASE_URL must be set');
}

export const prisma =
	globalForPrisma.prisma ||
	new PrismaClient({
		// Prisma 6: Use datasources override to use Accelerate URL when available
		...(env.PRISMA_DATABASE_URL && {
			datasources: {
				db: {
					url: env.PRISMA_DATABASE_URL
				}
			}
		}),
		log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
	});

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
