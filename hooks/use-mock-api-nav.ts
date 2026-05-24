"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useScreenshotJsonStore } from "@/store/screenshot-json-store";
import type { ToastMessage } from "@/hooks/use-generate";

export function useMockApiNav(onToast?: (toast: ToastMessage) => void) {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const createGeneration = useMutation(api.generations.create);

  const generationId = useScreenshotJsonStore((s) => s.generationId);
  const uiJson = useScreenshotJsonStore((s) => s.uiJson);
  const ocrResult = useScreenshotJsonStore((s) => s.ocrResult);
  const ocrFailed = useScreenshotJsonStore((s) => s.ocrFailed);
  const thumbnailUrl = useScreenshotJsonStore((s) => s.thumbnailUrl);
  const setGenerationId = useScreenshotJsonStore((s) => s.setGenerationId);

  const openMockApi = useCallback(async () => {
    if (!isSignedIn) {
      router.push("/sign-in");
      return;
    }

    if (!uiJson) {
      onToast?.({
        type: "error",
        message: "Generate JSON first before creating a mock API",
      });
      return;
    }

    let id = generationId;

    if (!id) {
      try {
        id = await createGeneration({
          ocr: ocrResult,
          uiJson,
          ocrFailed: ocrFailed || undefined,
          thumbnailDataUrl: thumbnailUrl ?? undefined,
        });
        setGenerationId(id);
      } catch {
        onToast?.({
          type: "error",
          message:
            "Could not save generation. Check Convex is running and try again.",
        });
        return;
      }
    }

    router.push(`/tools/screenshot-json/mock/${id}`);
  }, [
    isSignedIn,
    uiJson,
    generationId,
    ocrResult,
    ocrFailed,
    thumbnailUrl,
    createGeneration,
    setGenerationId,
    router,
    onToast,
  ]);

  return { openMockApi, isSignedIn };
}
