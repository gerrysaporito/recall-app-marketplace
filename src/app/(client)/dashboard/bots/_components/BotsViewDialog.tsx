"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BotType } from "@/lib/schemas/BotSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface BotsViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bot: BotType | null;
}

export function BotsViewDialog({
  open,
  onOpenChange,
  bot,
}: BotsViewDialogProps) {
  const { data: session } = useSession();
  if (!bot) return null;

  const isOwner = session?.user?.id === bot.userId;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">{bot.name}</DialogTitle>
          <DialogDescription className="text-muted-foreground mt-2">
            Bot Configuration
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Meeting URL
                </label>
                <p className="text-sm break-all font-mono bg-muted p-2 rounded-md">
                  {bot.meetingUrl}
                </p>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium text-muted-foreground">
                  Created At
                </label>
                <p className="text-sm">
                  {new Date(bot.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {isOwner && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bot Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-muted-foreground">
                    Recall Bot ID
                  </label>
                  <p className="text-sm break-all font-mono bg-muted p-2 rounded-md">
                    {bot.recallBotId}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
