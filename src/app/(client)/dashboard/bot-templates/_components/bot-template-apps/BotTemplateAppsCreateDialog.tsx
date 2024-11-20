"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm, Controller } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AppType } from "@/lib/schemas/AppSchema";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

interface CreateBotTemplateAppForm {
  appId: string;
  fields: Record<string, string>;
}

export function BotTemplateAppsCreateDialog({
  open,
  onOpenChange,
  botTemplateId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  botTemplateId: string;
}) {
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  // Initialize form with empty values
  const { control, handleSubmit, reset, watch, setValue } =
    useForm<CreateBotTemplateAppForm>({
      defaultValues: {
        appId: "",
        fields: {},
      },
    });

  const selectedAppId = watch("appId");

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      reset({
        appId: "",
        fields: {},
      });
    }
  }, [open, reset]);

  // Fetch available apps
  const { data: apps } = useQuery({
    queryKey: ["apps"],
    queryFn: async () => {
      const response = await fetch("/api/apps/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filters: {},
          page: 1,
          itemsPerPage: 100,
        }),
      });
      if (!response.ok) throw new Error("Failed to fetch apps");
      const data = await response.json();
      return data.apps as AppType[];
    },
  });

  // Get selected app details
  const selectedApp = apps?.find((app) => app.id === selectedAppId);

  // Reset form and initialize fields when app selection changes
  useEffect(() => {
    if (selectedAppId && apps) {
      const selectedApp = apps.find((app) => app.id === selectedAppId);
      if (selectedApp) {
        const editableFields = selectedApp.dataFields
          .filter((field) => field.type === "editable")
          .reduce(
            (acc, field) => ({
              ...acc,
              [field.key]: "",
            }),
            {}
          );

        setValue("fields", editableFields);
      }
    }
  }, [selectedAppId, apps, setValue]);

  const createBotApp = useMutation({
    mutationFn: async (data: CreateBotTemplateAppForm) => {
      const response = await fetch(`/api/bot-templates/${botTemplateId}/apps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appId: data.appId,
          botTemplateAppDataFields: Object.entries(data.fields).map(
            ([key, value]) => ({
              key,
              value,
              appDataFieldId: selectedApp?.dataFields.find(
                (field) => field.key === key
              )?.id,
            })
          ),
        }),
      });
      if (!response.ok) throw new Error("Failed to add app to bot");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bot-templates"] });
      queryClient.invalidateQueries({
        queryKey: ["bot-templates", botTemplateId],
      });
      queryClient.invalidateQueries({
        queryKey: ["bot-templates", session?.user?.id],
      });
      onOpenChange(false);
      reset();
      toast.success("App added to bot successfully");
    },
    onError: () => {
      toast.error("Failed to add app to bot");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add App to Bot</DialogTitle>
          <DialogDescription>
            Select an app and configure its fields for this botTemplate.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit((data) => createBotApp.mutate(data))}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select App</Label>
              <Controller
                name="appId"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select an app" />
                    </SelectTrigger>
                    <SelectContent>
                      {apps?.map((app) => (
                        <SelectItem key={app.id} value={app.id}>
                          {app.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {selectedApp &&
              selectedApp.dataFields.filter((field) => {
                return field.type === "editable";
              }).length > 0 && (
                <div className="space-y-4">
                  <h3 className="font-medium">Configure Fields</h3>
                  {selectedApp.dataFields
                    .filter((field) => field.type === "editable")
                    .map((field) => (
                      <div key={field.id} className="space-y-2">
                        <Label>{field.key}</Label>
                        <Controller
                          name={`fields.${field.key}`}
                          control={control}
                          defaultValue=""
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
                  {selectedApp.dataFields.filter(
                    (field) => field.type === "editable"
                  ).length === 0 && (
                    <div className="text-sm text-muted-foreground">
                      Nothing to set up, just add the app and get started!
                    </div>
                  )}
                </div>
              )}

            <Button
              type="submit"
              className="w-full"
              disabled={createBotApp.isPending}
            >
              {createBotApp.isPending ? "Adding..." : "Add App"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
