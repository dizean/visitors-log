"use client";

import { useEffect, useRef, useState } from "react";
import { loadFaceModels } from "@/lib/face-api";

interface FaceCameraProps {
  onFaceCaptured: (descriptor: number[]) => void;
}

type ScannerStatus =
  | "loading"
  | "starting"
  | "no-face"
  | "multiple-faces"
  | "too-far"
  | "too-close"
  | "move-left"
  | "move-right"
  | "move-up"
  | "move-down"
  | "good"
  | "recognizing"
  | "descriptor-ready"
  | "error";

type StatusType =
  | "neutral"
  | "warning"
  | "success"
  | "error";

const FACE_MIN_AREA = 0.18;
const FACE_MAX_AREA = 0.42;

const DETECTION_SCORE_THRESHOLD = 0.80;

const CENTER_TOLERANCE_X = 0.10;
const CENTER_TOLERANCE_Y = 0.10;

const REQUIRED_STABLE_FRAMES = 8;

const STATUS_CONFIG: Record<
  ScannerStatus,
  {
    title: string;
    description: string;
    type: StatusType;
    icon: string;
  }
> = {
  loading: {
    title: "Please Wait",
    description: "Preparing the scanner.",
    type: "neutral",
    icon: "◌",
  },

  starting: {
    title: "Starting Camera",
    description: "Please wait a moment.",
    type: "neutral",
    icon: "◌",
  },

  "no-face": {
    title: "Look at the Camera",
    description: "Make sure your face is visible inside the oval.",
    type: "warning",
    icon: "👤",
  },

  "multiple-faces": {
    title: "One Person Only",
    description: "Please make sure only one person is in front of the camera.",
    type: "error",
    icon: "👥",
  },

  "too-far": {
    title: "Move Closer",
    description: "Please move a little closer to the camera.",
    type: "warning",
    icon: "↔",
  },

  "too-close": {
    title: "Move Back",
    description: "Please move a little farther from the camera.",
    type: "warning",
    icon: "↔",
  },

  "move-left": {
    title: "Move Right",
    description: "Move your face slightly to the right.",
    type: "warning",
    icon: "→",
  },

  "move-right": {
    title: "Move Left",
    description: "Move your face slightly to the left.",
    type: "warning",
    icon: "←",
  },

  "move-up": {
    title: "Move Up",
    description: "Move your face slightly upward.",
    type: "warning",
    icon: "↑",
  },

  "move-down": {
    title: "Move Down",
    description: "Move your face slightly downward.",
    type: "warning",
    icon: "↓",
  },

  good: {
    title: "Hold Still",
    description: "Perfect. Stay still while we capture your face.",
    type: "success",
    icon: "✓",
  },

  recognizing: {
    title: "Please Wait",
    description: "Checking your visitor record.",
    type: "neutral",
    icon: "◌",
  },

  "descriptor-ready": {
    title: "Face Captured",
    description: "Checking your visitor record.",
    type: "success",
    icon: "✓",
  },

  error: {
    title: "Camera Problem",
    description: "Please check the camera and try again.",
    type: "error",
    icon: "!",
  },
};

