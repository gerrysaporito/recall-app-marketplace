import { getServerSession } from "next-auth";
import { authOptions } from "@/config/nextAuth";
import { NextRequest } from "next/server";
import { DbService } from "@/server/services/DbService";

// Update bot app configuration
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const pathParts = new URL(request.url).pathname.split("/");
    const botTemplateId = pathParts[3];
    const botTemplateAppId = pathParts[5];

    if (!botTemplateId || !botTemplateAppId) {
      return new Response("Bot ID and Bot App ID are required", {
        status: 400,
      });
    }

    // Verify bot ownership
    const { botTemplate } = await DbService.botTemplate.getBotTemplateById({
      botTemplateId,
    });
    if (!botTemplate || botTemplate.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    // Verify bot app exists and belongs to this bot
    const existingBotApp = botTemplate.botTemplateApps.find(
      (app) => app.id === botTemplateAppId
    );
    if (!existingBotApp) {
      return new Response("Bot app not found", { status: 404 });
    }

    const body = await request.json();

    // Prepare data fields with defaults from app schema
    const dataFields = existingBotApp.botTemplateAppDataFields.map((field) => ({
      id: field.id,
      value:
        body.botTemplateAppDataFields?.find((f: any) => f.key === field.key)
          ?.value ?? field.value,
    }));

    // Upsert all data fields
    for (const field of dataFields) {
      await DbService.botTemplateAppDataField.updateBotTemplateAppDataField({
        botTemplateAppDataFieldId: field.id,
        botTemplateAppDataFieldArgs: field,
      });
    }

    const { botTemplateApp: updatedBotTemplateApp } =
      await DbService.botTemplateApp.getBotTemplateAppById({
        botTemplateAppId,
      });

    return Response.json({ botTemplateApp: updatedBotTemplateApp });
  } catch (error) {
    console.error("Error updating bot app", error);
    return Response.json(
      { error: "Failed to update bot app" },
      { status: 500 }
    );
  }
}

// Remove app from bot
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const pathParts = new URL(request.url).pathname.split("/");
    const botTemplateId = pathParts[3];
    const botTemplateAppId = pathParts[5];

    if (!botTemplateId || !botTemplateAppId) {
      return new Response("Bot ID and Bot App ID are required", {
        status: 400,
      });
    }

    // Verify bot ownership
    const { botTemplate } = await DbService.botTemplate.getBotTemplateById({
      botTemplateId,
    });
    if (!botTemplate || botTemplate.userId !== session.user.id) {
      return new Response("Forbidden", { status: 403 });
    }

    // Verify bot app exists and belongs to this bot
    const existingBotApp = botTemplate.botTemplateApps.find(
      (app) => app.id === botTemplateAppId
    );
    if (!existingBotApp) {
      return new Response("Bot app not found", { status: 404 });
    }

    // Soft delete the bot app
    await DbService.botTemplateApp.updateBotTemplateApp({
      botTemplateAppId,
      botTemplateAppArgs: {
        deletedAt: new Date(),
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error removing app from bot", error);
    return Response.json({ error: "Failed to remove app" }, { status: 500 });
  }
}
