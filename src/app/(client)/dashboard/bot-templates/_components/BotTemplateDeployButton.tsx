import { Button } from "@/components/ui/button";
import { BotTemplateType } from "@/lib/schemas/BotTemplateSchema";
import { Loader2, Rocket } from "lucide-react";
import { useState } from "react";
import {
  BotTemplateDeployDialog,
  DeploymentData,
} from "./BotTemplateDeployDialog";

interface BotTemplateDeployButtonProps {
  botTemplate: BotTemplateType;
}

export function BotTemplateDeployButton({
  botTemplate,
}: BotTemplateDeployButtonProps) {
  const [isDeploying, setIsDeploying] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDeploy = async (deployData: DeploymentData) => {
    setIsDeploying(true);
    try {
      const response = await fetch("/api/bots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          botTemplateId: botTemplate.id,
          ...deployData,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to deploy bot");
      }

      const data = await response.json();
      console.log("Deployment response:", data);
    } catch (error) {
      console.error("Failed to deploy bot:", error);
      throw error;
    } finally {
      setIsDeploying(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        size="sm"
        className="flex items-center gap-2"
        disabled={isDeploying}
      >
        {isDeploying ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Rocket className="h-4 w-4" />
        )}
        Deploy Bot
      </Button>

      <BotTemplateDeployDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        botTemplate={botTemplate}
        onDeploy={handleDeploy}
      />
    </>
  );
}