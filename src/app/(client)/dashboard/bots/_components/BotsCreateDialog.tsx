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
import { useSession } from "next-auth/react";

interface CreateBotForm {
  name: string;
  meetingUrl: string;
  recallBotId: string;
}

export function BotsCreateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data: session } = useSession();
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<CreateBotForm>();

  const createBot = useMutation({
    mutationFn: async (data: CreateBotForm) => {
      const response = await fetch("/api/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          userId: session?.user?.id,
        }),
      });
      if (!response.ok) throw new Error("Failed to create bot");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      onOpenChange(false);
      reset();
      toast.success("Bot created successfully");
    },
    onError: () => {
      toast.error("Failed to create bot");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Bot</DialogTitle>
          <DialogDescription>
            Configure your bot settings. You can add apps to your bot after
            creation.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => createBot.mutate(data))}>
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
              disabled={createBot.isPending}
            >
              {createBot.isPending ? "Creating..." : "Create Bot"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
