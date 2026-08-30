import type {
  IdentifiedVisitor,
} from "@/lib/supabase/visitors";

import type { SuccessType } from "./capture-screen";

interface CheckingScreenProps {
  visitor: IdentifiedVisitor | null;
  successType: SuccessType | null;
}

export function CheckingScreen({
  visitor,
  successType,
}: CheckingScreenProps) {
  const isCheckout =
    successType === "check-out";

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border bg-background p-8 text-center shadow-xl sm:p-10">

        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-primary/10">
          <div className="size-9 animate-spin rounded-full border-4 border-primary/20 border-t-primary" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight">
          {isCheckout
            ? "Checking Out"
            : "Checking Visitor"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {isCheckout
            ? `Welcome back, ${
                visitor?.name ?? "visitor"
              }. Completing your checkout...`
            : "Searching for a matching visitor record..."}
        </p>
      </div>
    </main>
  );
}