import type { SidebarSection } from "@/types/ui-schema";

export function SidebarPreview({ section }: { section: SidebarSection }) {
  return (
    <aside className="w-48 shrink-0 border-r border-white/10 py-3 px-2">
      {section.items.map((item, i) => (
        <div
          key={i}
          className="px-3 py-2 text-sm rounded hover:bg-white/5 text-inherit"
        >
          {item}
        </div>
      ))}
    </aside>
  );
}
