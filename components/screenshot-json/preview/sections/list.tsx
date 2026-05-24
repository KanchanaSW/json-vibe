import type { ListSection } from "@/types/ui-schema";

export function ListPreview({ section }: { section: ListSection }) {
  return (
    <ul className="p-4 space-y-2">
      {section.items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm">
          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-current opacity-50 shrink-0" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
