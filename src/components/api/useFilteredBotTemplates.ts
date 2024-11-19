import { useQuery } from "@tanstack/react-query";
import {
  BotTemplatesFilterType,
  SearchBotTemplatesSchema,
  SearchBotTemplatesType,
} from "@/server/services/DbService/BotTemplateDbService";
import { BotTemplateType } from "@/lib/schemas/BotTemplateSchema";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export function useFilteredBotTemplates(
  searchTerm: string,
  filters: BotTemplatesFilterType,
  page: number = 1,
  itemsPerPage: number = 10
) {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/auth");
    },
  });

  return useQuery({
    queryKey: ["bot-templates", session?.user?.id],
    queryFn: async () => {
      const body = SearchBotTemplatesSchema.parse({
        filters: {
          userId: filters.userId,
          name: filters.name ?? searchTerm,
        },
        page,
        itemsPerPage,
      } satisfies SearchBotTemplatesType);

      const response = await fetch(`/api/bot-templates/search`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        if (response.status === 401) {
          await signOut({ redirect: false });
          router.push("/auth");
          throw new Error("Session expired. Please sign in again.");
        }
        throw new Error("Failed to fetch bots");
      }

      return response.json() as Promise<{
        botTemplates: BotTemplateType[];
        totalCount: number;
      }>;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
    enabled: !!session,
  });
}
