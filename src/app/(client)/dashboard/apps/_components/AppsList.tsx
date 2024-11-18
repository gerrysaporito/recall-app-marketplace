"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash, Eye } from "lucide-react";
import { useState } from "react";
import { AppsUpdateDialog } from "./AppsUpdateDialog";
import { AppsDeleteDialog } from "./AppsDeleteDialog";
import { AppsFilterType } from "@/server/services/DbService/AppDbService";
import { useFilteredApps } from "../../../../../components/api/useFilteredApps";
import { AppType } from "@/lib/schemas/AppSchema";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { AppsViewDialog } from "./AppsViewDialog";

export function AppsList({
  searchTerm,
  filters,
}: {
  searchTerm: string;
  filters: AppsFilterType;
}) {
  const { data: session } = useSession();
  const [selectedApp, setSelectedApp] = useState<AppType | null>(null);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);

  const { data, isLoading } = useFilteredApps(searchTerm, filters);

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Author</TableHead>
            <TableHead>Created At</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.apps.map((app: AppType) => (
            <TableRow key={app.id}>
              <TableCell>{app.name}</TableCell>
              <TableCell>
                {session?.user?.email === app.userEmail ? (
                  <Badge className="ml-2">me</Badge>
                ) : (
                  <Badge variant="secondary" className="ml-2">
                    {app.userEmail.toLowerCase()}
                  </Badge>
                )}
              </TableCell>
              <TableCell>
                {new Date(app.createdAt).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setSelectedApp(app);
                        setIsViewOpen(true);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </DropdownMenuItem>
                    {session?.user?.email === app.userEmail && (
                      <>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedApp(app);
                            setIsUpdateOpen(true);
                          }}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedApp(app);
                            setIsDeleteOpen(true);
                          }}
                          className="text-red-600"
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AppsViewDialog
        open={isViewOpen}
        onOpenChange={setIsViewOpen}
        app={selectedApp}
      />
      <AppsUpdateDialog
        open={isUpdateOpen}
        onOpenChange={setIsUpdateOpen}
        app={selectedApp}
      />
      <AppsDeleteDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        app={selectedApp}
      />
    </>
  );
}
