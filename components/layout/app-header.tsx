"use client";

import { useState } from "react";
import { Menu, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

type Profile = {
  full_name: string;
  email: string;
  role: "admin" | "staff";
};

interface AppHeaderProps {
  profile: Profile;
}

export function AppHeader({ profile }: AppHeaderProps) {
  const router = useRouter();
  const supabase = createClient();

  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();

    router.push("/login");
    router.refresh();
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted lg:hidden"
            aria-label="Open navigation"
          >
            <Menu className="size-5" />
          </button>

          <div className="lg:hidden">
            <p className="font-semibold">Visitors Log</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium">
              {profile.full_name}
            </p>

            <p className="text-xs capitalize text-muted-foreground">
              {profile.role}
            </p>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex size-9 items-center justify-center rounded-md hover:bg-muted"
            aria-label="Sign out"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-label="Close navigation"
          />

          <aside className="relative flex h-full w-72 flex-col bg-background shadow-xl">
            <div className="flex h-16 items-center border-b px-6">
              <span className="font-semibold">Visitors Log</span>
            </div>

            <nav className="flex-1 space-y-1 p-4">
              <MobileLink
                href="/dashboard"
                label="Dashboard"
                onClick={() => setMobileOpen(false)}
              />

              <MobileLink
                href="/visitors"
                label="Visitors"
                onClick={() => setMobileOpen(false)}
              />
  
              <MobileLink
                href="/visitors-logs"
                label="Visitor Logs"
                onClick={() => setMobileOpen(false)}
              />

              {profile.role === "admin" && (
                <>
                  <div className="my-5 border-t" />

                  <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Administration
                  </p>

                  <MobileLink
                    href="/users"
                    label="Users"
                    onClick={() => setMobileOpen(false)}
                  />

                  <MobileLink
                    href="/gates"
                    label="Gates"
                    onClick={() => setMobileOpen(false)}
                  />

                  <MobileLink
                    href="/settings"
                    label="Settings"
                    onClick={() => setMobileOpen(false)}
                  />
                </>
              )}
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}

function MobileLink({
  href,
  label,
  onClick,
}: {
  href: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="block rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {label}
    </a>
  );
}