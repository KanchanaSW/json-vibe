import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

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
