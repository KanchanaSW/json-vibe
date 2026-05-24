import type { TextBlock } from "@/types/ocr";
import type { UiPage } from "@/types/ui-schema";

export const MAX_GENERATIONS = 20;

export interface GenerationRecord {
  id: string;
  createdAt: string;
  thumbnail: string;
  ocr: TextBlock[];
  uiJson: UiPage;
  ocrFailed?: boolean;
}

export interface GenerationListItem extends GenerationRecord {
  pageType?: string;
  pageTheme?: string;
  sectionCount?: number;
}
