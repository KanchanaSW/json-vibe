"use client";

import { useMutation, useQuery } from "convex/react";
import { useCallback, useMemo } from "react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { GenerationListItem } from "@/types/generation";

export function useHistory() {
  const records = useQuery(api.generations.listForUser);
  const removeMutation = useMutation(api.generations.remove);

  const items: GenerationListItem[] = useMemo(
    () =>
      records?.map((doc) => ({
        id: doc._id,
        createdAt: new Date(doc.createdAt).toISOString(),
        thumbnail: doc.thumbnailUrl ?? "",
        ocr: doc.ocr,
        uiJson: doc.uiJson,
        ocrFailed: doc.ocrFailed,
        pageType: doc.pageType,
        pageTheme: doc.pageTheme,
        sectionCount: doc.sectionCount,
      })) ?? [],
    [records]
  );

  const loaded = records !== undefined;

  const remove = useCallback(
    (id: string) => {
      void removeMutation({ id: id as Id<"generations"> });
    },
    [removeMutation]
  );

  return { items, loaded, remove };
}
