import { env } from "@/config/env.mjs";
import { DbService } from "@/server/services/DbService";
import { NextResponse } from "next/server";
import { APP_URL } from "@/components/lib/routes";

const RECALL_API_URL = "https://us-west-2.recall.ai/api/v1/bot/";
const RECALL_WEBHOOK_URL = `${APP_URL}/api/webhook/recall`;

async function createRecallBot(args: { botName: string; meetingUrl: string }) {
  const { botName, meetingUrl } = args;
  const response = await fetch(RECALL_API_URL, {
    method: "POST",
    headers: {
      Authorization: `${env.RECALL_API_KEY}`,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bot_name: botName,
      meeting_url: meetingUrl,
      transcription_options: {
        provider: "assembly_ai",
      },
      real_time_transcription: {
        destination_url: RECALL_WEBHOOK_URL,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Failed to create Recall bot: ${response.statusText}`);
  }

  return (await response.json()) as {
    id: string;
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // First create the Recall bot
    const recallBot = await createRecallBot({
      botName: body.botName,
      meetingUrl: body.meetingUrl,
    });

    // Then create our bot record
    const { bot } = await DbService.bot.createBot({
      botArgs: {
        botTemplateId: body.botTemplateId,
        name: body.botName,
        meetingUrl: body.meetingUrl,
        recallBotId: recallBot.id,
      },
    });

    return NextResponse.json({ success: true, bot });
  } catch (error) {
    console.error("Failed to create bot:", error);
    return NextResponse.json(
      { error: "Failed to create bot" },
      { status: 500 }
    );
  }
}
