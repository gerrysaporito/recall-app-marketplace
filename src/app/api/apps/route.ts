import { getServerSession } from "next-auth";
import { authOptions } from "@/config/nextAuth";
import { NextRequest } from "next/server";
import { DbService } from "@/server/services/DbService";

// Create new app
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new Response("Unauthorized", { status: 401 });
  }

    const body = await request.json();
    const { app } = await DbService.app.createApp({
      appArgs: {
        ...body,
        userId: session.user.id,
      },
    });

    return Response.json({ app }, { status: 201 });
  } catch (error) {
    console.error("Error creating app", error);
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }
}
