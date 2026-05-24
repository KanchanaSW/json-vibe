"use client";

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { Sparkles } from "lucide-react";
import FeatureHeader from "@/components/screenshot-json/feature-header";
import UploadZone from "@/components/screenshot-json/upload-zone";
import ProcessPipeline from "@/components/screenshot-json/process-pipeline";
import Toast from "@/components/screenshot-json/toast";
import { useScreenshotJsonStore } from "@/store/screenshot-json-store";
import { useGenerate, type ToastMessage } from "@/hooks/use-generate";

const JsonViewer = dynamic(
  () => import("@/components/screenshot-json/json/json-viewer"),
  {
    ssr: false,
    loading: () => (
      <div className="h-64 flex items-center justify-center text-zinc-500 text-sm rounded-lg border border-white/10 bg-bg-panel">
        Loading JSON viewer...
      </div>
    ),
  }
);

export default function ScreenshotJsonPage() {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const { imageFile, uiJson, status, error } = useScreenshotJsonStore();

  const handleToast = useCallback((msg: ToastMessage) => {
    setToast(msg);
  }, []);

  const { generate, retry } = useGenerate(handleToast);

  const isGenerating = ["uploading", "ocr", "ai"].includes(status);
  const canGenerate = !!imageFile && !isGenerating;

  return (
    <div className="flex flex-col h-[100dvh] w-screen overflow-hidden bg-black text-white">
      <FeatureHeader />

      <main className="flex-1 overflow-auto custom-scrollbar p-4 lg:p-6">
        <section className="mb-6 max-w-3xl">
          <h1 className="text-xl font-bold mb-2">Screenshot → UI JSON</h1>
          <p className="text-sm text-zinc-400">
            Upload a Figma export or UI screenshot. We run{" "}
            <span className="text-accent">OCR</span> →{" "}
            <span className="text-accent">AI layout analysis</span> to produce
            structured semantic JSON.
          </p>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
          <div className="space-y-4">
            <div className="p-4 rounded-lg border border-white/10 bg-zinc-900">
              <UploadZone />
              <button
                onClick={() => generate()}
                disabled={!canGenerate}
                className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary hover:bg-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded font-medium text-sm transition-colors"
              >
                <Sparkles size={16} />
                Generate JSON
              </button>
            </div>
            <ProcessPipeline
              status={status}
              error={error}
              onRetry={retry}
            />
          </div>

          <div className="flex flex-col min-h-[400px]">
            {uiJson ? (
              <JsonViewer
                data={uiJson}
                onCopy={() =>
                  setToast({
                    type: "success",
                    message: "Copied to clipboard",
                  })
                }
                onMockApi={() =>
                  setToast({
                    type: "success",
                    message: "Mock API response copied to clipboard",
                  })
                }
              />
            ) : (
              <div className="flex-1 flex items-center justify-center rounded-lg border border-dashed border-white/10 text-zinc-500 text-sm min-h-[400px]">
                Upload a screenshot and click Generate JSON to see results
              </div>
            )}
          </div>
        </div>
      </main>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          action={toast.action}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
