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
import { BotType } from "@/lib/schemas/BotSchema";

export function BotsDeleteDialog({
  open,
  onOpenChange,
  bot,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bot: BotType | null;
}) {
  const queryClient = useQueryClient();

  const deleteBot = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/bots/${bot?.id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete bot");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      onOpenChange(false);
      toast.success("Bot deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete bot");
    },
  });

  if (!bot) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Bot</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete {bot.name}? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteBot.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteBot.mutate()}
            disabled={deleteBot.isPending}
          >
            {deleteBot.isPending ? "Deleting..." : "Delete Bot"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
