import Groq from "groq-sdk";
import { sanitizeAiUiJson } from "@/lib/coerce-ai-ui";
import { uiPageSchema } from "@/lib/schemas";
import { normalizeUiPage } from "@/lib/normalize-ui";
import type { TextBlock } from "@/types/ocr";
import type { UiPage } from "@/types/ui-schema";

const AI_TIMEOUT_MS = 45_000;
const MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const SYSTEM_PROMPT = `You are a UI layout analyzer. Given a screenshot and optional OCR text blocks, produce structured JSON describing the page layout.

Return ONLY valid JSON matching this schema:
{
  "page": {
    "type": "dashboard" | "landing" | "form" | "other",
    "theme": "dark" | "light",
    "sections": [
      { "type": "navbar", "items": string[] },
      { "type": "sidebar", "items": string[] },
      { "type": "hero", "title": string, "subtitle"?: string, "image_url"?: "" },
      { "type": "card_grid", "columns": number, "cards": [{ "title": string, "value"?: string, "icons"?: [{ "icon_url": "", "text"?: string }], "button"?: { "label": string, "variant"?: "primary"|"secondary", "background_color"?: "", "text_color"?: "" } }] },
      { "type": "list", "items": string[] },
      { "type": "buttons", "items": [{ "label": string, "variant"?: "primary"|"secondary", "background_color"?: "", "text_color"?: "" }] },
      { "type": "form", "fields": [{ "label": string, "type"?: string, "placeholder"?: string }] }
    ]
  }
}

Rules:
- Use empty strings "" for image_url, icon_url, background_color, text_color when unknown
- CTAs inside cards use card.button; standalone button rows use a buttons section
- Infer page type and theme from the screenshot
- Include all visible text content from OCR when available`;

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

function buildOcrContext(textBlocks: TextBlock[]): string {
  if (textBlocks.length === 0) return "No OCR text available.";
  return textBlocks
    .map(
      (b) =>
        `"${b.text}" at (${Math.round(b.x)},${Math.round(b.y)}) ${Math.round(b.width)}x${Math.round(b.height)}`
    )
    .join("\n");
}

export async function parseUiLayout(
  buffer: Buffer,
  mimeType: string,
  textBlocks: TextBlock[]
): Promise<UiPage> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is not configured");
  }

  const groq = new Groq({ apiKey });
  const base64 = buffer.toString("base64");
  const ocrContext = buildOcrContext(textBlocks);

  const completion = await withTimeout(
    groq.chat.completions.create({
      model: MODEL,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this UI screenshot and return layout JSON.\n\nOCR text blocks:\n${ocrContext}`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 4096,
    }),
    AI_TIMEOUT_MS,
    "AI"
  );

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("AI returned empty response");
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  const sanitized = sanitizeAiUiJson(parsed);
  const validated = uiPageSchema.parse(sanitized);
  return normalizeUiPage(validated);
}

export function isAiTimeoutError(err: unknown): boolean {
  return err instanceof Error && err.message.includes("AI timed out");
}

export function isConfigError(err: unknown): boolean {
  return err instanceof Error && err.message.includes("GROQ_API_KEY");
}
