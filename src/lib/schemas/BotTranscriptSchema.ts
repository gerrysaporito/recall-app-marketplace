import { z } from "zod";
import { BaseEntitySchema } from "./BaseEntitySchema";

export const BotTranscriptSchema = BaseEntitySchema.extend({
  botId: z.string(),
  recordingId: z.string(),
  speakerName: z.string().nullish(),
  speakerId: z.string(),
  word: z.string(),
  startTime: z.number(),
  endTime: z.number(),
  confidence: z.number(),
});

export type BotTranscriptType = z.infer<typeof BotTranscriptSchema>;
export type BotTranscriptInputType = z.input<typeof BotTranscriptSchema>;
