"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  UserPlus,
  ShieldCheck,
  UserRound,
  CheckCircle2,
} from "lucide-react";

import {
  getUsers,
  type SystemUser,
  type UserRole,
} from "@/lib/supabase/users";

import { AddUserDialog } from "./add-user-dialog";
import { UserActionsMenu } from "./user-actions-menu";

export function UserManagement() {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [roleFilter, setRoleFilter] =
    useState<"all" | UserRole>("all");

  const [statusFilter, setStatusFilter] =
    useState<"all" | "active" | "inactive">("all");

  const [addUserOpen, setAddUserOpen] =
    useState(false);

  async function loadUsers() {
    try {
      setLoading(true);
      setError("");

      const data = await getUsers();

      setUsers(data);
    } catch (error) {
      console.error("Unable to load users:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load users.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const searchValue = search
      .toLowerCase()
      .trim();

    return users.filter((user) => {
      const matchesSearch =
        !searchValue ||
        user.full_name
          .toLowerCase()
          .includes(searchValue) ||
        user.email
          .toLowerCase()
          .includes(searchValue);

      const matchesRole =
        roleFilter === "all" ||
        user.role === roleFilter;

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" &&
          user.is_active) ||
        (statusFilter === "inactive" &&
          !user.is_active);

      return (
        matchesSearch &&
        matchesRole &&
        matchesStatus
      );
    });
  }, [
    users,
    search,
    roleFilter,
    statusFilter,
  ]);

  const totalUsers = users.length;

  const activeUsers = users.filter(
    (user) => user.is_active,
  ).length;

  const adminUsers = users.filter(
    (user) => user.role === "admin",
  ).length;

  const staffUsers = users.filter(
    (user) => user.role === "staff",
  ).length;

  function handleUserCreated() {
    setAddUserOpen(false);
    loadUsers();
  }

  function handleUserUpdated() {
    loadUsers();
  }

  return (
    <div className="min-h-full bg-muted/30 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Administration
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              User Management
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Manage administrator and staff accounts
              for the visitor management system.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setAddUserOpen(true)}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
          >
            <UserPlus className="size-4" />
            Add User
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Users"
            value={totalUsers}
            icon={UserRound}
          />

          <StatCard
            label="Active Users"
            value={activeUsers}
            icon={CheckCircle2}
          />

          <StatCard
            label="Administrators"
            value={adminUsers}
            icon={ShieldCheck}
          />

          <StatCard
            label="Staff"
            value={staffUsers}
            icon={UserRound}
          />
        </div>

        <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
          <div className="border-b p-4 sm:p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold">
                  System Users
                </h2>

                <p className="mt-1 text-sm text-muted-foreground">
                  {filteredUsers.length} user
                  {filteredUsers.length === 1
                    ? ""
                    : "s"} found
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Search users..."
                    className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 sm:w-64"
                  />
                </div>

                <select
                  value={roleFilter}
                  onChange={(event) =>
                    setRoleFilter(
                      event.target.value as
                        | "all"
                        | UserRole,
                    )
                  }
                  className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">
                    All Roles
                  </option>

                  <option value="admin">
                    Administrators
                  </option>

                  <option value="staff">
                    Staff
                  </option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value as
                        | "all"
                        | "active"
                        | "inactive",
                    )
                  }
                  className="h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">
                    All Status
                  </option>

                  <option value="active">
                    Active
                  </option>

                  <option value="inactive">
                    Inactive
                  </option>
                </select>
              </div>
            </div>
          </div>

          {error && (
            <div className="border-b bg-red-500/10 px-5 py-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          {loading ? (
            <div className="px-6 py-16 text-center text-sm text-muted-foreground">
              Loading users...
            </div>
          ) : (
            <>
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/30 text-left">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        User
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Role
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Status
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Created
                      </th>

                      <th className="w-12 px-5 py-3" />
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {filteredUsers.map((user) => (
                      <tr
                        key={user.id}
                        className="transition hover:bg-muted/20"
                      >
                        <td className="px-5 py-4">
                          <UserIdentity user={user} />
                        </td>

                        <td className="px-5 py-4">
                          <RoleBadge
                            role={user.role}
                          />
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            active={
                              user.is_active
                            }
                          />
                        </td>

                        <td className="px-5 py-4 text-sm text-muted-foreground">
                          {formatDate(
                            user.created_at,
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <UserActionsMenu
                            user={user}
                            onUpdated={
                              handleUserUpdated
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="divide-y md:hidden">
                {filteredUsers.map((user) => (
                  <div
                    key={user.id}
                    className="space-y-4 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <UserIdentity user={user} />

                      <UserActionsMenu
                        user={user}
                        onUpdated={
                          handleUserUpdated
                        }
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <RoleBadge
                        role={user.role}
                      />

                      <StatusBadge
                        active={
                          user.is_active
                        }
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Created{" "}
                      {formatDate(
                        user.created_at,
                      )}
                    </p>
                  </div>
                ))}
              </div>

              {filteredUsers.length === 0 && (
                <div className="px-6 py-16 text-center">
                  <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
                    <UserRound className="size-5 text-muted-foreground" />
                  </div>

                  <h3 className="mt-4 font-semibold">
                    No users found
                  </h3>

                  <p className="mt-1 text-sm text-muted-foreground">
                    Try changing your search or
                    filters.
                  </p>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <AddUserDialog
        open={addUserOpen}
        onOpenChange={setAddUserOpen}
        onCreated={handleUserCreated}
      />
    </div>
  );
}

function UserIdentity({
  user,
}: {
  user: SystemUser;
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={user.full_name} />

      <div className="min-w-0">
        <p className="truncate font-medium">
          {user.full_name}
        </p>

        <p className="truncate text-sm text-muted-foreground">
          {user.email}
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof UserRound;
}) {
  return (
    <div className="rounded-2xl border bg-background p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">
          {label}
        </p>

        <div className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
      </div>

      <p className="mt-4 text-3xl font-bold tracking-tight">
        {value}
      </p>
    </div>
  );
}

function Avatar({
  name,
}: {
  name: string;
}) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

function RoleBadge({
  role,
}: {
  role: UserRole;
}) {
  const isAdmin = role === "admin";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        isAdmin
          ? "bg-primary/10 text-primary"
          : "bg-muted text-muted-foreground",
      ].join(" ")}
    >
      {isAdmin ? (
        <ShieldCheck className="size-3.5" />
      ) : (
        <UserRound className="size-3.5" />
      )}

      {isAdmin ? "Administrator" : "Staff"}
    </span>
  );
}

function StatusBadge({
  active,
}: {
  active: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        active
          ? "bg-green-500/10 text-green-600 dark:text-green-400"
          : "bg-red-500/10 text-red-600 dark:text-red-400",
      ].join(" ")}
    >
      <CheckCircle2 className="size-3.5" />

      {active ? "Active" : "Inactive"}
    </span>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}