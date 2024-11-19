import type { User } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/config/prisma";
import { UserSchema } from "@/lib/schemas/UserSchema";
import cuid from "cuid";

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
  userId: z.string().optional(),
  userArgs: WriteUserSchema.partial().extend({ email: z.string().email() }),
});

const UpdateUserSchema = z.object({
  userId: z.string(),
  userArgs: WriteUserSchema.partial(),
});

/**
 * Service class business logic
 */
export const UserDbService = {
  include: {} as const,

  _parseModel: function (args: { model: User }) {
    const { model } = args;
    return ReadUserSchema.parse({
      ...model,
    } satisfies z.input<typeof ReadUserSchema>);
  },

  createUser: async function (
    args: z.infer<typeof CreateUserSchema>
  ): Promise<{ user: z.infer<typeof ReadUserSchema> }> {
    const { userId, userArgs } = CreateUserSchema.parse(args);
    const user = await prisma.user.create({
      data: {
        ...userArgs,
        id: userId ?? `user_${cuid()}`,
      },
      include: this.include,
    });
    const result = this._parseModel({ model: user });
    return { user: result };
  },

  updateUser: async function (
    args: z.infer<typeof UpdateUserSchema>
  ): Promise<{ user: z.infer<typeof ReadUserSchema> }> {
    const { userId, userArgs } = UpdateUserSchema.parse(args);
    const User = await prisma.user.update({
      where: { id: userId },
      data: { ...userArgs },
      include: this.include,
    });
    const result = this._parseModel({ model: User });
    return { user: result };
  },

  getUserById: async function (args: {
    userId: string;
  }): Promise<{ user: z.infer<typeof ReadUserSchema> | null }> {
    const { userId } = z.object({ userId: z.string() }).parse(args);
    const User = await prisma.user.findUnique({
      where: { id: userId, deletedAt: null },
      include: this.include,
    });
    if (!User) {
      return { user: null };
    }
    const result = this._parseModel({ model: User });
    return { user: result };
  },

  getUserByEmail: async function (args: {
    email: string;
  }): Promise<{ user: z.infer<typeof ReadUserSchema> | null }> {
    const { email } = z.object({ email: z.string() }).parse(args);
    const User = await prisma.user.findUnique({
      where: { email: email, deletedAt: null },
      include: this.include,
    });
    if (!User) {
      return { user: null };
    }
    const result = this._parseModel({ model: User });
    return { user: result };
  },
};
