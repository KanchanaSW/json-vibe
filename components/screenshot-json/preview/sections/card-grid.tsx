import type { CardGridSection } from "@/types/ui-schema";
import { PreviewButton } from "../preview-button";

export function CardGridPreview({ section }: { section: CardGridSection }) {
  const cols = Math.min(Math.max(section.columns || 1, 1), 4);
  return (
    <section
      className="p-4 grid gap-4"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
    >
      {section.cards.map((card, i) => (
        <div
          key={i}
          className="p-4 rounded-lg border border-white/10 bg-white/5"
        >
          <h3 className="font-semibold mb-1">{card.title}</h3>
          {card.value && (
            <p className="text-sm opacity-70 mb-3">{card.value}</p>
          )}
          {card.icons && card.icons.length > 0 && (
            <div className="flex flex-col gap-2 mb-3">
              {card.icons.map((icon, j) => (
                <div key={j} className="flex items-center gap-2 text-sm">
                  {!icon.icon_url || icon.icon_url === "" ? (
                    <div className="w-6 h-6 rounded bg-white/10 shrink-0" />
                  ) : (
                    <img
                      src={icon.icon_url}
                      alt=""
                      className="w-6 h-6 rounded object-cover"
                    />
                  )}
                  {icon.text && <span className="opacity-80">{icon.text}</span>}
                </div>
              ))}
            </div>
          )}
          {card.button && <PreviewButton button={card.button} />}
        </div>
      ))}
    </section>
  );
}
