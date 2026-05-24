# JSON Vibe

A modern, ultra-minimalist dark mode JSON Editor built with Next.js, React, and Tailwind CSS. Edit, validate, visualize, and share JSON with a beautiful, professional interface.

🌐 Live Demo: https://jsonshare.org/

## ✨ Features

- 🎨 **Beautiful Dark Theme** - Carefully crafted color palette with neon purple accents and smooth transitions
- 📝 **Professional Code Editor** - CodeMirror-powered editor with JSON syntax highlighting and IntelliSense
- 🌳 **Interactive Tree Viewer** - Visualize JSON structure with expand/collapse functionality (desktop only)
- ✅ **Real-time Validation** - Instant JSON validation feedback with visual indicators
- 📊 **Size Analytics** - Real-time size calculation (raw vs minified) and character count
- 🔀 **Smart Diff Viewer** - Compare original vs modified JSON with Split/Unified views and toggleable formatting
- 🔎 **JSONPath Filtering** - Filter and query your JSON data in real-time using standard JSONPath syntax
- 🧹 **Format & Minify** - One-click JSON formatting with proper indentation or minification
- 🔄 **Format Conversion** - Convert JSON to YAML, XML, or CSV with real-time preview and syntax highlighting
- 🔗 **URL-based State** - JSON state automatically stored in URL hash with LZ-String compression
- 📤 **Share & Copy Link** - Easy sharing via URL with native Web Share API support
- 📦 **Data Model Generation** - Generate TypeScript, Kotlin, Java, Rust, Go, and Swift models from your JSON
- 🕸️ **Schema Visualization** - Interactive ERD-style visualization of JSON structure with image export
- 🔒 **Secure Sharing** - Password protect your JSON data with AES-GCM encryption before sharing
- 🔌 **Import from cURL** - Fetch JSON data directly by pasting cURL commands (client-side execution)
- 📱 **QR Code Sharing** - Generate QR codes for instant mobile sharing
- 📐 **Fully Responsive** - Works seamlessly on all device sizes with mobile-optimized UI
- 📸 **Screenshot → JSON** - Upload UI screenshots, run OCR + AI layout analysis, preview semantic JSON (header toolbar or [`/tools/screenshot-json`](/tools/screenshot-json))
- ⚡ **Fast & Modern** - Built with Next.js 14 App Router for optimal performance
- 🎯 **Mostly Client-side** - JSON editor runs fully in the browser; screenshot analysis uses a server API route

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd json-vibe
```

2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Set up environment variables:

Create `.env.local` in the project root:

```bash
# Optional — Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Required for Screenshot → JSON feature (/tools/screenshot-json)
GROQ_API_KEY=gsk_...
```

To get your Google Analytics Measurement ID:
- Go to [Google Analytics](https://analytics.google.com/)
- Create a GA4 property (if you don't have one)
- Navigate to Admin → Data Streams → Web Stream
- Copy your Measurement ID (format: `G-XXXXXXXXXX`)

4. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Screenshot → JSON

Open the tool from the **Screenshot → JSON** button in the main header toolbar, or go directly to [`/tools/screenshot-json`](/tools/screenshot-json).

Upload a UI screenshot (PNG/JPG/WebP, max 10MB). The pipeline runs OCR (Tesseract.js) and AI layout analysis (Groq vision) server-side and returns structured JSON with a live preview. Generated results are saved to local history at [`/tools/screenshot-json/history`](/tools/screenshot-json/history).

**Deployment note (Netlify):** OCR + AI can take 15–60 seconds locally (`maxDuration = 120`). Netlify function timeouts default to 10s (26s max on Pro). For reliable production runs, request a timeout increase from Netlify support or run the feature locally with `npm run dev`.

### Build for Production

```bash
npm run build
npm start
```

## 🛠️ Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework with custom dark theme
- **CodeMirror 6** - Professional code editor with JSON language support
  - `@uiw/react-codemirror` - React wrapper for CodeMirror
  - `@codemirror/lang-json` - JSON language support
  - `@codemirror/theme-one-dark` - Dark theme
- **React Diff Viewer** - Side-by-side and unified diff visualization with syntax highlighting
- **React Flow** - Node-based graph visualization library
- **JSONPath Plus** - Powerful query language for JSON data filtering
- **LZ-String** - URL compression for efficient state management
- **Lucide React** - Beautiful, consistent icon library
- **QRCode.react** - QR code generation for easy mobile sharing
- **Groq SDK** - Vision AI for screenshot layout analysis
- **Tesseract.js** - Server-side OCR
- **Zod** - API response validation
- **Zustand** - Screenshot → JSON feature state

## 📁 Project Structure

```
json-vibe/
├── app/
│   ├── layout.tsx                          # Root layout with metadata
│   ├── page.tsx                            # Main JSON editor page
│   ├── globals.css                         # Global styles and Tailwind imports
│   ├── api/
│   │   └── screenshot-json/
│   │       └── generate/route.ts           # OCR + AI pipeline API route
│   └── tools/
│       └── screenshot-json/
│           ├── layout.tsx                  # Screenshot tool layout & metadata
│           ├── page.tsx                    # Upload, generate, preview UI
│           └── history/page.tsx            # Local generation history
├── components/
│   ├── Header.tsx                          # Header toolbar, share actions, Screenshot → JSON link
│   ├── JsonEditor.tsx                      # Main JSON editor component
│   ├── JsonEditorCodeMirror.tsx            # CodeMirror implementation
│   ├── JsonTreeViewer.tsx                  # Interactive JSON tree visualization
│   ├── DataModelModal.tsx                  # Generate TypeScript/Kotlin/Java/Rust/Go/Swift models
│   ├── FormatConverterModal.tsx            # Convert JSON to YAML, XML, or CSV
│   ├── JsonVisualizerModal.tsx             # ERD-style JSON schema graph
│   ├── DiffViewer.tsx                      # Side-by-side diff comparison
│   ├── CurlImportModal.tsx                 # Import JSON via cURL
│   └── screenshot-json/                    # Screenshot → JSON UI components
│       ├── feature-header.tsx              # Tool header with Generate/History tabs
│       ├── upload-zone.tsx                 # Drag-and-drop image upload
│       ├── process-pipeline.tsx            # Pipeline status UI
│       ├── json/json-viewer.tsx            # Generated JSON viewer
│       └── preview/                        # Live UI preview from semantic JSON
├── hooks/
│   ├── useUrlState.ts                      # URL-based state with compression
│   ├── use-generate.ts                     # Screenshot generation hook
│   └── use-history.ts                      # Local history hook
├── lib/
│   ├── history.ts                          # History storage helpers
│   ├── schemas.ts                          # Zod schemas
│   ├── normalize-ui.ts                     # UI JSON normalization
│   └── coerce-ai-ui.ts                     # AI output coercion
├── services/
│   ├── ocr.ts                              # Tesseract.js OCR
│   └── groq-parser.ts                      # Groq vision layout analysis
├── store/
│   └── screenshot-json-store.ts            # Zustand store for screenshot tool
├── types/
│   ├── ui-schema.ts                        # Semantic UI JSON types
│   └── ocr.ts                              # OCR result types
├── tailwind.config.ts                      # Tailwind configuration with custom theme
├── next.config.js                          # Next.js configuration (Tesseract WASM tracing)
└── package.json                            # Dependencies and scripts
```

## 🎨 Customization

The color scheme and styling can be customized in `tailwind.config.ts`. The design uses a custom dark theme with:

- **Primary color**: `#9213ec` (purple) - Used for accents and highlights
- **Accent color**: `#22d3ee` (cyan) - Used for secondary highlights
- **Background colors**: Various shades of dark gray (`bg-black`, `bg-bg-main`, `bg-bg-surface`)
- **Border colors**: Subtle white overlays for depth (`border-white/10`)

