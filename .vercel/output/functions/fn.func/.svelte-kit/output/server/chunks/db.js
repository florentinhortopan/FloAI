import { PrismaClient } from "@prisma/client";
import { b as private_env } from "./shared-server.js";
const globalForPrisma = globalThis;
function createPrismaClient() {
  const databaseUrl = private_env.PRISMA_DATABASE_URL || private_env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL or PRISMA_DATABASE_URL must be set");
  }
  return new PrismaClient({
    // Prisma 6: Use datasources override to use Accelerate URL when available
    ...private_env.PRISMA_DATABASE_URL && {
      datasources: {
        db: {
          url: private_env.PRISMA_DATABASE_URL
        }
      }
    },
    log: private_env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"]
  });
}
const prisma = globalForPrisma.prisma || createPrismaClient();
if (private_env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
export {
  prisma as p
};
