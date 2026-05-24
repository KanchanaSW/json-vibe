"use client";

import { useCallback, useEffect, useRef } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export function useMockApiEditor(id: string) {
  const generationId = id as Id<"generations">;
  const data = useQuery(api.generations.getMockForOwner, { id: generationId });
  const enableMockApi = useMutation(api.generations.enableMockApi);
  const updateMockApi = useMutation(api.generations.updateMockApi);
  const disableMockApi = useMutation(api.generations.disableMockApi);
  const enableAttempted = useRef(false);

  const loaded = data !== undefined;
  const notFound = loaded && data === null;

  useEffect(() => {
    if (!data || data.mockApiEnabled || enableAttempted.current) {
      return;
    }
    enableAttempted.current = true;
    void enableMockApi({ id: generationId }).catch(() => {
      enableAttempted.current = false;
    });
  }, [data, enableMockApi, generationId]);

  const save = useCallback(
    async (mockApiJson: unknown) => {
      await updateMockApi({ id: generationId, mockApiJson });
    },
    [updateMockApi, generationId]
  );

  const disable = useCallback(async () => {
    await disableMockApi({ id: generationId });
  }, [disableMockApi, generationId]);

  const initialJson =
    data?.mockApiJson ?? data?.uiJson ?? null;

  return {
    loaded,
    notFound,
    mockApiEnabled: data?.mockApiEnabled ?? false,
    initialJson,
    save,
    disable,
  };
}
