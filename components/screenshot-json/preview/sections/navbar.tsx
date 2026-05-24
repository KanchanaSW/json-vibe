import type { NavbarSection } from "@/types/ui-schema";

export function NavbarPreview({ section }: { section: NavbarSection }) {
  return (
    <nav className="flex flex-wrap gap-2 px-4 py-3 border-b border-white/10">
      {section.items.map((item, i) => (
        <span
          key={i}
          className="px-3 py-1 text-sm rounded-full bg-white/10 text-inherit"
        >
          {item}
        </span>
      ))}
    </nav>
  );
}
