import { env } from '@/config/env.mjs';

export const isLocalEnv = ['development', 'local'].includes(
  env.NEXT_PUBLIC_NODE_ENV,
);
