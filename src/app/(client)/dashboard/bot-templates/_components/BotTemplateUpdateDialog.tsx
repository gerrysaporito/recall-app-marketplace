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
import { BotTemplateType } from "@/lib/schemas/BotTemplateSchema";
import { useEffect } from "react";

interface UpdateBotTemplateForm {
  name: string;
}

export function BotTemplateUpdateDialog({
  open,
  onOpenChange,
  botTemplate,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botTemplate: BotTemplateType | null;
}) {
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset } = useForm<UpdateBotTemplateForm>();

  useEffect(() => {
    if (botTemplate) {
      reset({
        name: botTemplate.name,
      });
    }
  }, [botTemplate, reset]);

  const updateBot = useMutation({
    mutationFn: async (data: UpdateBotTemplateForm) => {
      const response = await fetch(`/api/bot-templates/${botTemplate?.id}`, {
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

  if (!botTemplate) return null;

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
