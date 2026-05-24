import type {
  ButtonItem,
  CardIcon,
  CardItem,
  UiPage,
  UiSection,
} from "@/types/ui-schema";

function normalizeString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim();
}

function normalizeVariant(value: unknown): "primary" | "secondary" {
  if (typeof value === "string") {
    const v = value.toLowerCase().trim();
    if (v === "secondary") return "secondary";
    if (v === "primary") return "primary";
  }
  return "primary";
}

function normalizeButton(button: ButtonItem): ButtonItem {
  return {
    label: button.label,
    variant: normalizeVariant(button.variant),
    background_color: normalizeString(button.background_color),
    text_color: normalizeString(button.text_color),
  };
}

function normalizeIcon(icon: CardIcon): CardIcon {
  return {
    icon_url: normalizeString(icon.icon_url),
    text: icon.text,
  };
}

function normalizeCard(card: CardItem): CardItem {
  return {
    title: card.title,
    value: card.value,
    icons: card.icons?.map(normalizeIcon),
    button: card.button ? normalizeButton(card.button) : undefined,
  };
}

function normalizeSection(section: UiSection): UiSection {
  switch (section.type) {
    case "hero":
      return {
        ...section,
        image_url: normalizeString(section.image_url),
      };
    case "card_grid":
      return {
        ...section,
        cards: section.cards.map(normalizeCard),
      };
    case "buttons":
      return {
        ...section,
        items: section.items.map(normalizeButton),
      };
    default:
      return section;
  }
}

export function normalizeUiPage(page: UiPage): UiPage {
  return {
    page: {
      type: page.page.type,
      theme: page.page.theme,
      sections: page.page.sections.map(normalizeSection),
    },
  };
}
