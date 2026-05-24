import Tesseract from "tesseract.js";
import type { TextBlock } from "@/types/ocr";

const OCR_TIMEOUT_MS = 25_000;

function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(`${label} timed out after ${ms}ms`));
    }, ms);

    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export async function runOcr(
  buffer: Buffer
): Promise<{ textBlocks: TextBlock[]; ocrFailed: boolean }> {
  try {
    const result = await withTimeout(
      Tesseract.recognize(buffer, "eng", {
        logger: () => {},
      }),
      OCR_TIMEOUT_MS,
      "OCR"
    );

    const textBlocks: TextBlock[] = [];

    const blocks = result.data.blocks ?? [];
    for (const block of blocks) {
      for (const paragraph of block.paragraphs ?? []) {
        for (const line of paragraph.lines ?? []) {
          for (const word of line.words ?? []) {
            if (word.text?.trim()) {
              textBlocks.push({
                text: word.text.trim(),
                x: word.bbox.x0,
                y: word.bbox.y0,
                width: word.bbox.x1 - word.bbox.x0,
                height: word.bbox.y1 - word.bbox.y0,
              });
            }
          }
        }
      }
    }

    return { textBlocks, ocrFailed: false };
  } catch {
    return { textBlocks: [], ocrFailed: true };
  }
}
