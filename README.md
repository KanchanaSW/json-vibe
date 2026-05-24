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
- 🌐 **Mock API from JSON** - Turn generated UI JSON into a public `GET` endpoint for Postman, curl, or frontend prototypes (signed-in editor, auto-save)
- ⚡ **Fast & Modern** - Built with Next.js 14 App Router for optimal performance
- 🎯 **Mostly Client-side** - JSON editor runs fully in the browser; screenshot analysis uses a server API route

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

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

# Clerk — Google-only auth (see Authentication section below)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-frontend-api.clerk.accounts.dev

# Convex — generation history + mock API payloads (see Convex section below)
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment
```

Copy `.env.example` as a starting point if you prefer placeholder values.

To get your Google Analytics Measurement ID:
- Go to [Google Analytics](https://analytics.google.com/)
- Create a GA4 property (if you don't have one)
- Navigate to Admin → Data Streams → Web Stream
- Copy your Measurement ID (format: `G-XXXXXXXXXX`)

4. Run the development servers:

In one terminal, start Convex (required for generation history and mock APIs):

```bash
npm run dev:convex
# or: npx convex dev
```

In another terminal, start Next.js:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Authentication (Clerk — Google only)

Screenshot → JSON generation, history, and mock API editing require Google sign-in via [Clerk](https://clerk.com). The main JSON editor at `/` and public mock API reads (`GET /api/screenshot-json/mock/[id]`) do not require sign-in.

### Clerk dashboard setup

1. Create a Clerk application (choose **Next.js**).
2. **User & authentication → Email, phone, username**: disable email/password sign-up and sign-in (social-only).
3. **User & authentication → Social connections**: enable **Google only**; disable GitHub, Apple, and all other providers.
4. Copy your **Publishable key** and **Secret key** into `.env.local`.
5. **Local development**: Clerk provides shared Google OAuth credentials for `localhost` — no Google Cloud setup needed.
6. **Production**: create a Google Cloud OAuth 2.0 client and add the authorized redirect URIs shown in the Clerk dashboard. See [Clerk Google docs](https://clerk.com/docs/authentication/social-connections/google).

Do not enable email/password, magic links, phone, or other OAuth providers.

### Clerk ↔ Convex auth

Generation history and mock API payloads are stored in [Convex](https://convex.dev) on the `generations` table, scoped per signed-in user.

1. In the Clerk Dashboard, activate the [Convex integration](https://dashboard.clerk.com/apps/setup/convex) — this creates a JWT template named `convex`.
2. Copy your Clerk **Frontend API URL** (issuer domain) into `.env.local` as `CLERK_JWT_ISSUER_DOMAIN` (e.g. `https://your-app.clerk.accounts.dev`).
3. Set the same value on your Convex deployment:
   ```bash
   npx convex env set CLERK_JWT_ISSUER_DOMAIN https://your-app.clerk.accounts.dev
   ```
4. Run `npx convex dev` to sync `convex/auth.config.ts` to your deployment.

### Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key (server-only) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Sign-in page path (`/sign-in`) |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Sign-up page path (`/sign-up`) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Redirect after sign-in (`/`) |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Redirect after sign-up (`/`) |
| `CLERK_JWT_ISSUER_DOMAIN` | Clerk Frontend API URL for Convex JWT validation |
| `NEXT_PUBLIC_CONVEX_URL` | Convex deployment client URL |
| `CONVEX_DEPLOYMENT` | Convex deployment name (set by `npx convex dev`) |
| `CONVEX_DEPLOY_KEY` | Netlify/CI only — production or preview deploy key from Convex dashboard |

### Route access

| Route | Access |
|-------|--------|
| `/` | Public — full JSON editor |
| `/tools/screenshot-json` | Public to view; **Mock API** button and **History** tab require Google sign-in |
| `/tools/screenshot-json/history` | Requires Google sign-in |
| `/tools/screenshot-json/mock/[id]` | Requires Google sign-in; owner-only editor (auto-saves valid JSON) |
| `GET /api/screenshot-json/mock/[id]` | Public read when mock API is enabled; CORS `*` for cross-origin testing |
| `POST /api/screenshot-json/generate` | Works without sign-in; Convex save + `generationId` only when signed in |
| `/sign-in`, `/sign-up` | Public auth pages (Google button only) |

