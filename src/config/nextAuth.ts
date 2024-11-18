import type { NextAuthOptions } from 'next-auth';
import GitHubProvider from 'next-auth/providers/github';
import { env } from '@/config/env.mjs';

const NextAuthSecret = env.ENCRYPTION_KEY_SECRET;

export const authOptions: NextAuthOptions = {
  secret: NextAuthSecret,
  providers: [
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
    }),
  ],
  pages: {
    signIn: '/sdk/v1/auth/complete?authStatus=failed',
  },
};
