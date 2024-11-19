import { getServerSession } from "next-auth";
import { authOptions } from "@/config/nextAuth";
import { NextRequest } from "next/server";
import { DbService } from "@/server/services/DbService";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const botTemplateId = new URL(request.url).pathname.split("/")[3];
    if (!botTemplateId) {
      return new Response("Bot ID is required", { status: 400 });
    }

    const { botTemplate } = await DbService.botTemplate.getBotTemplateById({
      botTemplateId,
    });
    if (!botTemplate) {
      return new Response("Bot not found", { status: 404 });
    }

    if (botTemplate.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    return Response.json({ botTemplateApps: botTemplate.botTemplateApps });
  } catch (error) {
    console.error("Error getting bot apps", error);
    return Response.json({ error: "Failed to get bot apps" }, { status: 500 });
  }
}
