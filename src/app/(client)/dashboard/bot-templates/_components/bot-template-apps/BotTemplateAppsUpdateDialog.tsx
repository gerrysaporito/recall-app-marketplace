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
import { BotTemplateAppType } from "@/lib/schemas/BotTemplateAppSchema";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

interface UpdateBotTemplateAppForm {
  fields: { [key: string]: string };
}

export function BotTemplateAppsUpdateDialog({
  open,
  onOpenChange,
  botTemplateApp,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botTemplateApp: BotTemplateAppType | null;
}) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const { control, handleSubmit, reset } = useForm<UpdateBotTemplateAppForm>();

  useEffect(() => {
    if (botTemplateApp) {
      const fields = botTemplateApp.botTemplateAppDataFields
        .filter((field) => field.type === "editable")
        .reduce(
          (acc, field) => ({
            ...acc,
            [field.key]: field.value ?? "",
          }),
          {}
        );
      reset({ fields });
    }
  }, [botTemplateApp, reset, open]);

  const updateBotApp = useMutation({
    mutationFn: async (data: UpdateBotTemplateAppForm) => {
      const response = await fetch(
        `/api/bot-templates/${botTemplateApp?.botTemplateId}/apps/${botTemplateApp?.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            botTemplateAppDataFields: Object.entries(data.fields).map(
              ([key, value]) => ({
                key,
                value,
                appDataFieldId: botTemplateApp?.botTemplateAppDataFields.find(
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
      queryClient.invalidateQueries({ queryKey: ["bot-templates"] });
      queryClient.invalidateQueries({
        queryKey: ["bot-templates", botTemplateApp?.botTemplateId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bot-templates", session?.user?.id],
      });
      onOpenChange(false);
      toast.success("App configuration updated successfully");
    },
    onError: () => {
      toast.error("Failed to update app configuration");
    },
  });

  if (!botTemplateApp) return null;

  // Filter to only show editable fields
  const editableFields = botTemplateApp.botTemplateAppDataFields.filter(
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
                Nothing to set up, just add the app and get started!
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
