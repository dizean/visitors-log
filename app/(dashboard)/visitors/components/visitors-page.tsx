"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getVisitors,
  type Visitor,
} from "@/lib/supabase/visitors";

import { VisitorSummary } from "./visitor-summary";
import { VisitorSearch } from "./visitor-search";
import { VisitorTable } from "./visitor-table";
import { VisitorMobileList } from "./visitor-mobile-list";
import { VisitorEmptyState } from "./visitor-empty-state";
import { VisitorLoading } from "./visitor-loading";

export function VisitorsPage() {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadVisitors = useCallback(
    async (showLoading = true) => {
      try {
        setError("");

        if (showLoading) {
          setLoading(true);
        } else {
          setRefreshing(true);
        }

        const data = await getVisitors();

        setVisitors(data);
      } catch (error) {
        console.error(
          "Unable to load visitors:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to load visitors.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [],
  );

  useEffect(() => {
    loadVisitors();
  }, [loadVisitors]);

  const filteredVisitors = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return visitors;
    }

    return visitors.filter((visitor) => {
      return (
        visitor.name
          ?.toLowerCase()
          .includes(query) ||
        visitor.id_type
          ?.toLowerCase()
          .includes(query) ||
        visitor.contact_number
          ?.toLowerCase()
          .includes(query)
      );
    });
  }, [visitors, search]);

  const insideCount = useMemo(
    () =>
      visitors.filter(
        (visitor) => visitor.is_inside,
      ).length,
    [visitors],
  );

  const outsideCount =
    visitors.length - insideCount;

  return (
    <main className="min-h-screen bg-muted/30">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8 xl:px-10 2xl:px-12">
        {/* Header */}
        <header className="mb-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Security Dashboard
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
                Visitors
              </h1>

              <p className="mt-1 text-sm text-muted-foreground">
                Manage registered visitors and
                their current status.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                loadVisitors(false)
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
        <VisitorSummary
          total={visitors.length}
          inside={insideCount}
          outside={outsideCount}
        />

        {/* Search */}
        <VisitorSearch
          search={search}
          total={visitors.length}
          filteredCount={
            filteredVisitors.length
          }
          onSearchChange={setSearch}
          onClear={() => setSearch("")}
        />

        {/* Error */}
        {error && (
          <section className="mb-5 rounded-2xl border border-destructive/30 bg-destructive/10 p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-destructive/10 font-bold text-destructive">
                !
              </div>

              <div className="min-w-0">
                <p className="font-semibold text-destructive">
                  Unable to load visitors
                </p>

                <p className="mt-1 text-sm text-destructive/80">
                  {error}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  loadVisitors()
                }
                className="ml-auto shrink-0 rounded-lg border border-destructive/20 bg-background px-3 py-2 text-xs font-semibold text-destructive"
              >
                Retry
              </button>
            </div>
          </section>
        )}

        {/* Visitor List */}
        <section className="overflow-hidden rounded-2xl border bg-background shadow-sm">
          <div className="flex items-center justify-between border-b px-4 py-4 sm:px-5">
            <div>
              <h2 className="font-semibold">
                Registered Visitors
              </h2>

              <p className="mt-0.5 text-xs text-muted-foreground">
                Visitor directory
              </p>
            </div>

            {refreshing && (
              <span className="text-xs text-muted-foreground">
                Updating...
              </span>
            )}
          </div>

          {loading ? (
            <VisitorLoading />
          ) : filteredVisitors.length === 0 ? (
            <VisitorEmptyState
              hasSearch={Boolean(search)}
              onClear={() => setSearch("")}
            />
          ) : (
            <>
              <VisitorTable
                visitors={filteredVisitors}
              />

              <VisitorMobileList
                visitors={filteredVisitors}
              />
            </>
          )}
        </section>
      </div>
    </main>
  );
}