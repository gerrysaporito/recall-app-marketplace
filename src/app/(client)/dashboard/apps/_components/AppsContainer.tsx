"use client";

import { AppsCreateDialog } from "./AppsCreateDialog";
import { AppsList } from "./AppsList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Filter, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AppsFilterType } from "@/server/services/DbService/AppDbService";

export const AppsContainer: React.FC<{
  filters?: AppsFilterType;
}> = ({ filters: rawFilters }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [filters, setFilters] = useState<AppsFilterType>(rawFilters ?? {});

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="relative flex w-full max-w-sm items-center space-x-2">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search apps..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full h-9"
            />
          </div>
          <SearchFilter
            filters={filters}
            handleFilterChange={handleFilterChange}
            clearFilters={clearFilters}
          />
        </div>

        <Button onClick={() => setIsCreateOpen(true)}>Create App</Button>
      </div>

      <AppsList searchTerm={searchTerm} filters={filters} />
      <AppsCreateDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />
    </div>
  );
};

const SearchFilter: React.FC<{
  filters: any;
  handleFilterChange: (key: string, value: string) => void;
  clearFilters: () => void;
}> = ({ filters, handleFilterChange, clearFilters }) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  return null;
  // <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
  //   <PopoverTrigger asChild>
  //     <Button variant="outline" size="icon">
  //       <Filter className="h-4 w-4" />
  //     </Button>
  //   </PopoverTrigger>
  //   <PopoverContent className="w-80">
  //     <div className="grid gap-4">
  //       <div className="space-y-2">
  //         <h4 className="font-medium leading-none">Filters</h4>
  //         <p className="text-sm text-muted-foreground">
  //           Refine your product and price searchTerm
  //         </p>
  //       </div>
  //       </div>
  //       <Button onClick={clearFilters} variant="outline">
  //         Clear Filters
  //       </Button>
  //     </div>
  //   </PopoverContent>
  // </Popover>
};
