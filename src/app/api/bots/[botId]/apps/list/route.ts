import { getServerSession } from "next-auth";
import { authOptions } from "@/config/nextAuth";
import { NextRequest } from "next/server";
import { DbService } from "@/server/services/DbService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const botId = new URL(request.url).pathname.split("/")[3];
    if (!botId) {
      return new Response("Bot ID is required", { status: 400 });
    }

    const { bot } = await DbService.bot.getBotById({ botId });
    if (!bot) {
      return new Response("Bot not found", { status: 404 });
    }

    return Response.json({ botApps: bot.botApps });
  } catch (error) {
    console.error("Error getting bot apps", error);
    return Response.json({ error: "Failed to get bot apps" }, { status: 500 });
  }
}
