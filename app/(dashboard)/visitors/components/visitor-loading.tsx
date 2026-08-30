export function VisitorLoading() {
  return (
    <div className="space-y-4 p-5">
      {Array.from({ length: 6 }).map(
        (_, index) => (
          <div
            key={index}
            className="flex animate-pulse items-center gap-4"
          >
            <div className="size-11 shrink-0 rounded-full bg-muted" />

            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>

            <div className="hidden h-8 w-24 rounded bg-muted sm:block" />

            <div className="hidden h-8 w-28 rounded bg-muted sm:block" />
          </div>
        ),
      )}
    </div>
  );
}