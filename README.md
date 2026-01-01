# JSON Vibe

A modern, ultra-minimalist dark mode JSON Editor built with Next.js, React, and Tailwind CSS. Edit, validate, visualize, and share JSON with a beautiful, professional interface.

🌐 Live Demo: https://jsonshare.org/

## ✨ Features

- 🎨 **Beautiful Dark Theme** - Carefully crafted color palette with neon purple accents and smooth transitions
- 📝 **Professional Code Editor** - CodeMirror-powered editor with JSON syntax highlighting and IntelliSense
- 🌳 **Interactive Tree Viewer** - Visualize JSON structure with expand/collapse functionality (desktop only)
- ✅ **Real-time Validation** - Instant JSON validation feedback with visual indicators
- 🔍 **Smart Diff Viewer** - Compare original vs modified JSON with Split/Unified views and toggleable formatting
-  **Format & Minify** - One-click JSON formatting with proper indentation or minification
- 🔄 **Format Conversion** - Convert JSON to YAML, XML, or CSV with real-time preview and syntax highlighting
- � **URL-based State** - JSON state automatically stored in URL hash with LZ-String compression
-  **Share & Copy Link** - Easy sharing via URL with native Web Share API support
- 📦 **Data Model Generation** - Generate TypeScript, Kotlin, Java, Rust, Go, and Swift models from your JSON
-  **Secure Sharing** - Password protect your JSON data with AES-GCM encryption before sharing
- 📱 **QR Code Sharing** - Generate QR codes for instant mobile sharing
-  **Fully Responsive** - Works seamlessly on all device sizes with mobile-optimized UI
- ⚡ **Fast & Modern** - Built with Next.js 14 App Router for optimal performance
- 🎯 **Zero Backend** - Fully client-side application with no server required

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

3. Set up environment variables (optional):

Create a `.env.local` file in the root directory and add your Google Analytics Measurement ID:

```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

To get your Measurement ID:
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
- **LZ-String** - URL compression for efficient state management
- **Lucide React** - Beautiful, consistent icon library
- **QRCode.react** - QR code generation for easy mobile sharing
- **Web Crypto API** - Native browser API for secure AES-GCM encryption

## 📁 Project Structure

```
json-vibe/
├── app/
│   ├── layout.tsx              # Root layout with metadata
│   ├── page.tsx                # Main application page
│   └── globals.css             # Global styles and Tailwind imports
├── components/
│   ├── Header.tsx              # Header with toolbar, share, and copy link buttons
│   ├── JsonEditor.tsx         # Main JSON editor component
│   ├── JsonEditorCodeMirror.tsx # CodeMirror implementation
│   ├── JsonTreeViewer.tsx     # Interactive JSON tree visualization
│   ├── DataModelModal.tsx     # Modal for generating data models
│   ├── FormatConverterModal.tsx # Modal for converting JSON to other formats
│   └── DiffViewer.tsx         # Side-by-side diff comparison component
├── hooks/
│   └── useUrlState.ts         # URL-based state management with compression
├── tailwind.config.ts         # Tailwind configuration with custom theme
├── next.config.js             # Next.js configuration
└── package.json               # Dependencies and scripts
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
5. **View Tree**: On desktop, the right panel shows an interactive tree view
6. **Share**: Click the QR icon, "Share", or "Copy Link" to share your JSON via URL
7. **Generate Model**: Click "Generate Data Model" in the tree view to create TypeScript/Kotlin/Java/Rust/Go/Swift models
8. **Convert Format**: Transform JSON into YAML, XML, or CSV formats with the built-in converter
9. **Secure**: Click "Secure" to encrypt your JSON with a password before sharing
10. **Compare Changes**: Click the "Diff" button (visible when modified) to toggle a powerful diff view with split/unified modes

## 🔗 URL State Management

JSON Vibe stores your JSON data in the URL hash using LZ-String compression. This means:
- Your JSON is automatically saved in the URL
- You can bookmark or share the URL to preserve state
- No backend or database required
- Works offline after initial load

## 📝 License

MIT
