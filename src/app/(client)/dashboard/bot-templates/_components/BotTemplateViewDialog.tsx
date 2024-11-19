"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { BotTemplateType } from "@/lib/schemas/BotTemplateSchema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";

interface BotTemplateViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botTemplate: BotTemplateType | null;
}

export function BotTemplateViewDialog({
  open,
  onOpenChange,
  botTemplate,
}: BotTemplateViewDialogProps) {
  if (!botTemplate) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {botTemplate.name}
          </DialogTitle>
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
                  Created At
                </label>
                <p className="text-sm">
                  {new Date(botTemplate.createdAt).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
