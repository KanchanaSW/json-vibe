import type { ButtonItem } from "@/types/ui-schema";

export function PreviewButton({ button }: { button: ButtonItem }) {
  const hasCustomColors =
    button.background_color?.trim() && button.text_color?.trim();

  if (hasCustomColors) {
    return (
      <button
        type="button"
        className="px-4 py-2 rounded text-sm font-medium"
        style={{
          backgroundColor: button.background_color,
          color: button.text_color,
        }}
      >
        {button.label}
      </button>
    );
  }

  const cls =
    button.variant === "secondary"
      ? "px-4 py-2 rounded text-sm font-medium bg-zinc-800 text-zinc-300 border border-white/10"
      : "px-4 py-2 rounded text-sm font-medium bg-primary text-white";

  return (
    <button type="button" className={cls}>
      {button.label}
    </button>
  );
}
