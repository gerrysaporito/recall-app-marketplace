import { z } from "zod";

// Schema for the template that defines what fields are available
export const TriggerEventTemplateSchema = z.object({
  actionName: z.string(),
  botTemplateAppId: z.string(),
  botId: z.string(),
  recordingId: z.string(),
  speakerName: z.string().nullable(),
  speakerId: z.string(),
  recallBotId: z.string(),
  missingData: z.record(z.string(), z.string()),
});

// Schema for a matched/activated trigger event
export const MatchedTriggerEventSchema = TriggerEventTemplateSchema.extend({
  confidence: z.number(),
  matchedText: z.string(),
});

export type TriggerEventTemplateType = z.infer<
  typeof TriggerEventTemplateSchema
>;
export type MatchedTriggerEventType = z.infer<typeof MatchedTriggerEventSchema>;
