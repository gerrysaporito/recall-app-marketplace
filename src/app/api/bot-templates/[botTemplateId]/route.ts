import { getServerSession } from "next-auth";
import { authOptions } from "@/config/nextAuth";
import { NextRequest } from "next/server";
import { DbService } from "@/server/services/DbService";

// Get specific bot
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
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
      return new Response("Not found", { status: 404 });
    }

    return Response.json({ botTemplate });
  } catch (error) {
    console.error("Error getting bot template", error);
    return Response.json({ error: "Failed to get bot" }, { status: 500 });
  }
}

// Update bot
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const botTemplateId = new URL(request.url).pathname.split("/")[3];
    if (!botTemplateId) {
      return new Response("Bot ID is required", { status: 400 });
    }

    const { botTemplate: existingBotTemplate } =
      await DbService.botTemplate.getBotTemplateById({
        botTemplateId,
      });
    if (!existingBotTemplate) {
      return new Response("Not found", { status: 404 });
    }
    if (existingBotTemplate.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    const body = await request.json();

    const { botTemplate } = await DbService.botTemplate.updateBotTemplate({
      botTemplateId,
      botTemplateArgs: body,
    });

    return Response.json({ botTemplate });
  } catch (error) {
    console.error("Error updating bot template", error);
    return Response.json({ error: "Failed to update bot" }, { status: 500 });
  }
}

// Delete bot
export async function DELETE(request: NextRequest) {
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
      return new Response("Not found", { status: 404 });
    }
    if (botTemplate.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    await DbService.botTemplate.updateBotTemplate({
      botTemplateId,
      botTemplateArgs: {
        deletedAt: new Date(),
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting bot template", error);
    return Response.json(
      { error: "Failed to delete bot template" },
      { status: 500 }
    );
  }
}
