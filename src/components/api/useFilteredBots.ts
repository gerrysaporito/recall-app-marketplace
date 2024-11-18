import { useQuery } from "@tanstack/react-query";
import {
  BotsFilterType,
  SearchBotsSchema,
  SearchBotsType,
} from "@/server/services/DbService/BotDbService";
import { BotType } from "@/lib/schemas/BotSchema";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export function useFilteredBots(
  searchTerm: string,
  filters: BotsFilterType,
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
    queryKey: [
      "bots",
      searchTerm,
      JSON.stringify(filters),
      page,
      itemsPerPage,
      session?.user?.id,
    ],
    queryFn: async () => {
      const body = SearchBotsSchema.parse({
        filters: {
          userId: filters.userId,
          name: filters.name ?? searchTerm,
        },
        page,
        itemsPerPage,
      } satisfies SearchBotsType);

      const response = await fetch(`/api/bots/search`, {
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
        bots: BotType[];
        totalCount: number;
      }>;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
    enabled: !!session,
  });
}
