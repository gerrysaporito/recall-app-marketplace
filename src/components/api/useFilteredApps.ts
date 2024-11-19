import { useQuery } from "@tanstack/react-query";
import {
  AppsFilterType,
  SearchAppsSchema,
  SearchAppsType,
} from "@/server/services/DbService/AppDbService";
import { AppType } from "@/lib/schemas/AppSchema";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export function useFilteredApps(
  searchTerm: string,
  filters: AppsFilterType,
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
    queryKey: ["apps", session?.user?.id],
    queryFn: async () => {
      const body = SearchAppsSchema.parse({
        filters: {
          userId: filters.userId,
          userEmail: filters.userEmail ?? searchTerm,
          name: filters.name ?? searchTerm,
        },
        page,
        itemsPerPage,
      } satisfies SearchAppsType);

      const response = await fetch(`/api/apps/search`, {
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
        throw new Error("Failed to fetch apps");
      }

      return response.json() as Promise<{
        apps: AppType[];
        totalCount: number;
      }>;
    },
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
    enabled: !!session,
  });
}
