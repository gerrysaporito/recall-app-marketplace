import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { BotTemplateAppType } from "@/lib/schemas/BotTemplateAppSchema";

export function useFetchBotTemplateApp(botTemplateId: string, appId: string) {
  const router = useRouter();
  const { data: session } = useSession({
    required: true,
    onUnauthenticated() {
      router.push("/auth");
    },
  });

  return useQuery({
    queryKey: ["bot-template-apps", botTemplateId, appId],
    queryFn: async () => {
      const response = await fetch(
        `/api/bot-templates/${botTemplateId}/apps/${appId}`,
        {
          credentials: "include",
          headers: { "Cache-Control": "no-cache" },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          await signOut({ redirect: false });
          router.push("/auth");
          throw new Error("Session expired. Please sign in again.");
        }
        throw new Error("Failed to fetch bot app");
      }

      return response.json() as Promise<{ botTemplateApp: BotTemplateAppType }>;
    },
    enabled: !!session && !!botTemplateId && !!appId,
  });
}
