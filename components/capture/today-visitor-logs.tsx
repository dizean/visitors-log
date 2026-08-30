"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  getTodayVisitorLogs,
  getTodayVisitorLogsKiosk,
  type VisitorLog,
} from "@/lib/supabase/visitors";

interface TodayVisitorLogsProps {
  refreshKey?: number;
}

export function TodayVisitorLogs({
  refreshKey = 0,
}: TodayVisitorLogsProps) {
  const [logs, setLogs] =
    useState<VisitorLog[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

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
          await getTodayVisitorLogsKiosk();

        setLogs(data);
      } catch (error) {
        console.error(
          "Unable to load today's visitor logs:",
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
    [],
  );

  useEffect(() => {
    loadLogs();
  }, [loadLogs, refreshKey]);

  const checkedInCount =
    logs.filter(
      (log) =>
        log.status === "CHECKED_IN",
    ).length;

  return (
    <aside className="flex min-h-[420px] flex-col border bg-background lg:min-h-screen">
      {/* Header */}

      <div className="flex shrink-0 items-center justify-between border-b px-4 py-4 sm:px-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Security Desk
          </p>

          <h2 className="mt-1 text-lg font-bold">
            Today's Visitors
          </h2>

          <p className="mt-0.5 text-xs text-muted-foreground">
            {logs.length} visit
            {logs.length === 1
              ? ""
              : "s"} today
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            loadLogs(false)
          }
          disabled={refreshing}
          className="inline-flex size-9 items-center justify-center rounded-lg border bg-background text-sm transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Refresh visitor logs"
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
        </button>
      </div>

      {/* Visitor list */}

      <div className="min-h-0 flex-1 overflow-y-auto">
        {loading ? (
          <LoadingState />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() =>
              loadLogs()
            }
          />
        ) : logs.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="divide-y">
            {logs.map((log) => (
              <VisitorLogRow
                key={log.id}
                log={log}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}

      <div className="shrink-0 border-t bg-muted/20 px-4 py-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Currently inside
          </span>

          <span className="font-semibold text-green-600">
            {checkedInCount}
          </span>
        </div>
      </div>
    </aside>
  );
}

function VisitorLogRow({
  log,
}: {
  log: VisitorLog;
}) {
  const checkedIn =
    log.status === "CHECKED_IN";

  return (
    <article className="px-4 py-4 transition hover:bg-muted/30 sm:px-5">
      <div className="flex items-start gap-3">
        {/* Status */}

        <div
          className={[
            "mt-1 flex size-9 shrink-0 items-center justify-center rounded-full",
            checkedIn
              ? "bg-green-500/10 text-green-600"
              : "bg-muted text-muted-foreground",
          ].join(" ")}
        >
          <span
            className={[
              "size-2 rounded-full",
              checkedIn
                ? "bg-green-500"
                : "bg-muted-foreground",
            ].join(" ")}
          />
        </div>

        {/* Content */}

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {log.name}
              </p>

              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {log.id_type
                  ? formatIdType(
                      log.id_type,
                    )
                  : "No ID type"}
              </p>
            </div>

            <StatusBadge
              status={log.status}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
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
          </div>
        </div>
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

      <p className="mt-0.5 truncate font-medium">
        {value}
      </p>
    </div>
  );
}

/* ============================================================
   STATUS
============================================================ */

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
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold whitespace-nowrap",
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
        ? "Inside"
        : "Checked Out"}
    </span>
  );
}

function LoadingState() {
  return (
    <div className="space-y-5 p-4">
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse"
        >
          <div className="flex gap-3">
            <div className="size-9 rounded-full bg-muted" />

            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-4 w-32 rounded bg-muted" />

              <div className="h-3 w-20 rounded bg-muted" />

              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="h-8 rounded bg-muted" />
                <div className="h-8 rounded bg-muted" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted text-xl">
        ○
      </div>

      <h3 className="mt-4 text-sm font-semibold">
        No visitors yet
      </h3>

      <p className="mt-1 max-w-xs text-xs leading-5 text-muted-foreground">
        Today's visitor activity will
        appear here after someone checks
        in.
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="p-4">
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
        <p className="text-sm font-semibold text-destructive">
          Unable to load logs
        </p>

        <p className="mt-1 text-xs leading-5 text-destructive/80">
          {message}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-lg border border-destructive/20 bg-background px-3 py-2 text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

/* ============================================================
   HELPERS
============================================================ */

function formatTime(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(new Date(value));
}

function formatIdType(
  value: string,
) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase(),
    );
}