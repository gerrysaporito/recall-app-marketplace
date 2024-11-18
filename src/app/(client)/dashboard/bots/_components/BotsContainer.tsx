"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { BotsList } from "./BotsList";
import { BotsCreateDialog } from "./BotsCreateDialog";
import { BotsFilterType } from "@/server/services/DbService/BotDbService";

export function BotsContainer({ filters }: { filters: BotsFilterType }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="w-1/3">
          <Input
            placeholder="Search bots..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Bot
        </Button>
      </div>

      <BotsList searchTerm={searchTerm} filters={filters} />
      <BotsCreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
}
