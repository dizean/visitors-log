export function VisitorSummary({
  total,
  inside,
  outside,
}: {
  total: number;
  inside: number;
  outside: number;
}) {
  return (
    <section className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
      <SummaryCard
        label="Total Visitors"
        value={total}
        icon="👥"
      />

      <SummaryCard
        label="Currently Inside"
        value={inside}
        icon="●"
        positive
      />

      <SummaryCard
        label="Outside"
        value={outside}
        icon="○"
      />
    </section>
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