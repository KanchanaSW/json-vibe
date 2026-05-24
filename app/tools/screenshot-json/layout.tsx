import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Screenshot → JSON | JSON Vibe",
  description:
    "Convert UI screenshots to structured semantic JSON with OCR and AI layout analysis.",
};

export default function ScreenshotJsonLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
