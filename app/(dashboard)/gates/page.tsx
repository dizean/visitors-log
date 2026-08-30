"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  createClient,
} from "@/lib/supabase/client";

interface Gate {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

type GateForm = {
  name: string;
  description: string;
};

export default function Page() {
  const supabase = createClient();

  const [gates, setGates] = useState<Gate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formOpen, setFormOpen] = useState(false);
  const [editingGate, setEditingGate] =
    useState<Gate | null>(null);

  const [form, setForm] = useState<GateForm>({
    name: "",
    description: "",
  });

  const loadGates = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("gates")
        .select(
          "id, name, description, is_active, created_at",
        )
        .order("name", {
          ascending: true,
        });

      if (error) {
        throw error;
      }

      setGates((data ?? []) as Gate[]);
    } catch (error) {
      console.error(
        "Unable to load gates:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load gates.",
      );
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadGates();
  }, [loadGates]);

  function openCreateForm() {
    setEditingGate(null);

    setForm({
      name: "",
      description: "",
    });

    setError("");
    setFormOpen(true);
  }

  function openEditForm(gate: Gate) {
    setEditingGate(gate);

    setForm({
      name: gate.name,
      description: gate.description ?? "",
    });

    setError("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) {
      return;
    }

    setFormOpen(false);
    setEditingGate(null);

    setForm({
      name: "",
      description: "",
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const name = form.name.trim();
    const description =
      form.description.trim();

    if (!name) {
      setError("Gate name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingGate) {
        const { error } =
          await supabase
            .from("gates")
            .update({
              name,
              description:
                description || null,
            })
            .eq("id", editingGate.id);

        if (error) {
          throw error;
        }
      } else {
        const { error } =
          await supabase
            .from("gates")
            .insert({
              name,
              description:
                description || null,
              is_active: true,
            });

        if (error) {
          throw error;
        }
      }

      closeForm();
      await loadGates();
    } catch (error) {
      console.error(
        "Unable to save gate:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to save gate.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function toggleGate(gate: Gate) {
    try {
      setError("");

      const { error } =
        await supabase
          .from("gates")
          .update({
            is_active: !gate.is_active,
          })
          .eq("id", gate.id);

      if (error) {
        throw error;
      }

      setGates((current) =>
        current.map((item) =>
          item.id === gate.id
            ? {
                ...item,
                is_active:
                  !item.is_active,
              }
            : item,
        ),
      );
    } catch (error) {
      console.error(
        "Unable to update gate:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update gate.",
      );
    }
  }

  async function deleteGate(gate: Gate) {
    const confirmed = window.confirm(
      `Delete "${gate.name}"? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      const { error } =
        await supabase
          .from("gates")
          .delete()
          .eq("id", gate.id);

      if (error) {
        throw error;
      }

      setGates((current) =>
        current.filter(
          (item) => item.id !== gate.id,
        ),
      );
    } catch (error) {
      console.error(
        "Unable to delete gate:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete gate.",
      );
    }
  }

  const activeCount = gates.filter(
    (gate) => gate.is_active,
  ).length;

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Administration
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Gates
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage the entry gates available
                to visitors.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateForm}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground shadow-sm transition hover:opacity-90"
            >
              <span className="text-lg leading-none">
                +
              </span>

              Add Gate
            </button>
          </div>
        </header>

        {/* Summary */}
        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryCard
            label="Total Gates"
            value={gates.length}
          />

          <SummaryCard
            label="Active Gates"
            value={activeCount}
            positive
          />

          <SummaryCard
            label="Inactive Gates"
            value={
              gates.length - activeCount
            }
          />
        </section>

        {/* Error */}
        {error && (
          <section className="mb-5 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 font-bold text-destructive">
                !
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-destructive">
                  Something went wrong
                </p>

                <p className="mt-1 text-sm text-destructive/80">
                  {error}
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Gates */}
        <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
          <div className="flex items-center justify-between border-b px-4 py-4 sm:px-5">
            <div>
              <h2 className="font-semibold">
                Gate List
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                {gates.length} gate
                {gates.length === 1
                  ? ""
                  : "s"}
              </p>
            </div>

            <button
              type="button"
              onClick={loadGates}
              disabled={loading}
              className="rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Loading..."
                : "Refresh"}
            </button>
          </div>

          {loading ? (
            <LoadingState />
          ) : gates.length === 0 ? (
            <EmptyState
              onAdd={openCreateForm}
            />
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b bg-muted/30 text-left">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Gate
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Description
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Status
                      </th>

                      <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {gates.map((gate) => (
                      <tr
                        key={gate.id}
                        className="transition hover:bg-muted/30"
                      >
                        <td className="px-5 py-4">
                          <div>
                            <p className="font-semibold">
                              {gate.name}
                            </p>

                            <p className="mt-0.5 text-xs text-muted-foreground">
                              Created{" "}
                              {formatDate(
                                gate.created_at,
                              )}
                            </p>
                          </div>
                        </td>

                        <td className="max-w-[300px] px-5 py-4">
                          <p className="truncate text-sm text-muted-foreground">
                            {gate.description ||
                              "No description"}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge
                            active={
                              gate.is_active
                            }
                          />
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                toggleGate(
                                  gate,
                                )
                              }
                              className="rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-muted"
                            >
                              {gate.is_active
                                ? "Deactivate"
                                : "Activate"}
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                openEditForm(
                                  gate,
                                )
                              }
                              className="rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-muted"
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                deleteGate(
                                  gate,
                                )
                              }
                              className="rounded-lg border border-destructive/20 px-3 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y md:hidden">
                {gates.map((gate) => (
                  <article
                    key={gate.id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate font-semibold">
                          {gate.name}
                        </h3>

                        <p className="mt-1 text-sm text-muted-foreground">
                          {gate.description ||
                            "No description"}
                        </p>
                      </div>

                      <StatusBadge
                        active={
                          gate.is_active
                        }
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          toggleGate(gate)
                        }
                        className="min-h-10 flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-muted"
                      >
                        {gate.is_active
                          ? "Deactivate"
                          : "Activate"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          openEditForm(gate)
                        }
                        className="min-h-10 flex-1 rounded-lg border px-3 py-2 text-xs font-semibold transition hover:bg-muted"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteGate(gate)
                        }
                        className="min-h-10 w-full rounded-lg border border-destructive/20 px-3 py-2 text-xs font-semibold text-destructive transition hover:bg-destructive/10"
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      {/* Create / Edit Modal */}
      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="gate-form-title"
            className="w-full max-w-lg overflow-hidden rounded-2xl border bg-background shadow-2xl"
          >
            <div className="border-b px-5 py-5 sm:px-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2
                    id="gate-form-title"
                    className="text-lg font-bold"
                  >
                    {editingGate
                      ? "Edit Gate"
                      : "Add Gate"}
                  </h2>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {editingGate
                      ? "Update the gate information."
                      : "Create a new visitor entry gate."}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 p-5 sm:p-6"
            >
              <div className="space-y-2">
                <label
                  htmlFor="gate-name"
                  className="text-sm font-semibold"
                >
                  Gate Name
                </label>

                <input
                  id="gate-name"
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Example: Main Gate"
                  required
                  autoFocus
                  className="h-12 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="gate-description"
                  className="text-sm font-semibold"
                >
                  Description
                </label>

                <textarea
                  id="gate-description"
                  value={form.description}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      description:
                        event.target.value,
                    }))
                  }
                  placeholder="Example: Main entrance"
                  rows={3}
                  className="w-full resize-none rounded-xl border bg-background px-4 py-3 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={saving}
                  className="min-h-11 rounded-xl border px-5 text-sm font-semibold transition hover:bg-muted disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="min-h-11 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : editingGate
                      ? "Save Changes"
                      : "Create Gate"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function SummaryCard({
  label,
  value,
  positive,
}: {
  label: string;
  value: number;
  positive?: boolean;
}) {
  return (
    <div className="rounded-2xl border bg-background p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {label}
        </p>

        <span
          className={
            positive
              ? "text-green-600"
              : "text-muted-foreground"
          }
        >
          ●
        </span>
      </div>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
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
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap",
        active
          ? "bg-green-500/10 text-green-700 dark:text-green-400"
          : "bg-muted text-muted-foreground",
      ].join(" ")}
    >
      <span
        className={[
          "size-1.5 rounded-full",
          active
            ? "bg-green-500"
            : "bg-muted-foreground",
        ].join(" ")}
      />

      {active ? "Active" : "Inactive"}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4 p-5">
      {Array.from({ length: 4 }).map(
        (_, index) => (
          <div
            key={index}
            className="flex animate-pulse gap-4"
          >
            <div className="h-12 flex-1 rounded-lg bg-muted" />
            <div className="h-12 w-24 rounded-lg bg-muted" />
            <div className="h-12 w-32 rounded-lg bg-muted" />
          </div>
        ),
      )}
    </div>
  );
}

function EmptyState({
  onAdd,
}: {
  onAdd: () => void;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted text-2xl">
        +
      </div>

      <h3 className="mt-4 text-lg font-semibold">
        No gates found
      </h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Create your first entry gate to make
        it available for visitor check-in.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-5 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:opacity-90"
      >
        Add Gate
      </button>
    </div>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(
    undefined,
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(new Date(value));
}