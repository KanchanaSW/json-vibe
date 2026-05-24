export const HISTORY_STORAGE_KEY = "json-vibe-screenshot-json-history";
export const MAX_HISTORY_ITEMS = 20;

export interface HistoryItem {
  id: string;
  createdAt: string;
  thumbnail: string;
  ocr: import("@/types/ocr").TextBlock[];
  uiJson: import("@/types/ui-schema").UiPage;
}

export function loadHistory(): HistoryItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as HistoryItem[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveHistory(items: HistoryItem[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    HISTORY_STORAGE_KEY,
    JSON.stringify(items.slice(0, MAX_HISTORY_ITEMS))
  );
}

export function addHistoryItem(item: HistoryItem): HistoryItem[] {
  const existing = loadHistory();
  const updated = [item, ...existing.filter((h) => h.id !== item.id)].slice(
    0,
    MAX_HISTORY_ITEMS
  );
  saveHistory(updated);
  return updated;
}

export function deleteHistoryItem(id: string): HistoryItem[] {
  const updated = loadHistory().filter((h) => h.id !== id);
  saveHistory(updated);
  return updated;
}

export function clearHistory(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(HISTORY_STORAGE_KEY);
}
