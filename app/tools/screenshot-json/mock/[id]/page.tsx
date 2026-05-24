"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Copy, Globe, Power } from "lucide-react";
import { json } from "@codemirror/lang-json";
import { oneDark } from "@codemirror/theme-one-dark";
import FeatureHeader from "@/components/screenshot-json/feature-header";
import Toast from "@/components/screenshot-json/toast";
import { useMockApiEditor } from "@/hooks/use-mock-api-editor";
import type { ToastMessage } from "@/hooks/use-generate";

const CodeMirror = dynamic(
  () => import("@uiw/react-codemirror").then((m) => m.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] flex items-center justify-center text-zinc-500 text-sm">
        Loading editor...
      </div>
    ),
  }
);

type SaveStatus = "idle" | "saving" | "saved" | "invalid" | "error";

const AUTO_SAVE_MS = 600;

export default function MockApiEditorPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : "";

  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [editorValue, setEditorValue] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [disabling, setDisabling] = useState(false);

  const lastSavedRef = useRef("");
  const skipAutoSaveRef = useRef(false);

  const { loaded, notFound, mockApiEnabled, initialJson, save, disable } =
    useMockApiEditor(id);

  const apiUrl = useMemo(() => {
    if (typeof window === "undefined" || !id) return "";
    return `${window.location.origin}/api/screenshot-json/mock/${id}`;
  }, [id]);

  useEffect(() => {
    if (initialJson === null || initialized) return;
    const formatted = JSON.stringify(initialJson, null, 2);
    skipAutoSaveRef.current = true;
    setEditorValue(formatted);
    lastSavedRef.current = formatted;
    setInitialized(true);
  }, [initialJson, initialized]);

  useEffect(() => {
    if (!initialized || notFound || !loaded) return;
    if (skipAutoSaveRef.current) {
      skipAutoSaveRef.current = false;
      return;
    }
    if (editorValue === lastSavedRef.current) {
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(editorValue);
    } catch {
      setSaveStatus("invalid");
      return;
    }

    setSaveStatus("saving");
    const timer = setTimeout(() => {
      void (async () => {
        try {
          await save(parsed);
          lastSavedRef.current = editorValue;
          setSaveStatus("saved");
        } catch {
          setSaveStatus("error");
          setToast({ type: "error", message: "Failed to save changes" });
        }
      })();
    }, AUTO_SAVE_MS);

    return () => clearTimeout(timer);
  }, [editorValue, initialized, notFound, loaded, save]);

  const handleCopyUrl = useCallback(async () => {
    if (!apiUrl) return;
    await navigator.clipboard.writeText(apiUrl);
    setToast({ type: "success", message: "API URL copied to clipboard" });
  }, [apiUrl]);

  const handleDisable = useCallback(async () => {
    setDisabling(true);
    try {
      await disable();
      setToast({
        type: "success",
        message: "Mock API disabled — public endpoint returns 404",
      });
    } catch {
      setToast({ type: "error", message: "Failed to disable mock API" });
    } finally {
      setDisabling(false);
    }
  }, [disable]);

  const statusLabel =
    saveStatus === "saving"
      ? "Saving…"
      : saveStatus === "saved"
        ? "Saved"
        : saveStatus === "invalid"
          ? "Invalid JSON"
          : saveStatus === "error"
            ? "Save failed"
            : null;

  return (
    <div className="flex flex-col h-[100dvh] w-screen overflow-hidden bg-black text-white">
      <FeatureHeader />

      <main className="flex-1 overflow-auto custom-scrollbar p-4 lg:p-6">
        <div className="max-w-4xl mx-auto space-y-4">
          <div className="flex items-center gap-3">
            <Link
              href="/tools/screenshot-json"
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={14} />
              Back to Generate
            </Link>
          </div>

          <div className="flex items-center gap-2">
            <Globe size={20} className="text-primary" />
            <h1 className="text-xl font-bold">Mock API Editor</h1>
          </div>
          <p className="text-sm text-zinc-400">
            Edit the JSON returned by your public mock endpoint. Changes save
            automatically when the JSON is valid.
          </p>

          {!loaded ? (
            <p className="text-zinc-500 text-sm">Loading...</p>
          ) : notFound ? (
            <div className="rounded-lg border border-dashed border-white/10 p-8 text-center text-zinc-500 text-sm">
              Generation not found or you do not have access to edit this mock
              API.
            </div>
          ) : (
            <>
              <div className="rounded-lg border border-white/10 bg-zinc-900 p-4 space-y-2">
                <label className="text-xs font-medium text-zinc-400 uppercase tracking-wide">
                  Public API URL
                </label>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={apiUrl}
                    className="flex-1 px-3 py-2 text-sm font-mono bg-black/40 border border-white/10 rounded text-zinc-300"
                  />
                  <button
                    type="button"
                    onClick={handleCopyUrl}
                    className="flex items-center gap-1 px-3 py-2 text-xs text-zinc-300 bg-zinc-800 hover:bg-zinc-700 rounded border border-white/10 shrink-0"
                  >
                    <Copy size={14} />
                    Copy
                  </button>
                </div>
                {!mockApiEnabled && (
                  <p className="text-xs text-amber-400/90">
                    Mock API is disabled. Valid edits will re-enable the public
                    endpoint automatically.
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-white/10 bg-bg-panel overflow-hidden min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
                  <span className="text-xs text-zinc-400">Response JSON</span>
                  {statusLabel && (
                    <span
                      className={`text-xs ${
                        saveStatus === "invalid" || saveStatus === "error"
                          ? "text-red-400"
                          : saveStatus === "saved"
                            ? "text-emerald-400"
                            : "text-zinc-500"
                      }`}
                    >
                      {statusLabel}
                    </span>
                  )}
                </div>
                <div className="flex-1 min-h-[400px]">
                  <CodeMirror
                    value={editorValue}
                    height="400px"
                    extensions={[json()]}
                    onChange={setEditorValue}
                    theme={oneDark}
                    basicSetup={{ lineNumbers: true, foldGutter: true }}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleDisable}
                  disabled={disabling || !mockApiEnabled}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm text-zinc-300 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-40 rounded border border-white/10 transition-colors"
                >
                  <Power size={14} />
                  {disabling ? "Disabling..." : "Disable mock API"}
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  );
}
