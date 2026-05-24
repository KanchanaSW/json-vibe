"use client";

import { useCallback, useEffect, useRef } from "react";
import { useScreenshotJsonStore } from "@/store/screenshot-json-store";
import type { ApiErrorResponse, GenerateResponse } from "@/types/ui-schema";

export interface ToastMessage {
  type: "success" | "warning" | "error";
  message: string;
  action?: { label: string; href: string };
}

export function useGenerate(onToast?: (toast: ToastMessage) => void) {
  const abortRef = useRef<AbortController | null>(null);
  const {
    imageFile,
    thumbnailUrl,
    setStatus,
    setResult,
    setError,
  } = useScreenshotJsonStore();

  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  const generate = useCallback(async () => {
    if (!imageFile) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus("uploading");

    const formData = new FormData();
    formData.append("file", imageFile);
    if (thumbnailUrl) {
      formData.append("thumbnail", thumbnailUrl);
    }

    try {
      setStatus("ocr");

      const response = await fetch("/api/screenshot-json/generate", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      setStatus("ai");

      const data = await response.json();

      if (!response.ok) {
        const err = data as ApiErrorResponse;
        setError(err);
        onToast?.({ type: "error", message: err.error });
        return;
      }

      const result = data as GenerateResponse;
      setResult(
        result.ocr,
        result.result,
        result.ocrFailed,
        result.generationId
      );

      if (result.ocrFailed) {
        onToast?.({
          type: "warning",
          message: "OCR failed — using vision-only analysis",
        });
      } else if (result.historySaveFailed) {
        onToast?.({
          type: "warning",
          message: "JSON generated but history could not be saved",
        });
      } else {
        onToast?.({ type: "success", message: "JSON generated successfully" });
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      const apiError: ApiErrorResponse = {
        error: err instanceof Error ? err.message : "Request failed",
        step: "ai",
        retryable: true,
      };
      setError(apiError);
      onToast?.({ type: "error", message: apiError.error });
    }
  }, [imageFile, thumbnailUrl, setStatus, setResult, setError, onToast]);

  const retry = useCallback(() => {
    const { error } = useScreenshotJsonStore.getState();
    if (error?.retryable) {
      generate();
    }
  }, [generate]);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    setStatus("idle");
  }, [setStatus]);

  return { generate, retry, abort };
}
