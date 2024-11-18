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
import { redirect, usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { useSession } from "next-auth/react";

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
    href: "/dashboard/apps",
    path: "Apps",
    children: [
      {
        label: "My Apps",
        href: "/dashboard/apps/me",
        path: "My Apps",
      },
      {
        label: "All Apps",
        href: "/dashboard/apps/all",
        path: "All Apps",
      },
    ],
  },
  {
    label: "Bots",
    icon: BotIcon,
    href: "/dashboard/bots",
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
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace("/auth");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    return null;
  }

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
                  <BreadcrumbItem key={`${item.path}-${index}`}>
                    {index === currentPath.length - 1 ? (
                      <BreadcrumbPage>{item.path}</BreadcrumbPage>
                    ) : (
                      <>
                        <BreadcrumbLink href={item.href || "#"}>
                          {item.path}
                        </BreadcrumbLink>
                        <ChevronRight className="h-4 w-4 mx-2" />
                      </>
                    )}
                  </BreadcrumbItem>
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
