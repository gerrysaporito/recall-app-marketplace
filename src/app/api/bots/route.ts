import { DbService } from "@/server/services/DbService";
import { NextResponse } from "next/server";
import { RecallService } from "@/server/services/RecallService";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // First create the Recall bot
    const recallBot = await RecallService.createBot({
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
