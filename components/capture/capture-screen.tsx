"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import { FaceCamera } from "./face-camera";
import { VisitorForm } from "./visitor-form";
import { TodayVisitorLogs } from "./today-visitor-logs";
import { GateSelectionScreen } from "./gate-selection-screen";
import { CheckingScreen } from "./checking-screen";
import { SuccessScreen } from "./success-screen";
import { ErrorScreen } from "./error-screen";

import {
  checkOutVisitor,
  getActiveGates,
  identifyVisitor,
  type Gate,
  type IdentifiedVisitor,
} from "@/lib/supabase/visitors";

type CaptureStep =
  | "gate-selection"
  | "camera"
  | "checking"
  | "visitor-form"
  | "success"
  | "error";

export type SuccessType =
  | "check-in"
  | "check-out"
  | "new-visitor";

export function CaptureScreen() {
  const [step, setStep] =
    useState<CaptureStep>("gate-selection");

  const [gates, setGates] =
    useState<Gate[]>([]);

  const [gateId, setGateId] =
    useState("");

  const [loadingGates, setLoadingGates] =
    useState(true);

  const [gateError, setGateError] =
    useState("");

  const [descriptor, setDescriptor] =
    useState<number[] | null>(null);

  const [visitor, setVisitor] =
    useState<IdentifiedVisitor | null>(null);

  const [successType, setSuccessType] =
    useState<SuccessType | null>(null);

  const [errorMessage, setErrorMessage] =
    useState("");

  const [logsRefreshKey, setLogsRefreshKey] =
    useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadGates() {
      try {
        setLoadingGates(true);
        setGateError("");

        const activeGates =
          await getActiveGates();

        if (cancelled) {
          return;
        }

        setGates(activeGates);

        if (activeGates.length === 1) {
          setGateId(activeGates[0].id);
        }
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(
          "Unable to load gates:",
          error,
        );

        setGateError(
          error instanceof Error
            ? error.message
            : "Unable to load active gates.",
        );

        setGates([]);
      } finally {
        if (!cancelled) {
          setLoadingGates(false);
        }
      }
    }

    loadGates();

    return () => {
      cancelled = true;
    };
  }, []);

  function handleGateSelected() {
    if (!gateId) {
      setGateError(
        "Please select an entry gate.",
      );

      return;
    }

    setGateError("");
    setStep("camera");
  }

  const handleFaceCaptured =
    useCallback(
      async (
        faceDescriptor: number[],
      ) => {
        try {
          setStep("checking");
          setDescriptor(faceDescriptor);
          setErrorMessage("");
          setSuccessType(null);

          const matchedVisitor =
            await identifyVisitor(
              faceDescriptor,
            );
              
          if (!matchedVisitor) {
            setVisitor(null);
            setStep("visitor-form");
            return;
          }

          setVisitor(matchedVisitor);

          if (
            matchedVisitor.is_inside &&
            matchedVisitor.active_log_id
          ) {
            setSuccessType("check-out");

            await checkOutVisitor(
              matchedVisitor.visitor_id,
            );

            refreshLogs();
            setStep("success");

            return;
          }

          setStep("visitor-form");
        } catch (error) {
          console.error(
            "Visitor identification/checkout error:",
            error,
          );

          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to process visitor.",
          );

          setStep("error");
        }
      },
      [],
    );

  function refreshLogs() {
    setLogsRefreshKey(
      (value) => value + 1,
    );
  }

  function handleSuccess(
    type: SuccessType,
  ) {
    setSuccessType(type);
    refreshLogs();
    setStep("success");
  }

  function resetCapture() {
    setStep("camera");
    setDescriptor(null);
    setVisitor(null);
    setSuccessType(null);
    setErrorMessage("");
  }

  function changeGate() {
    setDescriptor(null);
    setVisitor(null);
    setSuccessType(null);
    setErrorMessage("");
    setStep("gate-selection");
  }

  const currentGate = gates.find(
    (gate) => gate.id === gateId,
  );

  if (step === "gate-selection") {
    return (
      <GateSelectionScreen
        gates={gates}
        gateId={gateId}
        loading={loadingGates}
        error={gateError}
        onGateChange={setGateId}
        onContinue={handleGateSelected}
      />
    );
  }

  return (
    <main className="min-h-screen w-full bg-muted/30">
      <div className="grid min-h-screen w-full lg:grid-cols-[360px_minmax(0,1fr)]">
        <div className="order-2 min-w-0 lg:order-1">
          <TodayVisitorLogs
            refreshKey={logsRefreshKey}
          />
        </div>

        <section className="order-1 min-w-0 lg:order-2">
          {step === "camera" && (
            <div className="relative min-h-screen">
              <div className="absolute left-4 top-4 z-20 sm:left-6 sm:top-6">
                <div className="flex items-center gap-3 rounded-2xl border bg-background/95 px-4 py-3 shadow-lg backdrop-blur sm:px-5 sm:py-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0140b2]/10 p-2 sm:size-11">
                    <img
                      src="/logo.png"
                      alt="Visitors Log"
                      className="size-full object-contain"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground sm:text-xs">
                      Entry Gate
                    </p>

                    <p className="max-w-[140px] truncate text-2xl font-bold tracking-tight sm:max-w-[180px] sm:text-xl">
                      {currentGate?.name ?? "Unknown"}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={changeGate}
                    className="ml-1 shrink-0 rounded-xl border px-3 py-2 text-xs font-semibold transition hover:bg-muted sm:px-4 sm:py-2.5 sm:text-sm"
                  >
                    Change
                  </button>
                </div>
              </div>

              <FaceCamera
                onFaceCaptured={handleFaceCaptured}
              />
            </div>
          )}

          {step === "checking" && (
            <CheckingScreen
              visitor={visitor}
              successType={successType}
            />
          )}

          {step === "visitor-form" &&
            descriptor && (
              <VisitorForm
                descriptor={descriptor}
                visitor={visitor}
                gateId={gateId}
                onSuccess={handleSuccess}
                onCancel={resetCapture}
              />
            )}

          {step === "success" && (
            <SuccessScreen
              visitor={visitor}
              successType={successType}
              onDone={resetCapture}
            />
          )}

          {step === "error" && (
            <ErrorScreen
              message={errorMessage}
              onRetry={resetCapture}
            />
          )}
        </section>
      </div>
    </main>
  );
}