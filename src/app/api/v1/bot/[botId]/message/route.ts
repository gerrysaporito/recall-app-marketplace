import { NextRequest } from "next/server";
import { RecallService } from "@/server/services/RecallService";
import { DbService } from "@/server/services/DbService";

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const botId = url.pathname.split("/")[4];
    if (!botId) {
      return new Response("Bot ID is required", { status: 400 });
    }

    const body = await request.json();
    if (!body.message) {
      return new Response("Message is required", { status: 400 });
    }

    const { bot } = await DbService.bot.getBotById({ botId });
    if (!bot) {
      return new Response("Bot not found", { status: 404 });
    }

    const result = await RecallService.sendMessage({
      recallBotId: bot.recallBotId,
      message: body.message,
    });

    return Response.json(result);
  } catch (error) {
    console.error("Error sending message to bot", error);
    return Response.json(
      { error: "Failed to send message to bot" },
      { status: 500 }
    );
  }
}
