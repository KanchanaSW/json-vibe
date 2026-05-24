type ButtonVariant = "primary" | "secondary";
type PageType = "dashboard" | "landing" | "form" | "other";
type PageTheme = "dark" | "light";

function coerceButtonVariant(value: unknown): ButtonVariant | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") return undefined;
  const v = value.toLowerCase().trim();
  if (v === "primary" || v === "secondary") return v;
  if (v.includes("secondary") || v.includes("outline") || v.includes("ghost")) {
    return "secondary";
  }
  return "primary";
}

function coercePageType(value: unknown): PageType {
  if (typeof value !== "string") return "other";
  const v = value.toLowerCase().trim();
  if (v === "dashboard" || v === "landing" || v === "form" || v === "other") {
    return v;
  }
  return "other";
}

function coercePageTheme(value: unknown): PageTheme {
  if (typeof value !== "string") return "light";
  const v = value.toLowerCase().trim();
  if (v === "dark" || v === "light") return v;
  return "light";
}

function coerceNumber(value: unknown, fallback = 1): number {
  if (typeof value === "number" && !Number.isNaN(value)) {
    return Math.max(1, Math.round(value));
  }
  if (typeof value === "string") {
    const n = parseInt(value, 10);
    if (!Number.isNaN(n)) return Math.max(1, n);
  }
  return fallback;
}

function sanitizeButton(raw: unknown): Record<string, unknown> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const btn = raw as Record<string, unknown>;
  const variant = coerceButtonVariant(btn.variant);
  const result: Record<string, unknown> = {
    label: typeof btn.label === "string" ? btn.label : String(btn.label ?? ""),
    background_color:
      typeof btn.background_color === "string" ? btn.background_color : "",
    text_color: typeof btn.text_color === "string" ? btn.text_color : "",
  };
  if (variant) result.variant = variant;
  return result;
}

function sanitizeCard(raw: unknown): Record<string, unknown> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const card = raw as Record<string, unknown>;
  const icons = Array.isArray(card.icons)
    ? card.icons.map((icon) => {
        if (!icon || typeof icon !== "object") return { icon_url: "", text: "" };
        const i = icon as Record<string, unknown>;
        return {
          icon_url: typeof i.icon_url === "string" ? i.icon_url : "",
          text: typeof i.text === "string" ? i.text : undefined,
        };
      })
    : undefined;

  const button = card.button ? sanitizeButton(card.button) : undefined;

  return {
    title:
      typeof card.title === "string" ? card.title : String(card.title ?? ""),
    value: typeof card.value === "string" ? card.value : undefined,
    ...(icons ? { icons } : {}),
    ...(button ? { button } : {}),
  };
}

function sanitizeSection(raw: unknown): Record<string, unknown> | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const section = raw as Record<string, unknown>;
  const type = typeof section.type === "string" ? section.type : "other";

  switch (type) {
    case "navbar":
    case "sidebar":
    case "list":
      return {
        type,
        items: Array.isArray(section.items)
          ? section.items.map((i) => String(i))
          : [],
      };
    case "hero":
      return {
        type: "hero",
        title:
          typeof section.title === "string"
            ? section.title
            : String(section.title ?? ""),
        subtitle:
          typeof section.subtitle === "string" ? section.subtitle : undefined,
        image_url:
          typeof section.image_url === "string" ? section.image_url : "",
      };
    case "card_grid":
      return {
        type: "card_grid",
        columns: coerceNumber(section.columns, 1),
        cards: Array.isArray(section.cards)
          ? section.cards
              .map(sanitizeCard)
              .filter((c): c is Record<string, unknown> => c !== undefined)
          : [],
      };
    case "buttons":
      return {
        type: "buttons",
        items: Array.isArray(section.items)
          ? section.items
              .map(sanitizeButton)
              .filter((b): b is Record<string, unknown> => b !== undefined)
          : [],
      };
    case "form":
      return {
        type: "form",
        fields: Array.isArray(section.fields)
          ? section.fields.map((field) => {
              if (!field || typeof field !== "object") {
                return { label: "" };
              }
              const f = field as Record<string, unknown>;
              return {
                label:
                  typeof f.label === "string"
                    ? f.label
                    : String(f.label ?? ""),
                type: typeof f.type === "string" ? f.type : undefined,
                placeholder:
                  typeof f.placeholder === "string"
                    ? f.placeholder
                    : undefined,
              };
            })
          : [],
      };
    default:
      return undefined;
  }
}

/** Sanitize raw AI JSON before Zod validation. */
export function sanitizeAiUiJson(raw: unknown): unknown {
  if (!raw || typeof raw !== "object") return raw;
  const root = raw as Record<string, unknown>;
  const pageRaw = root.page;
  if (!pageRaw || typeof pageRaw !== "object") return raw;

  const page = pageRaw as Record<string, unknown>;
  const sections = Array.isArray(page.sections)
    ? page.sections
        .map(sanitizeSection)
        .filter((s): s is Record<string, unknown> => s !== undefined)
    : [];

  return {
    page: {
      type: coercePageType(page.type),
      theme: coercePageTheme(page.theme),
      sections,
    },
  };
}
