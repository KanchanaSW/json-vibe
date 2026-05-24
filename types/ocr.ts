export interface TextBlock {
  text: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OcrResult {
  textBlocks: TextBlock[];
  ocrFailed?: boolean;
}
