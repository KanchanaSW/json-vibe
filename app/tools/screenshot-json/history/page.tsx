"use client";

import { useRouter } from "next/navigation";
import { Trash2, Clock } from "lucide-react";
import FeatureHeader from "@/components/screenshot-json/feature-header";
import { useHistory } from "@/hooks/use-history";
import { useScreenshotJsonStore } from "@/store/screenshot-json-store";
import type { GenerationListItem } from "@/types/generation";

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function HistoryPage() {
  const router = useRouter();
  const { items, loaded, remove } = useHistory();
  const loadFromHistory = useScreenshotJsonStore((s) => s.loadFromHistory);

  const handleLoad = (item: GenerationListItem) => {
    loadFromHistory({
      thumbnail: item.thumbnail,
      ocr: item.ocr,
      uiJson: item.uiJson,
    });
    router.push("/tools/screenshot-json");
  };

  return (
    <div className="flex flex-col h-[100dvh] w-screen overflow-hidden bg-black text-white">
      <FeatureHeader />
      <main className="flex-1 overflow-auto custom-scrollbar p-4 lg:p-6">
        <h1 className="text-xl font-bold mb-2">Generation History</h1>
        <p className="text-sm text-zinc-400 mb-6">
          Your last 20 generations, saved to your account.
        </p>

        {!loaded ? (
          <p className="text-zinc-500 text-sm">Loading...</p>
        ) : items.length === 0 ? (
          <div className="rounded-lg border border-dashed border-white/10 p-12 text-center text-zinc-500 text-sm">
            No history yet. Generate JSON from a screenshot to get started.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 max-w-6xl">
            {items.map((item) => (
              <div
                key={item.id}
                className="group rounded-lg border border-white/10 bg-zinc-900 overflow-hidden hover:border-primary/30 transition-colors"
              >
                <button
                  onClick={() => handleLoad(item)}
                  className="w-full text-left"
                >
                  {item.thumbnail ? (
                    <img
                      src={item.thumbnail}
                      alt="Screenshot thumbnail"
                      className="w-full h-32 object-cover bg-zinc-800"
                    />
                  ) : (
                    <div className="w-full h-32 bg-zinc-800" />
                  )}
                  <div className="p-3">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                      <Clock size={12} />
                      {formatRelativeTime(item.createdAt)}
                    </div>
                    <p className="text-sm text-zinc-300 mt-1 capitalize">
                      {item.pageType ?? item.uiJson.page.type} ·{" "}
                      {item.pageTheme ?? item.uiJson.page.theme}
                    </p>
                    <p className="text-xs text-zinc-500 mt-0.5">
                      {item.sectionCount ?? item.uiJson.page.sections.length}{" "}
                      sections
                    </p>
                  </div>
                </button>
                <div className="px-3 pb-3">
                  <button
                    onClick={() => remove(item.id)}
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={12} />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
