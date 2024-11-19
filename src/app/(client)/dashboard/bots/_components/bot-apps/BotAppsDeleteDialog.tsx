"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BotAppType } from "@/lib/schemas/BotAppSchema";
import { useSession } from "next-auth/react";

export function BotAppsDeleteDialog({
  open,
  onOpenChange,
  botApp,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botApp: BotAppType | null;
}) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const deleteBotApp = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `/api/bots/${botApp?.botId}/apps/${botApp?.id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) throw new Error("Failed to remove app from bot");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      queryClient.invalidateQueries({ queryKey: ["bots", botApp?.botId] });
      queryClient.invalidateQueries({ queryKey: ["bots", session?.user?.id] });
      onOpenChange(false);
      toast.success("App removed from bot successfully");
    },
    onError: () => {
      toast.error("Failed to remove app from bot");
    },
  });

  if (!botApp) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove App from Bot</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this app from the bot? This action
            cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteBotApp.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteBotApp.mutate()}
            disabled={deleteBotApp.isPending}
          >
            {deleteBotApp.isPending ? "Removing..." : "Remove App"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
