import { create } from "zustand";
import type { TextBlock } from "@/types/ocr";
import type { ApiErrorResponse, UiPage } from "@/types/ui-schema";

export type PipelineStatus =
  | "idle"
  | "uploading"
  | "ocr"
  | "ai"
  | "done"
  | "error";

interface ScreenshotJsonState {
  imageFile: File | null;
  imagePreview: string | null;
  ocrResult: TextBlock[];
  uiJson: UiPage | null;
  status: PipelineStatus;
  error: ApiErrorResponse | null;
  ocrFailed: boolean;
  thumbnailUrl: string | null;
  generationId: string | null;

  setImage: (file: File, previewUrl: string, thumbnailUrl: string) => void;
  setGenerationId: (id: string | null) => void;
  clearImage: () => void;
  setStatus: (status: PipelineStatus) => void;
  setResult: (
    ocr: TextBlock[],
    uiJson: UiPage,
    ocrFailed?: boolean,
    generationId?: string
  ) => void;
  setError: (error: ApiErrorResponse) => void;
  loadFromHistory: (data: {
    id: string;
    thumbnail: string;
    ocr: TextBlock[];
    uiJson: UiPage;
  }) => void;
  reset: () => void;
}

const initialState = {
  imageFile: null as File | null,
  imagePreview: null as string | null,
  ocrResult: [] as TextBlock[],
  uiJson: null as UiPage | null,
  status: "idle" as PipelineStatus,
  error: null as ApiErrorResponse | null,
  ocrFailed: false,
  thumbnailUrl: null as string | null,
  generationId: null as string | null,
};

export const useScreenshotJsonStore = create<ScreenshotJsonState>((set) => ({
  ...initialState,

  setImage: (file, previewUrl, thumbnailUrl) =>
    set({
      imageFile: file,
      imagePreview: previewUrl,
      thumbnailUrl,
      error: null,
      ocrFailed: false,
      status: "idle",
      ocrResult: [],
      uiJson: null,
      generationId: null,
    }),

  setGenerationId: (generationId) => set({ generationId }),

  clearImage: () => set({ ...initialState }),

  setStatus: (status) => set({ status }),

  setResult: (ocr, uiJson, ocrFailed = false, generationId) =>
    set({
      ocrResult: ocr,
      uiJson,
      ocrFailed,
      status: "done",
      error: null,
      ...(generationId !== undefined ? { generationId } : {}),
    }),

  setError: (error) => set({ error, status: "error" }),

  loadFromHistory: ({ id, thumbnail, ocr, uiJson }) =>
    set({
      imageFile: null,
      imagePreview: thumbnail,
      thumbnailUrl: thumbnail,
      ocrResult: ocr,
      uiJson,
      generationId: id,
      status: "done",
      error: null,
      ocrFailed: false,
    }),

  reset: () => set({ ...initialState }),
}));
