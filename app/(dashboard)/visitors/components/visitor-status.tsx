export function VisitorStatus({
  isInside,
}: {
  isInside: boolean;
}) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold",
        isInside
          ? "bg-green-500/10 text-green-700 dark:text-green-400"
          : "bg-muted text-muted-foreground",
      ].join(" ")}
    >
      <span
        className={[
          "size-1.5 rounded-full",
          isInside
            ? "bg-green-500"
            : "bg-muted-foreground",
        ].join(" ")}
      />

      {isInside ? "Inside" : "Outside"}
    </span>
  );
}