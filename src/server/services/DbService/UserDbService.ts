import type { User } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '@/config/prisma';
import { UserSchema } from '@/lib/schemas/UserSchema';
import cuid from 'cuid';

/**
 * Service method arg schemas
 */
export const WriteUserSchema = UserSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const ReadUserSchema = UserSchema;

export const CreateUserSchema = z.object({
  UserId: z.string().optional(),
  UserArgs: WriteUserSchema.partial().extend({ email: z.string().email() }),
});

const UpdateUserSchema = z.object({
  UserId: z.string(),
  UserArgs: WriteUserSchema.partial(),
});

/**
 * Service class business logic
 */
export const UserDbService = {
  _parseDbToSchema: function (args: { model: User }) {
    const { model } = args;
    const result = ReadUserSchema.parse({
      ...model,
    } satisfies z.input<typeof ReadUserSchema>);
    return result;
  },
  createUser: async function (
    args: z.infer<typeof CreateUserSchema>,
  ): Promise<{ user: z.infer<typeof ReadUserSchema> }> {
    const { UserId, UserArgs } = CreateUserSchema.parse(args);
    const User = await prisma.user.create({
      data: {
        ...UserArgs,
        id: UserId ?? `user_${cuid()}`,
      },
      include: {},
    });
    const result = this._parseDbToSchema({ model: User });
    return { user: result };
  },

  updateUser: async function (
    args: z.infer<typeof UpdateUserSchema>,
  ): Promise<{ user: z.infer<typeof ReadUserSchema> }> {
    const { UserId, UserArgs } = UpdateUserSchema.parse(args);
    const User = await prisma.user.update({
      where: { id: UserId },
      data: { ...UserArgs },
      include: {},
    });
    const result = this._parseDbToSchema({ model: User });
    return { user: result };
  },

  getUserById: async function (args: {
    UserId: string;
  }): Promise<{ user: z.infer<typeof ReadUserSchema> | null }> {
    const { UserId } = z.object({ UserId: z.string() }).parse(args);
    const User = await prisma.user.findUnique({
      where: { id: UserId, deletedAt: null },
      include: {},
    });
    if (!User) {
      return { user: null };
    }
    const result = this._parseDbToSchema({ model: User });
    return { user: result };
  },

  getUserByEmail: async function (args: {
    email: string;
  }): Promise<{ user: z.infer<typeof ReadUserSchema> | null }> {
    const { email } = z.object({ email: z.string() }).parse(args);
    const User = await prisma.user.findUnique({
      where: { email: email, deletedAt: null },
      include: {},
    });
    if (!User) {
      return { user: null };
    }
    const result = this._parseDbToSchema({ model: User });
    return { user: result };
  },
};
