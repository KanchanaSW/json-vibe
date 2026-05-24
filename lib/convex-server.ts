import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

export async function fetchPublicMock(id: string): Promise<unknown | null> {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) {
    return null;
  }

  try {
    const client = new ConvexHttpClient(url);
    return await client.query(api.generations.getPublicMock, {
      id: id as Id<"generations">,
    });
  } catch {
    return null;
  }
}

export async function saveGeneration(
  clerkToken: string,
  args: {
    ocr: unknown;
    uiJson: unknown;
    ocrFailed?: boolean;
    thumbnailDataUrl?: string;
  }
): Promise<string> {
  const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
  client.setAuth(clerkToken);
  return client.mutation(api.generations.create, args);
}
