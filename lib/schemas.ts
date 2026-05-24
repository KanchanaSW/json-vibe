import { z } from "zod";

function coerceButtonVariant(val: unknown): "primary" | "secondary" | undefined {
  if (val === undefined || val === null || val === "") return undefined;
  if (typeof val !== "string") return undefined;
  const v = val.toLowerCase().trim();
  if (v === "primary" || v === "secondary") return v;
  return "primary";
}

const buttonVariantSchema = z.preprocess(
  coerceButtonVariant,
  z.enum(["primary", "secondary"]).optional()
);

const buttonItemSchema = z.object({
  label: z.string(),
  variant: buttonVariantSchema,
  background_color: z.string().optional(),
  text_color: z.string().optional(),
});

const cardIconSchema = z.object({
  icon_url: z.string().optional(),
  text: z.string().optional(),
});

const cardItemSchema = z.object({
  title: z.string(),
  value: z.string().optional(),
  icons: z.array(cardIconSchema).optional(),
  button: buttonItemSchema.optional(),
});

const formFieldSchema = z.object({
  label: z.string(),
  type: z.string().optional(),
  placeholder: z.string().optional(),
});

const uiSectionSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("navbar"), items: z.array(z.string()) }),
  z.object({ type: z.literal("sidebar"), items: z.array(z.string()) }),
  z.object({
    type: z.literal("hero"),
    title: z.string(),
    subtitle: z.string().optional(),
    image_url: z.string().optional(),
  }),
  z.object({
    type: z.literal("card_grid"),
    columns: z.coerce.number().int().min(1),
    cards: z.array(cardItemSchema),
  }),
  z.object({ type: z.literal("list"), items: z.array(z.string()) }),
  z.object({ type: z.literal("buttons"), items: z.array(buttonItemSchema) }),
  z.object({
    type: z.literal("form"),
    fields: z.array(formFieldSchema),
  }),
]);

export const uiPageSchema = z.object({
  page: z.object({
    type: z.preprocess(
      (v) =>
        typeof v === "string" &&
        ["dashboard", "landing", "form", "other"].includes(v.toLowerCase())
          ? v.toLowerCase()
          : "other",
      z.enum(["dashboard", "landing", "form", "other"])
    ),
    theme: z.preprocess(
      (v) =>
        typeof v === "string" && ["dark", "light"].includes(v.toLowerCase())
          ? v.toLowerCase()
          : "light",
      z.enum(["dark", "light"])
    ),
    sections: z.array(uiSectionSchema),
  }),
});

export type UiPageInput = z.infer<typeof uiPageSchema>;
