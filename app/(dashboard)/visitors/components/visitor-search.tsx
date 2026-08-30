export function VisitorSearch({
  search,
  total,
  filteredCount,
  onSearchChange,
  onClear,
}: {
  search: string;
  total: number;
  filteredCount: number;
  onSearchChange: (value: string) => void;
  onClear: () => void;
}) {
  return (
    <section className="mb-5 rounded-2xl border bg-background p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="w-full">
          <label
            htmlFor="visitor-search"
            className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground"
          >
            Search Visitors
          </label>

          <input
            id="visitor-search"
            type="search"
            value={search}
            onChange={(event) =>
              onSearchChange(
                event.target.value,
              )
            }
            placeholder="Search by name, ID type, or ID number..."
            className="min-h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none transition focus:border-[#0140b2] focus:ring-2 focus:ring-[#0140b2]/20"
          />
        </div>

        {search && (
          <button
            type="button"
            onClick={onClear}
            className="min-h-11 rounded-xl border bg-background px-4 text-sm font-semibold hover:bg-muted"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-4 border-t pt-4">
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-semibold text-foreground">
            {filteredCount}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-foreground">
            {total}
          </span>{" "}
          registered visitor
          {total === 1 ? "" : "s"}
        </p>
      </div>
    </section>
  );
}