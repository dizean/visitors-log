"use client";

import { useState } from "react";
import { X, UserPlus } from "lucide-react";

import {
  createUser,
  type UserRole,
} from "@/lib/supabase/users";

interface AddUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: () => void;
}

export function AddUserDialog({
  open,
  onOpenChange,
  onCreated,
}: AddUserDialogProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] =
    useState<UserRole>("staff");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  if (!open) {
    return null;
  }

  function resetForm() {
    setFullName("");
    setEmail("");
    setPassword("");
    setRole("staff");
    setError("");
  }

  function close() {
    if (submitting) {
      return;
    }

    resetForm();
    onOpenChange(false);
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!fullName.trim()) {
      setError("Please enter the user's full name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter an email address.");
      return;
    }

    if (password.length < 8) {
      setError(
        "Password must be at least 8 characters.",
      );
      return;
    }

    try {
      setSubmitting(true);

      await createUser({
        full_name: fullName.trim(),
        email: email.trim(),
        password,
        role,
      });

      resetForm();
      onCreated();
    } catch (error) {
      console.error(
        "Unable to create user:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to create user.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        onClick={close}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <section className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <UserPlus className="size-5" />
            </div>

            <div>
              <h2 className="font-semibold">
                Add User
              </h2>

              <p className="text-sm text-muted-foreground">
                Create a new system account.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={close}
            disabled={submitting}
            className="inline-flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
          >
            <X className="size-4" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-5 sm:p-6"
        >
          <div className="space-y-2">
            <label
              htmlFor="user-full-name"
              className="text-sm font-semibold"
            >
              Full Name
            </label>

            <input
              id="user-full-name"
              value={fullName}
              onChange={(event) =>
                setFullName(event.target.value)
              }
              disabled={submitting}
              placeholder="Enter full name"
              className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="user-email"
              className="text-sm font-semibold"
            >
              Email
            </label>

            <input
              id="user-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              disabled={submitting}
              placeholder="user@example.com"
              autoComplete="email"
              className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="user-password"
              className="text-sm font-semibold"
            >
              Temporary Password
            </label>

            <input
              id="user-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              disabled={submitting}
              placeholder="Minimum 8 characters"
              autoComplete="new-password"
              className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="user-role"
              className="text-sm font-semibold"
            >
              Role
            </label>

            <select
              id="user-role"
              value={role}
              onChange={(event) =>
                setRole(
                  event.target.value as UserRole,
                )
              }
              disabled={submitting}
              className="h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="staff">
                Staff
              </option>

              <option value="admin">
                Administrator
              </option>
            </select>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-400"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={close}
              disabled={submitting}
              className="h-11 rounded-lg border px-5 text-sm font-semibold hover:bg-muted disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="h-11 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {submitting
                ? "Creating..."
                : "Create User"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}