### Testing locally

1. Set Clerk keys in `.env.local` and configure Google-only in the Clerk dashboard.
2. Run `npm run dev` and open `/` — editor works without login.
3. Visit `/tools/screenshot-json`, upload an image, click **Generate JSON** while signed out — toast prompts sign-in.
4. Sign in at `/sign-in` (only Google button should appear).
5. After sign-in, generate should succeed (requires valid `GROQ_API_KEY` and running Convex dev).
6. Visit `/tools/screenshot-json/history` while signed out — redirects to `/sign-in`.
7. After generating while signed in, open **History** — the item should appear without manual refresh.
8. Click a history item to load it into the generate page; delete removes it from your account.

**Mock API (signed in):**

9. After generating JSON, click **Mock API** on the JSON viewer — opens `/tools/screenshot-json/mock/[id]` (Convex `_id` from the saved generation).
10. Edit response JSON in the editor; valid changes **auto-save** after a short debounce (no Save button). Invalid JSON shows **Invalid JSON** and is not written to Convex.
11. Copy the public URL from the editor, then test with Postman, curl, or `fetch`:
    ```bash
    curl http://localhost:3000/api/screenshot-json/mock/YOUR_GENERATION_ID
    ```
    Success returns the raw JSON body with `Content-Type: application/json`. Other HTTP methods return `405`.
12. **Disable mock API** — the public GET returns `404` with `{ "error": "Mock API not found" }`. Valid edits after disable re-enable the endpoint.
13. Visit `/tools/screenshot-json/mock/[id]` while signed out — redirects to `/sign-in`.
14. Non-owners cannot edit another user's mock (editor shows not found).

### Screenshot → JSON

Open the tool from the **Screenshot → JSON** button in the main header toolbar, or go directly to [`/tools/screenshot-json`](/tools/screenshot-json).

Upload a UI screenshot (PNG/JPG/WebP, max 10MB). The pipeline runs OCR (Tesseract.js) and AI layout analysis (Groq vision) server-side and returns structured JSON with a live preview. **Sign in with Google** is required to generate. Successful generations are saved to your account in Convex (last 20 items) and appear at [`/tools/screenshot-json/history`](/tools/screenshot-json/history) — the **History** tab is visible only when signed in.

#### Mock API

When signed in, click **Mock API** on the generated JSON viewer to open the editor at `/tools/screenshot-json/mock/[id]`, where `[id]` is the Convex generation document id.

| Concern | Behavior |
|---------|----------|
| **Create** | First visit enables the mock and seeds payload from `uiJson` |
| **Edit** | CodeMirror editor; auto-saves valid JSON (~600ms debounce) |
| **Public read** | `GET /api/screenshot-json/mock/[id]` — no auth; CORS enabled |
| **Disable** | Owner can disable; GET returns 404 until re-enabled by a valid save |
| **Access** | Editor: sign-in + owner only. Read: anyone with the URL while enabled |

If generation was not saved to Convex (no `generationId`), clicking **Mock API** creates a generation record from the current store state, then navigates to the editor.

**Deployment (Netlify + Convex):**

