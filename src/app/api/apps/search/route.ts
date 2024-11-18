import { getServerSession } from "next-auth";
import { authOptions } from "@/config/nextAuth";
import { NextRequest } from "next/server";
import { DbService } from "@/server/services/DbService";
import { z } from "zod";
import { SearchAppsSchema } from "@/server/services/DbService/AppDbService";


export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const searchParams = SearchAppsSchema.parse(body);

    const { apps, totalCount } = await DbService.app.searchApps(searchParams);

    return Response.json({
      apps,
      totalCount,
      pagination: {
        page: searchParams.page,
        itemsPerPage: searchParams.itemsPerPage,
        totalPages: Math.ceil(totalCount / searchParams.itemsPerPage),
      },
    });
  } catch (error) {
    console.error("Error searching apps", error);
    if (error instanceof z.ZodError) {
      return Response.json(
        { error: "Invalid search parameters" },
        { status: 400 }
      );
    }
    return Response.json({ error: "Failed to search apps" }, { status: 500 });
  }
}
