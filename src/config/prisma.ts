/**
 * Instantiates a single instance PrismaClient and save it on the global object.
 * @link https://www.prisma.io/docs/support/help-articles/nextjs-prisma-client-dev-practices
 */
import { PrismaClient } from '@prisma/client';
import { env } from '@/config/env.mjs';

if (!global?.prisma) {
  global.prisma = new PrismaClient({
    log:
      env.NEXT_PUBLIC_NODE_ENV === 'development'
        ? ['error', 'warn']
        : ['error'],
  });
}

const prisma = global.prisma;

export { prisma };
