import type { HeroSection } from "@/types/ui-schema";

export function HeroPreview({ section }: { section: HeroSection }) {
  return (
    <section className="p-6 flex flex-col md:flex-row gap-4 items-start">
      <div className="flex-1">
        <h1 className="text-2xl font-bold mb-2">{section.title}</h1>
        {section.subtitle && (
          <p className="text-sm opacity-70">{section.subtitle}</p>
        )}
      </div>
      {(!section.image_url || section.image_url === "") ? (
        <div className="w-full md:w-48 h-32 border-2 border-dashed border-current/30 rounded-lg flex items-center justify-center text-xs opacity-50">
          Image placeholder
        </div>
      ) : (
        <img
          src={section.image_url}
          alt=""
          className="w-full md:w-48 h-32 object-cover rounded-lg"
        />
      )}
    </section>
  );
}
