import { NextResponse } from "next/server";
import { z } from "zod";
import { handleRecallTranscription } from "./_routers/handleRecallTranscriptionEvent";
import { ServerLogger } from "@/server/services/LoggerService/ServerLogger";
import cuid from "cuid";

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

export async function POST(request: Request) {
  try {
    const logger = new ServerLogger({
      traceId: cuid(),
      spanId: "handleRecallTranscription",
    });

    const body = await request.json();
    const result = RecallWebhookEventSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json({}, { status: 400 });
    }
    const { event, data } = result.data;

    logger.info({
      message: "Received Recall webhook event",
      metadata: { event, data },
    });

    // Handle the different types of events
    switch (event) {
      case "bot.transcription": {
        await handleRecallTranscription(data, logger);
        break;
      }
      default: {
        return NextResponse.json({}, { status: 200 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to process Recall webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
