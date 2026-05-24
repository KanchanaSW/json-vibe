import { dark } from "@clerk/themes";
import type { Appearance } from "@clerk/types";

export const clerkAppearance: Appearance = {
  baseTheme: dark,
  variables: {
    colorPrimary: "#9213ec",
    colorBackground: "#09090b",
    colorInputBackground: "#18181b",
    colorText: "#ffffff",
    borderRadius: "0.5rem",
  },
  layout: {
    socialButtonsPlacement: "top",
    socialButtonsVariant: "blockButton",
  },
  elements: {
    rootBox: "mx-auto",
    card: "bg-zinc-950 border border-white/10 shadow-none",
    headerTitle: "text-white",
    headerSubtitle: "text-zinc-400",
    socialButtonsBlockButton:
      "bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white",
    formFieldInput: { display: "none" },
    formFieldLabel: { display: "none" },
    formButtonPrimary: { display: "none" },
    dividerRow: { display: "none" },
    footerActionLink: "text-primary hover:text-purple-400",
  },
};
