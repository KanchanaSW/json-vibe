import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: "JSON Vibe - Modern JSON Editor & Validator",
    template: "%s | JSON Vibe",
  },
  description:
    "A modern, ultra-minimalist dark mode JSON Editor. Edit, validate, visualize, and share JSON with a beautiful, professional interface. Features real-time validation, tree viewer, format & minify tools.",
  keywords: [
    "JSON editor",
    "JSON validator",
    "JSON formatter",
    "JSON viewer",
    "JSON tree viewer",
    "online JSON editor",
    "JSON minifier",
    "JSON beautifier",
    "code editor",
    "web JSON tool",
  ],
  authors: [{ name: "JSON Vibe" }],
  creator: "JSON Vibe",
  publisher: "JSON Vibe",
  applicationName: "JSON Vibe",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://jsonshare.org/"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://jsonshare.org/",
    siteName: "JSON Vibe",
    title: "JSON Vibe - Modern JSON Editor & Validator",
    description:
      "A modern, ultra-minimalist dark mode JSON Editor. Edit, validate, visualize, and share JSON with a beautiful, professional interface.",
    images: [
      {
        url: "/screen.png",
        width: 1200,
        height: 630,
        alt: "JSON Vibe - Modern JSON Editor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JSON Vibe - Modern JSON Editor & Validator",
    description:
      "A modern, ultra-minimalist dark mode JSON Editor. Edit, validate, visualize, and share JSON.",
    creator: "@SKW",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification codes here when available
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // yahoo: 'your-yahoo-verification-code',
  },
  category: "developer tools",
  classification: "JSON Editor Tool",
  icons: {
    icon: "/icon",
    shortcut: "/icon",
    apple: "/icon",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="h-screen flex flex-col overflow-hidden selection:bg-primary/30 selection:text-white">
        {children}
      </body>
    </html>
  )
}

