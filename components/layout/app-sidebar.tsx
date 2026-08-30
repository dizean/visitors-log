"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  LogIn,
  Users,
  ClipboardList,
  UserCog,
  Settings,
  DoorOpen,
} from "lucide-react";

import { cn } from "@/lib/utils";

type Profile = {
  full_name: string;
  email: string;
  role: "admin" | "staff";
};

interface AppSidebarProps {
  profile: Profile;
}

const mainNavigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Visitors",
    href: "/visitors",
    icon: Users,
  },
  {
    title: "Visitor Logs",
    href: "/visitors-logs",
    icon: ClipboardList,
  },
];

const adminNavigation = [
  {
    title: "Users",
    href: "/users",
    icon: UserCog,
  },
  {
    title: "Gates",
    href: "/gates",
    icon: DoorOpen,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

export function AppSidebar({ profile }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-background lg:flex lg:flex-col">
      {/* Brand */}
      <div className="flex h-16 items-center border-b px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-semibold"
        >
          <img
            src="/logo.png"
            alt="Visitors Log"
            className="h-8 w-auto object-contain"
          />

          <span>Visitors Log</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-5">
        <nav className="space-y-1">
          {mainNavigation.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-[#0140b2] text-white"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        {profile.role === "admin" && (
          <div className="mt-8">
            <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Administration
            </p>

            <nav className="space-y-1">
              {adminNavigation.map((item) => {
                const Icon = item.icon;

                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-[#0140b2] text-white"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
          </div>
        )}
      </div>

      {/* User */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-medium">
            {profile.full_name.charAt(0).toUpperCase()}
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium">
              {profile.full_name}
            </p>

            <p className="truncate text-xs text-muted-foreground">
              {profile.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}