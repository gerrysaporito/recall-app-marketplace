"use client";

import { DashboardSidebar } from "@/components/ui/custom/dashboard-sidebar";
import {
  RocketIcon,
  WebhookIcon,
  BotIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  ChevronRight,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

interface NavItem {
  label: string;
  icon?: any;
  href?: string;
  path?: string;
  children?: NavItem[];
}

const routes: NavItem[] = [
  {
    label: "Getting Started",
    icon: RocketIcon,
    href: "/dashboard",
    path: "Dashboard",
  },
  {
    label: "Apps",
    icon: WebhookIcon,
    path: "Apps",
    children: [
      {
        label: "My Apps",
        href: "/dashboard/apps",
        path: "My Applications",
      },
      {
        label: "All Apps",
        href: "/dashboard/apps/all",
        path: "All Applications",
      },
    ],
  },
  {
    label: "Bots",
    icon: BotIcon,
    path: "Bots",
    children: [
      {
        label: "My Bots",
        href: "/dashboard/bots",
        path: "My Bots",
      },
    ],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getCurrentPath = (items: NavItem[], currentPath: string): NavItem[] => {
    for (const item of items) {
      if (item.href === currentPath) {
        return [item];
      }
      if (item.children) {
        const childPath = getCurrentPath(item.children, currentPath);
        if (childPath.length) {
          return [item, ...childPath];
        }
      }
    }
    return [];
  };

  const currentPath = getCurrentPath(routes, pathname);

  return (
    <div className="flex min-h-screen">
      <div className="hidden md:block h-full">
        <DashboardSidebar
          routes={routes}
          className="border-r"
          isCollapsed={isCollapsed}
        />
      </div>
      <div className="flex-1">
        <div className="border-b">
          <div className="flex h-16 items-center px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="mr-4"
            >
              {isCollapsed ? (
                <PanelLeftOpenIcon className="h-4 w-4" />
              ) : (
                <PanelLeftCloseIcon className="h-4 w-4" />
              )}
            </Button>
            <Breadcrumb>
              <BreadcrumbList>
                {currentPath.map((item, index) => (
                  <>
                    <BreadcrumbItem key={item.path}>
                      {index === currentPath.length - 1 ? (
                        <BreadcrumbPage>{item.path}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.href || "#"}>
                          {item.path}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {index < currentPath.length - 1 && (
                      <ChevronRight className="h-4 w-4 mx-2" />
                    )}
                  </>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </div>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
