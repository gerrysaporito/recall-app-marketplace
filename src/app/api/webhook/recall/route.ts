import { NextResponse } from "next/server";
import { handleRecallTranscription } from "@/server/routers/webhooks/recall/handleRecallTranscriptionEvent";
import { ServerLogger } from "@/server/services/LoggerService/ServerLogger";
import cuid from "cuid";
import { RecallWebhookEventSchema } from "@/lib/schemas/RecallWebhookEventSchema";

export async function POST(request: Request) {
  const logger = new ServerLogger({
    traceId: cuid(),
    spanId: "recall-webhook",
  });

  let body;

  try {
    body = await request.json();
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
    logger.error({
      message: "Failed to process Recall webhook",
      error: error as Error,
      metadata: {
        origin: request.url,
        body,
      },
    });
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
