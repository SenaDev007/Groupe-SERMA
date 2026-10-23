import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  prismaUrl?: string;
};

const url = process.env.SERMAHUB_DATABASE_URL;

// Bascule de base (ex. SQLite → PostgreSQL) : recrée le client si l'URL change,
// même si le processus dev n'a pas redémarré.
if (globalForPrisma.prisma && globalForPrisma.prismaUrl !== url) {
  const old = globalForPrisma.prisma;
  globalForPrisma.prisma = undefined;
  void old.$disconnect().catch(() => {});
}
globalForPrisma.prismaUrl = url;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
