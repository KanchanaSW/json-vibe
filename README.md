# JSON Vibe

https://jsonshare.netlify.app

A modern, ultra-minimalist dark mode JSON Editor built with Next.js, React, and Tailwind CSS.

## Features

- 🎨 **Beautiful Dark Theme** - Carefully crafted color palette with neon accents
- 📝 **CodeMirror Editor** - Professional code editing experience with syntax highlighting
- 🌳 **Interactive Tree Viewer** - Visualize JSON structure with expand/collapse functionality
- ✅ **Real-time Validation** - Instant JSON validation feedback
- 🔍 **Diff Viewer** - Compare changes between initial and current JSON
- 🔧 **Format & Minify** - Format JSON with proper indentation or minify it
- 🔗 **URL-based State** - JSON state stored in URL hash with automatic compression
- 📋 **Share & Copy Link** - Easy sharing capabilities via URL
- 📱 **Fully Responsive** - Works seamlessly on all device sizes
- ⚡ **Fast & Modern** - Built with Next.js 14 App Router

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **CodeMirror** - Professional code editor with JSON language support
- **React Diff Viewer** - Side-by-side diff visualization
- **LZ-String** - URL compression for state management
- **Lucide React** - Beautiful icon library

## Project Structure

```
json-vibe/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx       # Main page
│   └── globals.css    # Global styles
├── components/
│   ├── Header.tsx              # Header with Share/Copy Link, Format, Minify, Diff buttons
│   ├── JsonEditor.tsx          # CodeMirror editor component
│   ├── JsonEditorCodeMirror.tsx # Alternative CodeMirror implementation
│   ├── JsonTreeViewer.tsx      # JSON tree viewer component
│   └── DiffViewer.tsx          # Diff viewer component
└── hooks/
    └── useUrlState.ts          # URL-based state management hook
```

## Customization

The color scheme and styling can be customized in `tailwind.config.ts`. The design uses a custom dark theme with:

- Primary color: `#9213ec` (purple)
- Accent color: `#22d3ee` (cyan)
- Background colors: Various shades of dark gray

## License

MIT