1. In the [Convex dashboard](https://dashboard.convex.dev/), open your **production** deployment → **Settings** → **Deploy keys** → **Generate Production Deploy Key**.
2. In Netlify → **Site configuration** → **Environment variables**, add `CONVEX_DEPLOY_KEY` with that key (scope to Production; use a separate Preview deploy key for deploy previews if needed).
3. Set the same Clerk/Convex vars you use locally (`NEXT_PUBLIC_CONVEX_URL` is injected at build time by `convex deploy`; you can still set it manually if you skip `convex deploy`):
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, Clerk URL vars
   - `GROQ_API_KEY`
   - `CLERK_JWT_ISSUER_DOMAIN` on the Convex deployment (`npx convex env set CLERK_JWT_ISSUER_DOMAIN …`)
4. `netlify.toml` runs `npx convex deploy --cmd 'npm run build'`, which deploys Convex functions, runs codegen, and sets `NEXT_PUBLIC_CONVEX_URL` for the Next.js build.

**Netlify timeouts:** OCR + AI can take 15–60 seconds locally (`maxDuration = 120`). Netlify function timeouts default to 10s (26s max on Pro). For reliable production runs, request a timeout increase from Netlify support or run the feature locally with `npm run dev`.

### Build for Production

Local (with Convex dev running or after `npx convex codegen`):

```bash
npm run build
npm start
```

CI / Netlify (requires `CONVEX_DEPLOY_KEY`):

```bash
npx convex deploy --cmd-url-env-var-name NEXT_PUBLIC_CONVEX_URL --cmd 'npm run build'
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
- **Clerk** - Google-only authentication for screenshot features
- **Convex** - Per-user generation history and mock API payload storage

## Convex setup

1. Install dependencies (`npm install` includes the `convex` package).
2. Run `npx convex dev` — creates a deployment, writes `NEXT_PUBLIC_CONVEX_URL` and `CONVEX_DEPLOYMENT` to `.env.local`, and syncs functions.
3. Configure Clerk ↔ Convex auth (see **Clerk ↔ Convex auth** above).
4. Keep `npm run dev:convex` running alongside `npm run dev` during local development.

For production, run `npx convex deploy` and set the same environment variables on your hosting provider and Convex dashboard.

Each `generations` document stores OCR output, `uiJson`, optional thumbnail, and optional mock API fields (`mockApiEnabled`, `mockApiJson`, `mockApiUpdatedAt`). Thumbnails are compressed JPEG data URLs (~200px wide). File storage via Convex actions can be added later if needed.

## 📁 Project Structure

```
json-vibe/
├── app/
│   ├── layout.tsx                          # Root layout with ClerkProvider + ConvexClientProvider
│   ├── page.tsx                            # Main JSON editor page
│   ├── globals.css                         # Global styles and Tailwind imports
│   ├── sign-in/[[...sign-in]]/page.tsx     # Google-only sign-in
│   ├── sign-up/[[...sign-up]]/page.tsx     # Google-only sign-up
│   ├── api/
│   │   └── screenshot-json/
│   │       ├── generate/route.ts           # OCR + AI pipeline API route
│   │       └── mock/[id]/route.ts          # Public mock API GET
│   └── tools/
│       └── screenshot-json/
│           ├── layout.tsx                  # Screenshot tool layout & metadata
│           ├── page.tsx                    # Upload, generate, preview UI
│           ├── history/page.tsx            # Convex-backed generation history
│           └── mock/[id]/page.tsx          # Owner-only mock API JSON editor
├── components/
│   ├── Header.tsx                          # Header toolbar, share actions, auth menu
│   ├── auth-user-menu.tsx                  # Clerk SignedIn/SignedOut controls
│   ├── convex-client-provider.tsx          # ConvexProviderWithClerk wrapper
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
│       ├── json/json-viewer.tsx            # JSON viewer (Mock API nav when signed in)
│       └── preview/                        # Live UI preview from semantic JSON
├── hooks/
│   ├── useUrlState.ts                      # URL-based state with compression
│   ├── use-generate.ts                     # Screenshot generation hook
│   ├── use-history.ts                      # Convex history hook
│   ├── use-mock-api-nav.ts                 # Mock API navigation + ensure generation
│   └── use-mock-api-editor.ts              # Mock API editor queries/mutations
├── convex/
│   ├── schema.ts                           # generations table (+ mock API fields)
│   ├── generations.ts                      # CRUD, getPublicMock, mock enable/update/disable
│   └── auth.config.ts                      # Clerk JWT auth config
├── lib/
│   ├── clerk-appearance.ts                 # Clerk dark theme (Google-only UI)
│   ├── convex-server.ts                    # saveGeneration, fetchPublicMock (server)
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
│   ├── generation.ts                       # Generation history UI types
│   └── ocr.ts                              # OCR result types
├── middleware.ts                           # Clerk route protection
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
15. **Mock API**: After generating while signed in, click **Mock API** to edit the public response JSON; test with `GET /api/screenshot-json/mock/[id]`

## 🔗 URL State Management

JSON Vibe stores your JSON data in the URL hash using LZ-String compression. This means:
- Your JSON is automatically saved in the URL
- You can bookmark or share the URL to preserve state
- No backend or database required
- Works offline after initial load

## 📝 License

MIT
