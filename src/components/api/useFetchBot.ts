import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { BotType } from "@/lib/schemas/BotSchema";

export function useFetchBot(botId: string) {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/auth");
    },
  });

  return useQuery({
    queryKey: ["bot", botId],
    queryFn: async () => {
      const response = await fetch(`/api/bots/${botId}`, {
        credentials: "include",
        headers: { "Cache-Control": "no-cache" },
      });

      if (!response.ok) {
        if (response.status === 401) {
          await signOut({ redirect: false });
          router.push("/auth");
          throw new Error("Session expired. Please sign in again.");
        }
        throw new Error("Failed to fetch bot");
      }

      return response.json() as Promise<{ bot: BotType }>;
    },
    enabled: !!session && !!botId,
  });
}
