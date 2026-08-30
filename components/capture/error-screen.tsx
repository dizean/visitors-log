interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}

export function ErrorScreen({
  message,
  onRetry,
}: ErrorScreenProps) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-8">
      <div className="w-full max-w-md rounded-3xl border bg-background p-8 text-center shadow-xl sm:p-10">

        <div className="mx-auto mb-6 flex size-20 items-center justify-center rounded-full bg-destructive/10">
          <span className="text-3xl font-bold text-destructive">
            !
          </span>
        </div>

        <h1 className="text-2xl font-bold tracking-tight">
          Something went wrong
        </h1>

        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          {message ||
            "Unable to process the visitor."}
        </p>

        <button
          type="button"
          onClick={onRetry}
          className="mt-7 w-full rounded-xl bg-primary px-4 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90"
        >
          Try Again
        </button>
      </div>
    </main>
  );
}