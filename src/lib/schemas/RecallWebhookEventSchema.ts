import { z } from "zod";

export const RecallWebhookEventSchema = z.object({
  event: z.string(),
  data: z.object({
    bot_id: z.string(),
    recording_id: z.string(),
    transcript: z.object({
      original_transcript_id: z.number(),
      speaker: z.string().nullish(),
      speaker_id: z.number(),
      words: z.array(
        z.object({
          text: z.string(),
          start_time: z.number(),
          end_time: z.number(),
          confidence: z.number(),
        })
      ),
      is_final: z.boolean(),
      language: z.string().nullable(),
      source: z.string(),
    }),
  }),
});

export type RecallWebhookEventType = z.infer<typeof RecallWebhookEventSchema>;
export type RecallWebhookEventInputType = z.input<
  typeof RecallWebhookEventSchema
>;
