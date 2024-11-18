import { z } from "zod";

export const BaseEntitySchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullish(),
});

export type BaseEntityType = z.infer<typeof BaseEntitySchema>;
export type BaseEntityInputType = z.input<typeof BaseEntitySchema>;
