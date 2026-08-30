"use client";

import { useState } from "react";

import {
  createNewVisitor,
  checkInVisitor,
  type IdentifiedVisitor,
} from "@/lib/supabase/visitors";

interface VisitorFormProps {
  descriptor: number[];
  visitor: IdentifiedVisitor | null;
  gateId: string;
  onSuccess: (
    type: "check-in" | "new-visitor",
  ) => void;
  onCancel: () => void;
}

const ID_TYPES = [
  {
    value: "government_id",
    label: "Government ID",
  },
  {
    value: "school_id",
    label: "School ID",
  },
  {
    value: "company_id",
    label: "Company ID",
  },
  {
    value: "passport",
    label: "Passport",
  },
  {
    value: "drivers_license",
    label: "Driver's License",
  },
  {
    value: "other",
    label: "Other",
  },
] as const;

export function VisitorForm({
  descriptor,
  visitor,
  gateId,
  onSuccess,
  onCancel,
}: VisitorFormProps) {
  const isExistingVisitor = visitor !== null;

  const [name, setName] = useState(
    visitor?.name ?? "",
  );

  const [idType, setIdType] = useState<string>(
    visitor?.id_type ?? "",
  );

  const [idNumber, setIdNumber] = useState(
    visitor?.id_number ?? "",
  );

  const [purpose, setPurpose] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (descriptor.length !== 128) {
      setError(
        "Face information is invalid. Please scan the visitor again.",
      );
      return;
    }

    if (!gateId) {
      setError(
        "No entry gate has been selected. Please scan again and select a gate.",
      );
      return;
    }

    if (!purpose.trim()) {
      setError(
        "Please enter the reason for the visit.",
      );
      return;
    }

    if (isExistingVisitor) {
      try {
        setSubmitting(true);

        await checkInVisitor(
          visitor.visitor_id,
          purpose.trim(),
          gateId,
        );

        onSuccess("check-in");
      } catch (error) {
        console.error(
          "Unable to check in visitor:",
          error,
        );

        setError(
          error instanceof Error
            ? error.message
            : "Unable to check in the visitor. Please try again.",
        );
      } finally {
        setSubmitting(false);
      }

      return;
    }

    if (!name.trim()) {
      setError(
        "Please enter the visitor's full name.",
      );
      return;
    }

    if (!idType) {
      setError(
        "Please select the visitor's ID type.",
      );
      return;
    }

    if (!idNumber.trim()) {
      setError(
        "Please enter the visitor's ID number.",
      );
      return;
    }

    try {
      setSubmitting(true);

      await createNewVisitor({
        name: name.trim(),

        id_type:
          idType as
            | "government_id"
            | "school_id"
            | "company_id"
            | "passport"
            | "drivers_license"
            | "other",

        id_number: idNumber.trim(),

        descriptor,

        purpose: purpose.trim(),

        gate_id: gateId,
      });

      onSuccess("new-visitor");
    } catch (error) {
      console.error(
        "Unable to save visitor:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to save the visitor. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-muted/30 px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <section className="w-full max-w-5xl">
        <div className="overflow-hidden rounded-3xl border bg-background shadow-2xl">
          <div className="border-b px-6 py-7 sm:px-10 sm:py-9 lg:px-12 lg:py-10">
            <div className="flex items-start gap-5">
              <div
                className={[
                  "flex size-16 shrink-0 items-center justify-center rounded-2xl text-3xl font-bold sm:size-20 sm:text-4xl",
                  isExistingVisitor
                    ? "bg-green-500/10 text-green-600"
                    : "bg-primary/10 text-primary",
                ].join(" ")}
              >
                {isExistingVisitor ? "✓" : "+"}
              </div>

              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground sm:text-sm">
                  Visitor Entry
                </p>

                <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
                  {isExistingVisitor
                    ? `Welcome back, ${visitor.name}`
                    : "Register New Visitor"}
                </h1>

                <p className="mt-3 max-w-3xl text-base leading-7 text-muted-foreground sm:text-lg">
                  {isExistingVisitor
                    ? "Enter the visit details to record this visitor's arrival."
                    : "Enter the visitor's information to record their first visit."}
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-8 p-6 sm:p-10 lg:p-12"
          >
            {!isExistingVisitor && (
              <div className="space-y-8">
                <div className="space-y-3">
                  <label
                    htmlFor="name"
                    className="text-lg font-semibold sm:text-xl"
                  >
                    Full Name
                  </label>

                  <input
                    id="name"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder="Enter visitor's full name"
                    autoComplete="name"
                    required
                    disabled={submitting}
                    className="h-16 w-full rounded-2xl border bg-background px-5 text-lg outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:h-[68px] sm:px-6 sm:text-xl"
                  />
                </div>

                <div className="grid gap-8 md:grid-cols-2">
                  <div className="space-y-3">
                    <label
                      htmlFor="idType"
                      className="text-lg font-semibold sm:text-xl"
                    >
                      ID Type
                    </label>

                    <select
                      id="idType"
                      value={idType}
                      onChange={(event) =>
                        setIdType(event.target.value)
                      }
                      required
                      disabled={submitting}
                      className="h-16 w-full rounded-2xl border bg-background px-5 text-lg outline-none focus:border-primary focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:h-[68px] sm:px-6 sm:text-xl"
                    >
                      <option value="">
                        Select ID type
                      </option>

                      {ID_TYPES.map((type) => (
                        <option
                          key={type.value}
                          value={type.value}
                        >
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label
                      htmlFor="idNumber"
                      className="text-lg font-semibold sm:text-xl"
                    >
                      ID Number
                    </label>

                    <input
                      id="idNumber"
                      value={idNumber}
                      onChange={(event) =>
                        setIdNumber(event.target.value)
                      }
                      placeholder="Enter ID number"
                      autoComplete="off"
                      required
                      disabled={submitting}
                      className="h-16 w-full rounded-2xl border bg-background px-5 text-lg outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:h-[68px] sm:px-6 sm:text-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <label
                htmlFor="purpose"
                className="text-lg font-semibold sm:text-xl"
              >
                Reason for Visit
              </label>

              <input
                id="purpose"
                value={purpose}
                onChange={(event) =>
                  setPurpose(event.target.value)
                }
                placeholder="Example: Meeting, Delivery, Inquiry"
                required
                disabled={submitting}
                className="h-16 w-full rounded-2xl border bg-background px-5 text-lg outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60 sm:h-[68px] sm:px-6 sm:text-xl"
              />

              <p className="text-sm leading-6 text-muted-foreground sm:text-base">
                Briefly describe why the visitor is
                entering.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 sm:p-6"
              >
                <div className="flex gap-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-red-500 text-base font-bold text-white">
                    !
                  </div>

                  <div>
                    <p className="text-base font-semibold text-red-700 dark:text-red-400 sm:text-lg">
                      Please check the information
                    </p>

                    <p className="mt-1 text-sm leading-6 text-red-600 dark:text-red-300 sm:text-base">
                      {error}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="border-t pt-8">
              <div className="flex flex-col-reverse gap-4 sm:flex-row">
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={submitting}
                  className="h-16 w-full rounded-2xl border px-6 text-lg font-semibold transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50 sm:h-[68px] sm:w-1/3"
                >
                  Scan Again
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="h-16 w-full rounded-2xl bg-primary px-6 text-lg font-bold text-primary-foreground shadow-md transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:h-[68px] sm:flex-1 sm:text-xl"
                >
                  {submitting
                    ? "Saving Visitor..."
                    : isExistingVisitor
                      ? "✓ Check In Visitor"
                      : "✓ Record Visitor Entry"}
                </button>
              </div>
            </div>
          </form>

          <div className="border-t bg-muted/30 px-6 py-5 sm:px-10 lg:px-12">
            <p className="text-center text-sm leading-6 text-muted-foreground sm:text-base">
              Please verify the visitor's information
              before recording their entry.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}