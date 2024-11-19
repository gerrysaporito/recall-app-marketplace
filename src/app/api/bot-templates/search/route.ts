import { getServerSession } from "next-auth";
import { authOptions } from "@/config/nextAuth";
import { NextRequest } from "next/server";
import { DbService } from "@/server/services/DbService";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await request.json();

    // Let the DbService handle the validation
    const { botTemplates, totalCount } =
      await DbService.botTemplate.searchBotTemplates({
        filters: {
          ...body.filters,
        },
        page: body.page,
        itemsPerPage: body.itemsPerPage,
      });

    return Response.json({
      botTemplates,
      totalCount,
      pagination: {
        page: body.page,
        itemsPerPage: body.itemsPerPage,
        totalPages: Math.ceil(totalCount / body.itemsPerPage),
      },
    });
  } catch (error) {
    console.error("Error searching bot templates", error);
    return Response.json(
      { error: "Failed to search bot templates" },
      { status: 500 }
    );
  }
}
