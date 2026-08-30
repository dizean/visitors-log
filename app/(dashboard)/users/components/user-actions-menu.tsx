"use client";

import { useState } from "react";
import {
  MoreHorizontal,
  Power,
} from "lucide-react";

import {
  updateUserStatus,
  type SystemUser,
} from "@/lib/supabase/users";

interface UserActionsMenuProps {
  user: SystemUser;
  onUpdated: () => void;
}

export function UserActionsMenu({
  user,
  onUpdated,
}: UserActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleStatusChange() {
    try {
      setLoading(true);

      await updateUserStatus(
        user.id,
        !user.is_active,
      );

      setOpen(false);
      onUpdated();
    } catch (error) {
      console.error(
        "Unable to update user:",
        error,
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
        aria-label={`Actions for ${user.full_name}`}
      >
        <MoreHorizontal className="size-4" />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-10 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div className="absolute right-0 top-10 z-20 w-48 overflow-hidden rounded-xl border bg-background p-1 shadow-lg">
            <button
              type="button"
              disabled={loading}
              onClick={handleStatusChange}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-muted disabled:opacity-50"
            >
              <Power className="size-4" />

              {loading
                ? "Updating..."
                : user.is_active
                  ? "Deactivate User"
                  : "Activate User"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}