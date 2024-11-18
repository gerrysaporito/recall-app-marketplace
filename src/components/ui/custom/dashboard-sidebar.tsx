"use client";

import { cn } from "@/components/lib/utils";
import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { UserCircleIcon, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

interface NavItem {
  label: string;
  icon?: any;
  href?: string;
  path?: string;
  children?: NavItem[];
}

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  routes: NavItem[];
  isCollapsed: boolean;
}

export function DashboardSidebar({
  className,
  routes,
  isCollapsed,
}: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Apps: true,
    Bots: true,
  });

  const toggleSection = (label: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  const NavItemComponent = ({
    item,
    level = 0,
  }: {
    item: NavItem;
    level?: number;
  }) => {
    const isActive = item.href === pathname;

    if (item.children) {
      return (
        <div>
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-between",
              isCollapsed && "px-2",
              level > 0 && "pl-8"
            )}
            onClick={() => !isCollapsed && toggleSection(item.label)}
          >
            <span className="flex items-center">
              {item.icon && (
                <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
              )}
              {!isCollapsed && item.label}
            </span>
            {!isCollapsed && item.children && (
              <ChevronDown
                className={cn(
                  "h-4 w-4 transition-transform",
                  openSections[item.label] && "transform rotate-180"
                )}
              />
            )}
          </Button>
          {!isCollapsed && openSections[item.label] && (
            <div className="mt-1">
              {item.children.map((child) => (
                <NavItemComponent
                  key={child.label}
                  item={child}
                  level={level + 1}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link href={item.href || "#"}>
        <Button
          variant={isActive ? "secondary" : "ghost"}
          className={cn(
            "w-full justify-start",
            isCollapsed && "px-2",
            level > 0 && "pl-8"
          )}
          title={isCollapsed ? item.label : undefined}
        >
          {item.icon && (
            <item.icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
          )}
          {!isCollapsed && item.label}
        </Button>
      </Link>
    );
  };

  return (
    <div
      className={cn(
        "relative pb-12 min-h-screen transition-all duration-300 ease-in-out bg-background",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          {!isCollapsed && (
            <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
              Dashboard
            </h2>
          )}
          <div className="space-y-1">
            {routes.map((route) => (
              <NavItemComponent key={route.label} item={route} />
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className={cn("w-full justify-start", isCollapsed && "px-2")}
            >
              <UserCircleIcon
                className={cn("h-4 w-4", !isCollapsed && "mr-2")}
              />
              {!isCollapsed && session?.user?.email}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onClick={() => signOut()}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
