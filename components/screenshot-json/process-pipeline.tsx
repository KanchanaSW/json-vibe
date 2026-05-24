"use client";

import type { PipelineStatus } from "@/store/screenshot-json-store";
import { Loader2, CheckCircle2, XCircle, Circle } from "lucide-react";

const STEPS: { key: PipelineStatus; label: string }[] = [
  { key: "uploading", label: "Uploading" },
  { key: "ocr", label: "OCR" },
  { key: "ai", label: "AI Analysis" },
  { key: "done", label: "Done" },
];

function stepIndex(status: PipelineStatus): number {
  switch (status) {
    case "uploading":
      return 0;
    case "ocr":
      return 1;
    case "ai":
      return 2;
    case "done":
      return 3;
    default:
      return -1;
  }
}

export default function ProcessPipeline({
  status,
  error,
  onRetry,
}: {
  status: PipelineStatus;
  error?: { error: string; retryable: boolean } | null;
  onRetry?: () => void;
}) {
  const activeIdx = stepIndex(status);
  const isRunning = ["uploading", "ocr", "ai"].includes(status);
  const isError = status === "error";
  const isDone = status === "done";

  if (status === "idle") return null;

  return (
    <div className="mt-4 p-4 rounded-lg border border-white/10 bg-zinc-900/50">
      <div className="flex items-center gap-4">
        {STEPS.map((step, i) => {
          const isActive = i === activeIdx && isRunning;
          const isComplete = isDone || (activeIdx >= 0 && i < activeIdx) || (isDone && i <= 3);
          const isFailed = isError && i === activeIdx;

          return (
            <div key={step.key} className="flex items-center gap-2">
              {isActive ? (
                <Loader2 size={16} className="text-accent animate-spin" />
              ) : isFailed ? (
                <XCircle size={16} className="text-red-400" />
              ) : isComplete ? (
                <CheckCircle2 size={16} className="text-green-400" />
              ) : (
                <Circle size={16} className="text-zinc-600" />
              )}
              <span
                className={`text-xs font-medium ${
                  isActive
                    ? "text-accent"
                    : isComplete
                      ? "text-zinc-300"
                      : "text-zinc-600"
                }`}
              >
                {step.label}
              </span>
              {i < STEPS.length - 1 && (
                <span className="text-zinc-700 mx-1">→</span>
              )}
            </div>
          );
        })}
      </div>
      {isError && error && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-sm text-red-400">{error.error}</p>
          {error.retryable && onRetry && (
            <button
              onClick={onRetry}
              className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-white rounded border border-white/10 shrink-0"
            >
              Retry
            </button>
          )}
        </div>
      )}
    </div>
  );
}
