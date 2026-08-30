"use client";

import type { Gate } from "@/lib/supabase/visitors";

export function GateSelectionScreen({
  gates,
  gateId,
  loading,
  error,
  onGateChange,
  onContinue,
}: {
  gates: Gate[];
  gateId: string;
  loading: boolean;
  error: string;
  onGateChange: (value: string) => void;
  onContinue: () => void;
}) {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-muted/30 px-4 py-8 sm:px-6 lg:px-8">
      <section className="w-full max-w-3xl">
        <div className="rounded-[2rem] border bg-background p-6 shadow-2xl sm:p-10 lg:p-12">
          <div className="mx-auto max-w-2xl text-center">
            <img
              src="/header.png"
              alt="Visitors Log"
              className="mx-auto h-16 w-auto object-contain sm:h-20"
            />

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Visitor Entry
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Select Entry Gate
            </h1>

            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Select the gate where visitors are currently entering. This gate will
              remain selected until you change it.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-2xl">
            {loading ? (
              <div className="flex h-20 items-center justify-center rounded-2xl border bg-muted/30 text-sm text-muted-foreground">
                Loading available gates...
              </div>
            ) : gates.length === 0 ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-6 text-center">
                <p className="text-base font-semibold text-destructive">
                  No active gates
                </p>

                <p className="mt-2 text-sm leading-6 text-destructive/80">
                  An administrator must activate at
                  least one gate before visitors can
                  be checked in.
                </p>

                {error && (
                  <p className="mt-3 text-xs text-destructive/80">
                    {error}
                  </p>
                )}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {gates.map((gate) => {
                  const selected = gate.id === gateId;

                  return (
                    <button
                      key={gate.id}
                      type="button"
                      onClick={() =>
                        onGateChange(gate.id)
                      }
                      className={[
                        "min-h-36 rounded-3xl border p-6 text-left transition-all",
                        "focus:outline-none focus:ring-2 focus:ring-[#0140b2] focus:ring-offset-2",
                        selected
                          ? "border-[#0140b2] bg-[#0140b2]/5 shadow-lg ring-2 ring-[#0140b2]/20"
                          : "hover:-translate-y-0.5 hover:bg-muted hover:shadow-md",
                      ].join(" ")}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className={[
                            "flex size-14 shrink-0 items-center justify-center rounded-2xl text-2xl",
                            selected
                              ? "bg-[#0140b2] text-white"
                              : "bg-muted",
                          ].join(" ")}
                        >
                          🚪
                        </div>

                        <div
                          className={[
                            "flex size-7 shrink-0 items-center justify-center rounded-full border-2",
                            selected
                              ? "border-[#0140b2] bg-[#0140b2] text-white"
                              : "border-muted-foreground/30",
                          ].join(" ")}
                        >
                          {selected && (
                            <span className="text-sm font-bold">
                              ✓
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-5">
                        <p className="text-xl font-bold">
                          {gate.name}
                        </p>

                        {gate.description && (
                          <p className="mt-2 text-sm leading-5 text-muted-foreground">
                            {gate.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            <button
              type="button"
              onClick={onContinue}
              disabled={
                loading ||
                gates.length === 0 ||
                !gateId
              }
              className="mt-8 h-16 w-full rounded-2xl bg-[#0140b2] px-6 text-base font-bold text-white shadow-lg transition hover:bg-[#01358f] disabled:cursor-not-allowed disabled:opacity-50 sm:text-lg"
            >
              Continue to Face Scan
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}