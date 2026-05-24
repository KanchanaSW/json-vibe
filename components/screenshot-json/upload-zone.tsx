"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, X, ImageIcon } from "lucide-react";
import {
  resizeImage,
  revokePreviewUrl,
  validateImageFile,
} from "@/lib/image-utils";
import { useScreenshotJsonStore } from "@/store/screenshot-json-store";

export default function UploadZone() {
  const [dragOver, setDragOver] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { imagePreview, imageFile, setImage, clearImage } =
    useScreenshotJsonStore();

  const handleFile = useCallback(
    async (file: File) => {
      setLocalError(null);
      const validationError = validateImageFile(file);
      if (validationError) {
        setLocalError(validationError);
        return;
      }

      setProcessing(true);
      try {
        const { file: resized, previewUrl, thumbnailUrl } =
          await resizeImage(file);
        const prev = useScreenshotJsonStore.getState().imagePreview;
        if (prev) revokePreviewUrl(prev);
        setImage(resized, previewUrl, thumbnailUrl);
      } catch {
        setLocalError("Failed to process image");
      } finally {
        setProcessing(false);
      }
    },
    [setImage]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onClear = () => {
    if (imagePreview) revokePreviewUrl(imagePreview);
    clearImage();
    setLocalError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {!imagePreview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
            dragOver
              ? "border-primary/50 bg-primary/5"
              : "border-white/10 hover:border-primary/50"
          }`}
        >
          <Upload size={32} className="mx-auto mb-3 text-zinc-500" />
          <p className="text-sm text-zinc-300 mb-1">
            Drag & drop a screenshot here
          </p>
          <p className="text-xs text-zinc-500">
            PNG, JPG, WebP — max 10MB
          </p>
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
        </div>
      ) : (
        <div className="relative rounded-lg border border-white/10 overflow-hidden bg-zinc-900">
          <img
            src={imagePreview}
            alt="Upload preview"
            className="w-full max-h-64 object-contain"
          />
          <button
            onClick={onClear}
            className="absolute top-2 right-2 p-1.5 bg-black/70 hover:bg-black rounded-full text-zinc-300 hover:text-white"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {localError && (
        <p className="text-sm text-red-400">{localError}</p>
      )}

      {processing && (
        <p className="text-xs text-zinc-500">Resizing image...</p>
      )}
    </div>
  );
}
