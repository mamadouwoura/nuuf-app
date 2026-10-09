import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg({
      connectionString: process.env.DATABASE_URL,
      // Hébergement sans serveur : peu de connexions par instance (sinon la base est vite saturée).
      max: Number(process.env.DB_POOL_MAX) || 10,
      connectionTimeoutMillis: 10_000,
      idleTimeoutMillis: 20_000,
    }),
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
