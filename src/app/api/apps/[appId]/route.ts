import { getServerSession } from "next-auth";
import { authOptions } from "@/config/nextAuth";
import { NextRequest } from "next/server";
import { DbService } from "@/server/services/DbService";

// Get specific app
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const appId = new URL(request.url).pathname.split("/").pop();
    if (!appId) {
      return new Response("App ID is required", { status: 400 });
    }
    const { app } = await DbService.app.getAppById({ appId });
    if (!app) {
      return new Response("Not found", { status: 404 });
    }

    return Response.json({ app });
  } catch (error) {
    console.error("Error getting app", error);
    return Response.json({ error: "Failed to get app" }, { status: 500 });
  }
}

// Update app
export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const appId = new URL(request.url).pathname.split("/").pop();
    if (!appId) {
      return new Response("App ID is required", { status: 400 });
    }
    const { app: existingApp } = await DbService.app.getAppById({ appId });
    const { user: appOwner } = await DbService.user.getUserById({
      userId: existingApp?.userId ?? "",
    });
    if (!existingApp) {
      return new Response("Not found", { status: 404 });
    }
    if (appOwner?.email !== session.user?.email) {
      return new Response("Forbidden", { status: 403 });
    }

    const body = await request.json();

    const { app } = await DbService.app.updateApp({
      appId,
      appArgs: { ...body, userId: session.user.id,  userEmail: session.user.email },
    });

    return Response.json({ app });
  } catch (error) {
    console.error("Error updating app", error);
    return Response.json({ error: "Failed to update app" }, { status: 500 });
  }
}

// Delete app
export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    const appId = new URL(request.url).pathname.split("/").pop();
    if (!appId) {
      return new Response("App ID is required", { status: 400 });
    }
    const { app } = await DbService.app.getAppById({
      appId,
    });
    const { user: appOwner } = await DbService.user.getUserById({
      userId: app?.userId ?? "",
    });
    if (!app) {
      return new Response("Not found", { status: 404 });
    }
    if (appOwner?.email !== session.user?.email) {
      return new Response("Forbidden", { status: 403 });
    }

    await DbService.app.updateApp({
      appId,
      appArgs: {
        deletedAt: new Date(),
      },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting app", error);
    return Response.json({ error: "Failed to delete app" }, { status: 500 });
  }
}
