/**
 * Instantiates a single instance PrismaClient and save it on the global object.
 * @link https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
 */
import { PrismaClient } from '@prisma/client';

if (!global?.prisma) {
  global.prisma = new PrismaClient({
    log: ['error', 'warn'],
  });
}

const prisma = global.prisma;

export { prisma };
