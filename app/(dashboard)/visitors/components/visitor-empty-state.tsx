export function VisitorEmptyState({
  hasSearch,
  onClear,
}: {
  hasSearch: boolean;
  onClear: () => void;
}) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center px-6 py-12 text-center">
      <div className="flex size-16 items-center justify-center rounded-full bg-muted text-2xl">
        👥
      </div>

      <h3 className="mt-4 text-lg font-semibold">
        {hasSearch
          ? "No visitors found"
          : "No registered visitors"}
      </h3>

      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        {hasSearch
          ? "No registered visitors match your search."
          : "Registered visitors will appear here after they are added."}
      </p>

      {hasSearch && (
        <button
          type="button"
          onClick={onClear}
          className="mt-5 rounded-xl border bg-background px-4 py-2.5 text-sm font-semibold hover:bg-muted"
        >
          Clear Search
        </button>
      )}
    </div>
  );
}