import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { env } from "@/config/env.mjs";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/components/lib/prisma";
import { compare, hash } from "bcryptjs";
import { DbService } from "@/server/services/DbService";

const NextAuthSecret = env.ENCRYPTION_KEY_SECRET;

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: NextAuthSecret,
  providers: [
    GitHubProvider({
      clientId: env.GITHUB_CLIENT_ID,
      clientSecret: env.GITHUB_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        let { user } = await DbService.user.getUserByEmail({
          email: credentials.email,
        });

        if (!user) {
          const hashedPassword = await hash(credentials.password, 12);
          const { user: newUser } = await DbService.user.createUser({
            userArgs: {
              email: credentials.email,
              password: hashedPassword,
            },
          });
          user = newUser;
        }

        if (!user.password) {
          throw new Error(
            "Please log in with the authentication provider you used to create your account"
          );
        }

        const isPasswordValid = await compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error("Invalid credentials");
        }

        return user;
      },
    }),
  ],
  callbacks: {
    session: async ({ session }) => {
      if (session?.user?.email) {
        const { user: dbUser } = await DbService.user.getUserByEmail({
          email: session.user.email,
        });
        if (dbUser) {
          session.user.email = dbUser.email;
          session.user.id = dbUser.id;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth",
  },
};
