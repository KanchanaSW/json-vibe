"use client";

import type { UiPage, UiSection } from "@/types/ui-schema";
import { NavbarPreview } from "./sections/navbar";
import { SidebarPreview } from "./sections/sidebar";
import { HeroPreview } from "./sections/hero";
import { CardGridPreview } from "./sections/card-grid";
import { ListPreview } from "./sections/list";
import { ButtonsPreview } from "./sections/buttons";
import { FormPreview } from "./sections/form";

function renderSection(section: UiSection, index: number) {
  switch (section.type) {
    case "navbar":
      return <NavbarPreview key={index} section={section} />;
    case "sidebar":
      return <SidebarPreview key={index} section={section} />;
    case "hero":
      return <HeroPreview key={index} section={section} />;
    case "card_grid":
      return <CardGridPreview key={index} section={section} />;
    case "list":
      return <ListPreview key={index} section={section} />;
    case "buttons":
      return <ButtonsPreview key={index} section={section} />;
    case "form":
      return <FormPreview key={index} section={section} />;
    default:
      return null;
  }
}

export default function PreviewRenderer({ data }: { data: UiPage }) {
  const { page } = data;
  const themeClass =
    page.theme === "light"
      ? "bg-zinc-100 text-zinc-900"
      : "bg-zinc-900 text-zinc-100";

  const hasSidebar = page.sections.some((s) => s.type === "sidebar");
  const mainSections = page.sections.filter((s) => s.type !== "sidebar");
  const sidebarSection = page.sections.find((s) => s.type === "sidebar");

  return (
    <div className="rounded-lg border border-white/10 overflow-hidden bg-bg-panel">
      <div className="px-3 py-2 border-b border-white/10 flex items-center justify-between">
        <span className="text-xs text-zinc-500 uppercase tracking-widest">
          Preview
        </span>
        <span className="text-xs text-zinc-500 capitalize">
          {page.type} · {page.theme}
        </span>
      </div>
      <div className={`${themeClass} min-h-[200px] max-h-[60vh] overflow-auto`}>
        {hasSidebar && sidebarSection && sidebarSection.type === "sidebar" ? (
          <div className="flex">
            <SidebarPreview section={sidebarSection} />
            <div className="flex-1 min-w-0">
              {mainSections.map((s, i) => renderSection(s, i))}
            </div>
          </div>
        ) : (
          page.sections.map((s, i) => renderSection(s, i))
        )}
      </div>
    </div>
  );
}
