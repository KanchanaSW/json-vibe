import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { saveGeneration } from "@/lib/convex-server";
import { runOcr } from "@/services/ocr";
import {
  isAiTimeoutError,
  isConfigError,
  parseUiLayout,
} from "@/services/groq-parser";
import type { ApiErrorResponse } from "@/types/ui-schema";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_MIMES = new Set([
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
]);

function errorResponse(
  error: string,
  step: ApiErrorResponse["step"],
  retryable: boolean,
  status: number
) {
  return NextResponse.json({ error, step, retryable } satisfies ApiErrorResponse, {
    status,
  });
}

export async function POST(request: Request) {
  const { userId, getToken } = await auth();
  if (!userId) {
    return errorResponse(
      "Sign in with Google required",
      "validation",
      false,
      401
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const thumbnail = formData.get("thumbnail");
    const thumbnailDataUrl =
      typeof thumbnail === "string" && thumbnail.startsWith("data:")
        ? thumbnail
        : undefined;

    if (!file || !(file instanceof File)) {
      return errorResponse(
        "A file is required",
        "validation",
        false,
        400
      );
    }

    if (!ALLOWED_MIMES.has(file.type)) {
      return errorResponse(
        "File must be PNG, JPG, or WebP",
        "validation",
        false,
        400
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(
        "File must be 10MB or smaller",
        "validation",
        false,
        400
      );
    }

  if (!process.env.GROQ_API_KEY) {
    return errorResponse(
      "Server not configured",
      "config",
      false,
      500
    );
  }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mimeType = file.type === "image/jpg" ? "image/jpeg" : file.type;

    const { textBlocks, ocrFailed } = await runOcr(buffer);

    let result;
    try {
      result = await parseUiLayout(buffer, mimeType, textBlocks);
    } catch (err) {
      if (isConfigError(err)) {
        return errorResponse(
          "Server not configured",
          "config",
          false,
          500
        );
      }
      if (isAiTimeoutError(err)) {
        return errorResponse(
          err instanceof Error ? err.message : "AI timed out",
          "ai",
          true,
          504
        );
      }
      return errorResponse(
        err instanceof Error ? err.message : "AI parsing failed",
        "ai",
        true,
        502
      );
    }

    let generationId: string | undefined;
    let historySaveFailed = false;

    try {
      const token = await getToken({ template: "convex" });
      if (token && process.env.NEXT_PUBLIC_CONVEX_URL) {
        generationId = await saveGeneration(token, {
          ocr: textBlocks,
          uiJson: result,
          ocrFailed: ocrFailed || undefined,
          thumbnailDataUrl,
        });
      }
    } catch (err) {
      console.error("Failed to save generation to Convex:", err);
      historySaveFailed = true;
    }

    return NextResponse.json({
      ocr: textBlocks,
      result,
      ...(ocrFailed ? { ocrFailed: true } : {}),
      ...(generationId ? { generationId } : {}),
      ...(historySaveFailed ? { historySaveFailed: true } : {}),
    });
  } catch (err) {
    return errorResponse(
      err instanceof Error ? err.message : "Unexpected server error",
      "ai",
      true,
      502
    );
  }
}
