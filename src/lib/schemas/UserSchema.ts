import { z } from "zod";

import { BaseEntitySchema } from "./BaseEntitySchema";

export const UserSchema = BaseEntitySchema.extend({
  email: z.string().email().toLowerCase().nullish(),
  password: z.string().nullish(),
});
