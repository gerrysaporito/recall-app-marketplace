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
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { BotAppType } from "@/lib/schemas/BotAppSchema";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

interface UpdateBotAppForm {
  fields: { [key: string]: string };
}

export function BotAppsUpdateDialog({
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
  const { control, handleSubmit, reset } = useForm<UpdateBotAppForm>();

  // Reset form when dialog closes or botApp changes
  useEffect(() => {
    if (botApp) {
      // Only include editable fields
      const fields = botApp.botAppDataFields
        .filter((field) => field.type === "editable")
        .reduce(
          (acc, field) => ({
            ...acc,
            [field.key]: field.value || "",
          }),
          {}
        );
      reset({ fields });
    }
  }, [botApp, reset]);

  const updateBotApp = useMutation({
    mutationFn: async (data: UpdateBotAppForm) => {
      const response = await fetch(
        `/api/bots/${botApp?.botId}/apps/${botApp?.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            botAppDataFields: Object.entries(data.fields).map(
              ([key, value]) => ({
                key,
                value,
                appDataFieldId: botApp?.botAppDataFields.find(
                  (field) => field.key === key
                )?.appDataFieldId,
              })
            ),
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to update app configuration");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bots"] });
      queryClient.invalidateQueries({ queryKey: ["bots", botApp?.botId] });
      queryClient.invalidateQueries({ queryKey: ["bots", session?.user?.id] });
      onOpenChange(false);
      toast.success("App configuration updated successfully");
    },
    onError: () => {
      toast.error("Failed to update app configuration");
    },
  });

  if (!botApp) return null;

  // Filter to only show editable fields
  const editableFields = botApp.botAppDataFields.filter(
    (field) => field.type === "editable"
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Update App Configuration</DialogTitle>
          <DialogDescription>
            Update the configuration for this app
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => updateBotApp.mutate(data))}>
          <div className="space-y-4">
            {editableFields.length > 0 ? (
              <div className="space-y-4">
                <h3 className="font-medium">Configure Fields</h3>
                {editableFields.map((field) => (
                  <div key={field.id} className="space-y-2">
                    <Label>{field.key}</Label>
                    <Controller
                      name={`fields.${field.key}`}
                      control={control}
                      rules={{ required: true }}
                      render={({ field: formField }) => (
                        <Input
                          {...formField}
                          value={formField.value || ""}
                          placeholder={`Enter value for ${field.key}`}
                        />
                      )}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">
                This app has no editable fields
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={updateBotApp.isPending}
            >
              {updateBotApp.isPending ? "Updating..." : "Update Configuration"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
