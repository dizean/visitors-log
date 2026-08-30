"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getVisitorLogs,
  type VisitorLog,
} from "@/lib/supabase/visitors";

type StatusFilter =
  | "ALL"
  | "CHECKED_IN"
  | "CHECKED_OUT";

function getToday() {
  return new Date()
    .toISOString()
    .split("T")[0];
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(
    new Date(`${value.slice(0, 10)}T00:00:00`),
  );
}

function formatTime(value: string | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatIdType(value: string | null) {
  if (!value) {
    return "No ID type";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}

export default function Page() {
  const [logs, setLogs] = useState<
    VisitorLog[]
  >([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  const [startDate, setStartDate] =
    useState(getToday());

  const [endDate, setEndDate] =
    useState(getToday());

  const loadLogs = useCallback(
    async (showLoading = true) => {
      try {
        setError("");

        if (showLoading) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const data =
          await getVisitorLogs(
            startDate,
            endDate,
          );

        setLogs(data);
      } catch (error) {
        console.error(
          "Unable to load visitor logs:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load visitor logs.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [startDate, endDate],
  );

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const filteredLogs = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    return logs.filter((log) => {
      const matchesSearch =
        !query ||
        log.name
          ?.toLowerCase()
          .includes(query) ||
        log.purpose
          ?.toLowerCase()
          .includes(query) ||
        log.gate
          ?.toLowerCase()
          .includes(query) ||
        log.id_type
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        log.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    logs,
    search,
    statusFilter,
  ]);

  const checkedInCount = useMemo(
    () =>
      logs.filter(
        (log) =>
          log.status === "CHECKED_IN",
      ).length,
    [logs],
  );

  const checkedOutCount = useMemo(
    () =>
      logs.filter(
        (log) =>
          log.status === "CHECKED_OUT",
      ).length,
    [logs],
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("ALL");

    const today = getToday();

    setStartDate(today);
    setEndDate(today);
  };

  const hasFilters =
    Boolean(search) ||
    statusFilter !== "ALL" ||
    startDate !== getToday() ||
    endDate !== getToday();

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Security Dashboard
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Visitor Logs
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Track visitor entries and exits.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadLogs(false)
              }
              disabled={refreshing}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border bg-background px-4 text-sm font-semibold shadow-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              >
                ↻
              </span>

              {refreshing
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </header>

        {/* Summary */}
        <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SummaryCard
            label="Total Visits"
            value={logs.length}
            icon="↕"
          />

          <SummaryCard
            label="Currently Inside"
            value={checkedInCount}
            icon="●"
            positive
          />

          <SummaryCard
            label="Checked Out"
            value={checkedOutCount}
            icon="✓"
          />
        </section>

        {/* Filters */}
        <section className="mb-5 rounded-2xl border bg-background p-4 shadow-sm sm:p-5">
          <div className="grid gap-4 lg:grid-cols-[1fr_180px_1fr]">
            {/* Search */}
            <div>
              <label
                htmlFor="search"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Search
              </label>

              <input
                id="search"
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search visitor, purpose, gate..."
                className="min-h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="status"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
              >
                Status
              </label>

              <select
                id="status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as StatusFilter,
                  )
                }
                className="min-h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="ALL">
                  All Status
                </option>

                <option value="CHECKED_IN">
                  Checked In
                </option>

                <option value="CHECKED_OUT">
                  Checked Out
                </option>
              </select>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="start-date"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  From
                </label>

                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  max={endDate}
                  onChange={(event) =>
                    setStartDate(
                      event.target.value,
                    )
                  }
                  className="min-h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label
                  htmlFor="end-date"
                  className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  To
                </label>

                <input
                  id="end-date"
                  type="date"
                  min={startDate}
                  value={endDate}
                  onChange={(event) =>
                    setEndDate(
                      event.target.value,
                    )
                  }
                  className="min-h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Showing{" "}
              <span className="font-semibold text-foreground">
                {filteredLogs.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-foreground">
                {logs.length}
              </span>{" "}
              visits
            </p>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="self-start text-xs font-semibold text-primary hover:underline sm:self-auto"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {/* Error */}
        {error && (
          <section className="mb-5 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 font-bold text-destructive">
                !
              </div>

              <div className="min-w-0 flex-1">
                <p className="font-semibold text-destructive">
                  Unable to load visitor logs
                </p>

                <p className="mt-1 text-sm text-destructive/80">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  loadLogs()
                }
                className="shrink-0 rounded-lg border border-destructive/20 bg-background px-3 py-2 text-xs font-semibold text-destructive"
              >
                Retry
              </button>
            </div>
          </section>
        )}

        {/* Logs */}
        <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
          <div className="flex items-center justify-between border-b px-4 py-4 sm:px-5">
            <div>
              <h2 className="font-semibold">
                Visit History
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Entry and exit records
              </p>
            </div>

            {refreshing && (
              <span className="text-xs text-muted-foreground">
                Updating...
              </span>
            )}
          </div>

          {loading ? (
            <LoadingState />
          ) : filteredLogs.length ===
            0 ? (
            <EmptyState
              hasFilters={hasFilters}
              onClear={clearFilters}
            />
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[950px]">
                  <thead>
                    <tr className="border-b bg-muted/30 text-left">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Visitor
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Date
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Purpose
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Gate
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Time
                      </th>

                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {filteredLogs.map(
                      (log) => (
                        <DesktopRow
                          key={log.id}
                          log={log}
                        />
                      ),
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y md:hidden">
                {filteredLogs.map(
                  (log) => (
                    <MobileRow
                      key={log.id}
                      log={log}
                    />
                  ),
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}

function SummaryCard({
  label,
  value,
  icon,
  positive,
}: {
  label: string;
  value: number;
  icon: string;
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
          {icon}
        </span>
      </div>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>
    </div>
  );
}

function DesktopRow({
  log,
}: {
  log: VisitorLog;
}) {
  return (
    <tr className="transition hover:bg-muted/30">
      <td className="px-5 py-4">
        <div>
          <p className="font-semibold">
            {log.name}
          </p>

          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatIdType(log.id_type)}
          </p>
        </div>
      </td>

      <td className="px-5 py-4 text-sm">
        {formatDate(
          log.visit_date ??
            log.logged_in,
        )}
      </td>

      <td className="max-w-[240px] px-5 py-4">
        <p className="truncate text-sm">
          {log.purpose || "—"}
        </p>
      </td>

      <td className="px-5 py-4 text-sm">
        {log.gate || "—"}
      </td>

      <td className="px-5 py-4">
        <div className="space-y-1 text-xs">
          <p>
            <span className="font-medium">
              In:
            </span>{" "}
            {formatTime(log.logged_in)}
          </p>

          <p className="text-muted-foreground">
            <span className="font-medium">
              Out:
            </span>{" "}
            {formatTime(log.logged_out)}
          </p>
        </div>
      </td>

      <td className="px-5 py-4">
        <StatusBadge
          status={log.status}
        />
      </td>
    </tr>
  );
}

function MobileRow({
  log,
}: {
  log: VisitorLog;
}) {
  return (
    <article className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-semibold">
            {log.name}
          </h3>

          <p className="mt-1 text-xs text-muted-foreground">
            {formatDate(
              log.visit_date ??
                log.logged_in,
            )}
          </p>
        </div>

        <StatusBadge
          status={log.status}
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-muted/40 p-3">
        <InfoItem
          label="Purpose"
          value={log.purpose || "—"}
        />

        <InfoItem
          label="Gate"
          value={log.gate || "—"}
        />

        <InfoItem
          label="Time In"
          value={formatTime(
            log.logged_in,
          )}
        />

        <InfoItem
          label="Time Out"
          value={formatTime(
            log.logged_out,
          )}
        />

        <InfoItem
          label="ID Type"
          value={formatIdType(
            log.id_type,
          )}
        />
      </div>
    </article>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: VisitorLog["status"];
}) {
  const checkedIn =
    status === "CHECKED_IN";

  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
        checkedIn
          ? "bg-green-500/10 text-green-700 dark:text-green-400"
          : "bg-muted text-muted-foreground",
      ].join(" ")}
    >
      <span
        className={[
          "size-1.5 rounded-full",
          checkedIn
            ? "bg-green-500"
            : "bg-muted-foreground",
        ].join(" ")}
      />

      {checkedIn
        ? "Checked In"
        : "Checked Out"}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4 p-5">
      {Array.from({ length: 6 }).map(
        (_, index) => (
          <div
            key={index}
            className="flex animate-pulse gap-4"
          >
            <div className="h-10 flex-1 rounded-lg bg-muted" />
            <div className="h-10 w-24 rounded-lg bg-muted" />
            <div className="h-10 w-24 rounded-lg bg-muted" />
          </div>
        ),
      )}
    </div>
  );
}

function EmptyState({
  hasFilters,
  onClear,
}: {
  hasFilters: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted text-2xl">
        ↕
      </div>

      <h3 className="mt-4 text-lg font-semibold">
        No visitor logs found
      </h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasFilters
          ? "No visit records match the selected filters."
          : "There are no visitor logs for this date."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted"
        >
          Show Today
        </button>
      )}
    </div>
  );
}