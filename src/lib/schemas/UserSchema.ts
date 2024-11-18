import { z } from "zod";

import { BaseEntitySchema } from "./BaseEntitySchema";

export const UserSchema = BaseEntitySchema.extend({
  email: z.string().email().toLowerCase().nullish(),
  password: z.string().nullish(),
});

export type UserType = z.infer<typeof UserSchema>;
export type UserInputType = z.input<typeof UserSchema>;
