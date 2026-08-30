import type {
  IdentifiedVisitor,
} from "@/lib/supabase/visitors";

import type { SuccessType } from "./capture-screen";

interface SuccessScreenProps {
  visitor: IdentifiedVisitor | null;
  successType: SuccessType | null;
  onDone: () => void;
}

export function SuccessScreen({
  visitor,
  successType,
  onDone,
}: SuccessScreenProps) {
  const isCheckout =
    successType === "check-out";

  const isCheckin =
    successType === "check-in";

  const title = isCheckout
    ? "Checked Out"
    : isCheckin
      ? "Checked In"
      : "Visitor Recorded";

  const description = isCheckout
    ? `${visitor?.name ?? "Visitor"} has been checked out successfully.`
    : isCheckin
      ? `${visitor?.name ?? "Visitor"} has been checked in successfully.`
      : "The visitor has been successfully registered.";

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border bg-background p-8 text-center shadow-xl sm:p-10">

        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-green-500/10">
          <span className="text-4xl font-semibold text-green-600">
            ✓
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">
          {title}
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {description}
        </p>

        {visitor && (
          <div className="mt-6 rounded-2xl bg-muted/50 p-4">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">
              Visitor
            </p>

            <p className="mt-1 text-lg font-semibold">
              {visitor.name}
            </p>

            {visitor.id_type && (
              <p className="mt-1 text-xs text-muted-foreground">
                {formatIdType(
                  visitor.id_type,
                )}
              </p>
            )}
          </div>
        )}

        <button
          type="button"
          onClick={onDone}
          className="mt-7 w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Scan Next Visitor
        </button>
      </div>
    </main>
  );
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