export function FaceCamera({
  onFaceCaptured,
}: FaceCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const intervalRef =
    useRef<ReturnType<typeof setInterval> | null>(null);

  const successTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  const stableFramesRef = useRef(0);
  const processingRef = useRef(false);

  const [status, setStatus] =
    useState<ScannerStatus>("loading");

  const [stableProgress, setStableProgress] =
    useState(0);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let mounted = true;

    async function initialize() {
      try {
        setStatus("loading");

        const faceapi = await loadFaceModels();

        if (!faceapi || !mounted) return;

        setStatus("starting");

        stream =
          await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: "user",
              width: {
                ideal: 1280,
              },
              height: {
                ideal: 720,
              },
            },
            audio: false,
          });

        if (!videoRef.current || !mounted) {
          return;
        }

        videoRef.current.srcObject = stream;

        await videoRef.current.play();

        if (!mounted) return;

        setStatus("no-face");

        startDetection(faceapi);
      } catch (error) {
        console.error(
          "Camera initialization error:",
          error,
        );

        if (!mounted) return;

        setStatus("error");
      }
    }

    function resetStability() {
      stableFramesRef.current = 0;
      setStableProgress(0);
    }

    function startDetection(
      faceapi: typeof import("face-api.js"),
    ) {
      intervalRef.current = setInterval(
        async () => {
          const video = videoRef.current;

          if (!video) return;

          if (
            video.readyState !==
            HTMLMediaElement.HAVE_ENOUGH_DATA
          ) {
            return;
          }

          if (processingRef.current) return;

          processingRef.current = true;

          try {
            const detections =
              await faceapi.detectAllFaces(
                video,
                new faceapi.TinyFaceDetectorOptions({
                  inputSize: 320,
                  scoreThreshold: 0.5,
                }),
              );

            if (detections.length === 0) {
              resetStability();
              setStatus("no-face");
              return;
            }

            if (detections.length > 1) {
              resetStability();
              setStatus("multiple-faces");
              return;
            }

            const detection = detections[0];
            if (detection.score < DETECTION_SCORE_THRESHOLD) {
              resetStability();
              setStatus("no-face");
              return;
            }
            const {
              x,
              y,
              width,
              height,
            } = detection.box;

            const videoWidth =
              video.videoWidth;

            const videoHeight =
              video.videoHeight;

            if (
              !videoWidth ||
              !videoHeight
            ) {
              return;
            }

            const faceArea =
              (width * height) /
              (videoWidth * videoHeight);

            if (faceArea < FACE_MIN_AREA) {
              resetStability();
              setStatus("too-far");
              return;
            }

            if (faceArea > FACE_MAX_AREA) {
              resetStability();
              setStatus("too-close");
              return;
            }

            const faceCenterX =
              x + width / 2;

            const faceCenterY =
              y + height / 2;

            const videoCenterX =
              videoWidth / 2;

            const videoCenterY =
              videoHeight / 2;

            const offsetX =
              (faceCenterX -
                videoCenterX) /
              videoWidth;

            const offsetY =
              (faceCenterY -
                videoCenterY) /
              videoHeight;

            if (
              offsetX <
              -CENTER_TOLERANCE_X
            ) {
              resetStability();
              setStatus("move-right");
              return;
            }

            if (
              offsetX >
              CENTER_TOLERANCE_X
            ) {
              resetStability();
              setStatus("move-left");
              return;
            }

            if (
              offsetY <
              -CENTER_TOLERANCE_Y
            ) {
              resetStability();
              setStatus("move-down");
              return;
            }

            if (
              offsetY >
              CENTER_TOLERANCE_Y
            ) {
              resetStability();
              setStatus("move-up");
              return;
            }

            stableFramesRef.current += 1;

            const progress = Math.min(
              100,
              (stableFramesRef.current /
                REQUIRED_STABLE_FRAMES) *
              100,
            );

            setStableProgress(progress);
            setStatus("good");

            if (
              stableFramesRef.current <
              REQUIRED_STABLE_FRAMES
            ) {
              return;
            }

            setStatus("recognizing");

            const recognition =
              await faceapi
                .detectSingleFace(
                  video,
                  new faceapi.TinyFaceDetectorOptions({
                    inputSize: 320,
                    scoreThreshold: DETECTION_SCORE_THRESHOLD,
                  }),
                )
                .withFaceLandmarks()
                .withFaceDescriptor();

            if (!recognition) {
              resetStability();
              setStatus("no-face");
              return;
            }

            const descriptorArray =
              Array.from(
                recognition.descriptor,
              );

            if (
              descriptorArray.length !== 128
            ) {
              throw new Error(
                "Invalid face descriptor.",
              );
            }

            setStatus(
              "descriptor-ready",
            );

            if (intervalRef.current) {
              clearInterval(
                intervalRef.current,
              );

              intervalRef.current = null;
            }

            successTimeoutRef.current =
              setTimeout(() => {
                if (!mounted) return;

                onFaceCaptured(
                  descriptorArray,
                );
              }, 500);
          } catch (error) {
            console.error(
              "Face detection error:",
              error,
            );

            resetStability();
          } finally {
            processingRef.current = false;
          }
        },
        250,
      );
    }

    initialize();

    return () => {
      mounted = false;

      if (intervalRef.current) {
        clearInterval(
          intervalRef.current,
        );

        intervalRef.current = null;
      }

      if (successTimeoutRef.current) {
        clearTimeout(
          successTimeoutRef.current,
        );
      }

      stream?.getTracks().forEach(
        (track) => track.stop(),
      );
    };
  }, [onFaceCaptured]);

  const config =
    STATUS_CONFIG[status];

  const isSuccess =
    config.type === "success";

  const isWarning =
    config.type === "warning";

  const isError =
    config.type === "error";

  const isLoading =
    status === "loading" ||
    status === "starting";

  const isProcessing =
    status === "recognizing";

  return (
    <main className="h-dvh w-full overflow-hidden bg-background">
      <div className="flex h-full w-full flex-col lg:flex-row">
        <section className="relative min-h-0 flex-1 overflow-hidden bg-black lg:w-[78%] lg:flex-none">
          <video
            ref={videoRef}
            muted
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
          />

          <div className="pointer-events-none absolute inset-0 bg-black/10" />

          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div
              className={[
                "relative aspect-[0.72] h-[68%] max-h-[760px] rounded-[50%] border-[4px] transition-all duration-300 sm:h-[72%] lg:h-[70%] xl:h-[74%]",

                isSuccess
                  ? "border-green-400 shadow-[0_0_50px_rgba(74,222,128,0.65)]"
                  : isError
                    ? "border-red-400 shadow-[0_0_50px_rgba(248,113,113,0.55)]"
                    : isWarning
                      ? "border-yellow-400 shadow-[0_0_50px_rgba(250,204,21,0.5)]"
                      : "border-white/80",
              ].join(" ")}
            >
              <div
                className={[
                  "absolute left-1/2 top-0 h-3 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full transition-colors",

                  isSuccess
                    ? "bg-green-400"
                    : isError
                      ? "bg-red-400"
                      : isWarning
                        ? "bg-yellow-400"
                        : "bg-white",
                ].join(" ")}
              />

              {status === "good" && (
                <div className="absolute inset-x-[12%] bottom-[8%] h-2 overflow-hidden rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-green-400 transition-all duration-200"
                    style={{
                      width: `${stableProgress}%`,
                    }}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="absolute bottom-5 left-5 right-5 sm:bottom-8 sm:left-8 sm:right-auto">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-md">
              <span
                className={[
                  "size-2.5 rounded-full",

                  isSuccess
                    ? "bg-green-400"
                    : isError
                      ? "bg-red-400"
                      : isWarning
                        ? "bg-yellow-400"
                        : "bg-white",
                ].join(" ")}
              />

              {isProcessing
                ? "Checking visitor..."
                : isSuccess
                  ? "Ready"
                  : isError
                    ? "Attention required"
                    : isWarning
                      ? "Please adjust your position"
                      : "Scanner starting"}
            </div>
          </div>

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/65">
              <div className="px-6 text-center text-white">
                <div className="mx-auto mb-5 size-14 animate-spin rounded-full border-4 border-white/20 border-t-white" />

                <h2 className="text-xl font-bold sm:text-2xl">
                  {config.title}
                </h2>

                <p className="mt-2 text-sm text-white/75 sm:text-base">
                  {config.description}
                </p>
              </div>
            </div>
          )}
        </section>

        <aside className="flex h-[31dvh] w-full shrink-0 flex-col border-t bg-background lg:h-full lg:w-[22%] lg:border-l lg:border-t-0">
          <div className="flex min-h-0 flex-1 flex-col p-4 sm:p-6 lg:p-6 xl:p-8">
            <div className="shrink-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
                Visitor Scanner
              </p>

              <h1 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
                {isSuccess
                  ? "Perfect!"
                  : isError
                    ? "Attention"
                    : isWarning
                      ? "Please Adjust"
                      : isProcessing
                        ? "Please Wait"
                        : "Welcome"}
              </h1>
            </div>

            <div
              className={[
                "mt-3 flex min-h-0 flex-1 items-center rounded-2xl border-2 p-4 sm:p-5 lg:mt-6 lg:flex-none lg:p-6",

                isSuccess
                  ? "border-green-500/40 bg-green-500/10"
                  : isError
                    ? "border-red-500/40 bg-red-500/10"
                    : isWarning
                      ? "border-yellow-500/40 bg-yellow-500/10"
                      : "border-border bg-muted/30",
              ].join(" ")}
            >
              <div className="w-full">
                <div
                  className={[
                    "flex size-12 items-center justify-center rounded-full text-2xl font-bold sm:size-14 sm:text-3xl",

                    isSuccess
                      ? "bg-green-500 text-white"
                      : isError
                        ? "bg-red-500 text-white"
                        : isWarning
                          ? "bg-yellow-500 text-white"
                          : "bg-muted text-foreground",
                  ].join(" ")}
                >
                  {isLoading ||
                    isProcessing ? (
                    <div className="size-6 animate-spin rounded-full border-3 border-current/20 border-t-current" />
                  ) : (
                    config.icon
                  )}
                </div>

                <h2 className="mt-3 text-lg font-bold sm:text-xl lg:text-2xl">
                  {config.title}
                </h2>

                <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm sm:leading-6">
                  {config.description}
                </p>

                {status === "good" && (
                  <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                      <span>
                        Hold still
                      </span>

                      <span>
                        {Math.round(
                          stableProgress,
                        )}
                        %
                      </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-green-500/15">
                      <div
                        className="h-full rounded-full bg-green-500 transition-all duration-200"
                        style={{
                          width: `${stableProgress}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {status ===
                  "multiple-faces" && (
                    <div className="mt-4 rounded-xl bg-red-500/10 p-3">
                      <p className="text-xs font-semibold leading-5 text-red-700 dark:text-red-400 sm:text-sm">
                        Please ask the other
                        person to step away
                        from the camera.
                      </p>
                    </div>
                  )}
              </div>
            </div>

            <div className="mt-3 hidden space-y-2 lg:block">
              <MiniInstruction
                active={
                  status === "no-face"
                }
                text="Look at the camera"
              />

              <MiniInstruction
                active={
                  status === "too-far"
                }
                text="Move closer"
              />

              <MiniInstruction
                active={
                  status === "too-close"
                }
                text="Move back"
              />

              <MiniInstruction
                active={
                  status === "move-left" ||
                  status === "move-right" ||
                  status === "move-up" ||
                  status === "move-down"
                }
                text="Center your face"
              />

              <MiniInstruction
                active={
                  status === "good"
                }
                text="Hold still"
              />
            </div>

            <div className="mt-auto hidden border-t pt-4 lg:block">
              <p className="text-[30px] leading-9 text-muted-foreground">
                Follow the instruction shown
                above. The scanner will
                continue automatically.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

function MiniInstruction({
  active,
  text,
}: {
  active: boolean;
  text: string;
}) {
  return (
    <div
      className={[
        "flex items-center gap-2 rounded-lg px-3 py-2 text-4xl transition-all",

        active
          ? "bg-primary/10 font-semibold text-primary"
          : "text-muted-foreground",
      ].join(" ")}
    >
      <span
        className={[
          "size-1.5 rounded-full",

          active
            ? "bg-primary"
            : "bg-muted-foreground/30",
        ].join(" ")}
      />

      {text}
    </div>
  );
}