## 💡 Usage

1. **Edit JSON**: Type or paste JSON into the editor on the left
2. **Validate**: The editor automatically validates JSON syntax in real-time
3. **Format**: Click "Format" to beautify your JSON with proper indentation
4. **Minify**: Click "Minify" to compress JSON to a single line
5. **Filter**: Use the JSONPath bar above the editor to query specific data (e.g., `$.store.book[*]`)
6. **View Tree**: On desktop, the right panel shows an interactive tree view
7. **Share**: Click the QR icon, "Share", or "Copy Link" to share your JSON via URL
8. **Generate Model**: Click "Generate Data Model" in the tree view to create TypeScript/Kotlin/Java/Rust/Go/Swift models
9. **Convert Format**: Transform JSON into YAML, XML, or CSV formats with the built-in converter
10. **Secure**: Click "Secure" to encrypt your JSON with a password before sharing
11. **Compare Changes**: Click the "Diff" button (visible when modified) to toggle a powerful diff view with split/unified modes
12. **Visualize**: Click "Visualize" in the tree view to generate an interactive graph diagram of your JSON structure
13. **Import cURL**: Click "Import cURL" in the tree view to fetch data from an API endpoint
14. **Screenshot → JSON**: Click **Screenshot → JSON** in the header to upload a UI screenshot, generate semantic JSON, and preview the layout

## 🔗 URL State Management

JSON Vibe stores your JSON data in the URL hash using LZ-String compression. This means:
- Your JSON is automatically saved in the URL
- You can bookmark or share the URL to preserve state
- No backend or database required
- Works offline after initial load

## 📝 License

MIT
