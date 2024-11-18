"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BotType } from "@/lib/schemas/BotSchema";
import { useEffect } from "react";

interface UpdateBotForm {
  name: string;
  meetingUrl: string;
  recallBotId: string;
}

export function BotsUpdateDialog({
  open,
  onOpenChange,
  bot,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bot: BotType | null;
}) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<UpdateBotForm>();

  useEffect(() => {
    if (bot) {
      reset({
        name: bot.name,
        meetingUrl: bot.meetingUrl,
        recallBotId: bot.recallBotId,
      });
    }
  }, [bot, reset]);

  const updateBot = useMutation({
    mutationFn: async (data: UpdateBotForm) => {
      const response = await fetch(`/api/bots/${bot?.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to update bot");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      onOpenChange(false);
      toast.success("Bot updated successfully");
    },
    onError: () => {
      toast.error("Failed to update bot");
    },
  });

  if (!bot) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update Bot</DialogTitle>
          <DialogDescription>
            Update your bot settings and configuration.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => updateBot.mutate(data))}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name", { required: true })}
                placeholder="My Bot"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="meetingUrl">Meeting URL</Label>
              <Input
                id="meetingUrl"
                {...register("meetingUrl", { required: true })}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recallBotId">Recall Bot ID</Label>
              <Input
                id="recallBotId"
                {...register("recallBotId", { required: true })}
                placeholder="bot_xxxxx"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={updateBot.isPending}
            >
              {updateBot.isPending ? "Updating..." : "Update Bot"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
