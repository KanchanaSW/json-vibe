import type { ButtonsSection } from "@/types/ui-schema";
import { PreviewButton } from "../preview-button";

export function ButtonsPreview({ section }: { section: ButtonsSection }) {
  return (
    <div className="p-4 flex flex-wrap gap-3">
      {section.items.map((btn, i) => (
        <PreviewButton key={i} button={btn} />
      ))}
    </div>
  );
}
