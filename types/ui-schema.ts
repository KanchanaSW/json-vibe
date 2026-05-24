export type PageType = "dashboard" | "landing" | "form" | "other";
export type PageTheme = "dark" | "light";
export type ButtonVariant = "primary" | "secondary";

export interface ButtonItem {
  label: string;
  variant?: ButtonVariant;
  background_color?: string;
  text_color?: string;
}

export interface CardIcon {
  icon_url?: string;
  text?: string;
}

export interface CardItem {
  title: string;
  value?: string;
  icons?: CardIcon[];
  button?: ButtonItem;
}

export interface FormField {
  label: string;
  type?: string;
  placeholder?: string;
}

export interface NavbarSection {
  type: "navbar";
  items: string[];
}

export interface SidebarSection {
  type: "sidebar";
  items: string[];
}

export interface HeroSection {
  type: "hero";
  title: string;
  subtitle?: string;
  image_url?: string;
}

export interface CardGridSection {
  type: "card_grid";
  columns: number;
  cards: CardItem[];
}

export interface ListSection {
  type: "list";
  items: string[];
}

export interface ButtonsSection {
  type: "buttons";
  items: ButtonItem[];
}

export interface FormSection {
  type: "form";
  fields: FormField[];
}

export type UiSection =
  | NavbarSection
  | SidebarSection
  | HeroSection
  | CardGridSection
  | ListSection
  | ButtonsSection
  | FormSection;

export interface UiPage {
  page: {
    type: PageType;
    theme: PageTheme;
    sections: UiSection[];
  };
}

export interface GenerateResponse {
  ocr: import("./ocr").TextBlock[];
  result: UiPage;
  ocrFailed?: boolean;
  generationId?: string;
  historySaveFailed?: boolean;
}

export interface ApiErrorResponse {
  error: string;
  step: "validation" | "config" | "ocr" | "ai";
  retryable: boolean;
}
