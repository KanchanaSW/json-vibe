"use client";

import { useCallback, useEffect, useState } from "react";
import {
  deleteHistoryItem,
  loadHistory,
  type HistoryItem,
} from "@/lib/history";

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setItems(loadHistory());
    setLoaded(true);
  }, []);

  const refresh = useCallback(() => {
    setItems(loadHistory());
  }, []);

  const remove = useCallback(
    (id: string) => {
      const updated = deleteHistoryItem(id);
      setItems(updated);
    },
    []
  );

  return { items, loaded, refresh, remove };
}
