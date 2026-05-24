# Product Requirements Document — FigmaJSON

## 1. Overview

**FigmaJSON** is a minimal developer tool that converts UI screenshots into structured, semantic JSON. Users upload a Figma export or any design screenshot; the app runs OCR and AI vision analysis, then returns layout JSON that can be previewed live, copied, downloaded, or reused from local history.

The product bridges the gap between static design artifacts (screenshots) and machine-readable UI structure that developers can use to scaffold mock frontends, prototypes, or downstream automation.

---

## 2. Problem Statement

Designers and product teams often share UI as PNG/JPG exports or Figma screenshots. Developers who need to reproduce or mock those layouts must manually inspect pixels, transcribe copy, and infer component hierarchy — a slow, error-prone process.

Existing tools either require Figma API access, produce non-semantic output, or skip the developer-friendly JSON + preview loop. FigmaJSON solves this by:

1. Extracting text and spatial hints via OCR
2. Inferring semantic sections (navbar, hero, cards, forms, etc.) via vision AI
3. Validating output against a strict schema
4. Rendering an immediate visual preview so users can trust the JSON before using it

---

## 3. Target Users

| Persona | Need |
|---------|------|
| **Frontend developer** | Quickly turn a design screenshot into structured JSON to bootstrap a UI mock or component tree |
| **Prototyper / indie builder** | Validate that AI can interpret a layout before wiring real assets and routes |
| **Design engineer** | Export a portable JSON representation of a screen for tooling, docs, or handoff |

**Primary use case:** Single-screen uploads (mobile landing pages, dashboards, forms) where semantic section breakdown is more valuable than pixel-perfect reproduction.

---

## 4. Goals & Success Metrics

### Product goals

- Reduce time from screenshot → usable layout JSON to under 2 minutes (including upload and generation)
- Produce JSON that validates against the schema ≥ 95% of successful runs
- Provide a preview faithful enough to verify section types, copy, and button placement

### Success metrics (MVP)

| Metric | Target |
|--------|--------|
| End-to-end generation success rate | ≥ 85% (excluding user input errors) |
| Median generation time (local dev) | ≤ 60 seconds |
| User can copy/download JSON without extra steps | 100% of successful runs |
| History retention | Last 20 items per browser |

---

## 5. User Stories

### Core workflow

| ID | Story | Priority |
|----|-------|----------|
| US-1 | As a developer, I can drag-and-drop or select a screenshot (PNG, JPG, WebP) so I can start generation without configuring Figma | P0 |
| US-2 | As a developer, I can see pipeline progress (OCR → AI → done) so I know the app is working during long runs | P0 |
| US-3 | As a developer, I receive structured JSON describing page type, theme, and sections so I can use it in my own code | P0 |
| US-4 | As a developer, I can preview the JSON as a rendered UI so I can sanity-check the output before exporting | P0 |
| US-5 | As a developer, I can copy or download the JSON so I can paste it into my project or save it locally | P0 |

### Resilience & history

| ID | Story | Priority |
|----|-------|----------|
| US-6 | As a developer, I still get useful JSON if OCR fails or times out (vision-only fallback) so a slow OCR step does not block me | P0 |
| US-7 | As a developer, I can retry generation after a transient AI failure without re-uploading the image | P1 |
| US-8 | As a developer, I can browse my last 20 generations in History and reload a past result into the Generate view | P1 |
| US-9 | As a developer, I can delete individual history entries to manage local storage | P2 |

### Discovery

| ID | Story | Priority |
|----|-------|----------|
| US-10 | As a new visitor, I can read a landing page explaining OCR, AI parsing, and live preview before using the tool | P1 |

---

## 6. User Flows

### 6.1 Primary flow — Generate JSON

```text
Landing (/) → Generate (/generate)
    → Upload screenshot (client resizes to max 1280px width)
    → Click "Generate JSON"
    → POST /api/generate
         → OCR (Tesseract.js, 25s timeout)
         → Groq vision + OCR context (45s timeout per call)
         → Zod validation + normalization
    → Preview tab (default) or JSON tab
    → Copy / Download JSON
    → (Optional) Saved to localStorage history
```

### 6.2 History flow

```text
History (/history)
    → List of past generations (thumbnail, date)
    → Click item → reload into Generate page state
    → Delete item → removed from localStorage
```

### 6.3 Error flow

| Condition | User experience |
|-----------|-----------------|
| Invalid file type / size | Inline validation error before upload completes |
| Missing `GROQ_API_KEY` | 500 with clear configuration message |
| OCR timeout/failure | Warning toast; pipeline continues vision-only |
| AI timeout | 504; retry button available |
| Invalid AI JSON | 502; retryable |

---

## 7. Functional Requirements

### 7.1 Upload

- Accept PNG, JPG, WebP only
- Maximum file size: 10 MB
- Client-side resize: max width 1280px before upload (reduces payload and processing time)
- Drag-and-drop and file picker supported

### 7.2 OCR pipeline

- Engine: Tesseract.js (WASM, server-side)
- Output: `textBlocks[]` with `{ text, x, y, width, height }`
- Server timeout: 25 seconds
- On failure or timeout: proceed with empty OCR; surface warning to user

### 7.3 AI layout parsing

- Provider: Groq API
- Model: `meta-llama/llama-4-scout-17b-16e-instruct`
- Mode: JSON response
- Input: screenshot buffer + MIME type + OCR text blocks (when available)
- Output: validated `UiPage` object (see §8)
- Timeout: 45 seconds per Groq call
- Post-processing: Zod validation; normalize empty strings for asset URLs and colors

### 7.4 Preview renderer

Must render the following section types from JSON:

| Section type | Renders |
|--------------|---------|
| `navbar` | Top navigation labels |
| `sidebar` | Side navigation labels |
| `hero` | Title, subtitle, image placeholder slot |
| `card_grid` | Cards with title, value, icons, in-card CTA buttons |
| `list` | Bulleted or stacked text rows |
| `buttons` | Standalone button row (CTAs not inside cards) |
| `form` | Labeled input fields |

Preview respects `page.theme` (`dark` | `light`) and `page.type` (`dashboard` | `landing` | `form` | `other`).

### 7.5 JSON viewer

- Syntax-highlighted raw JSON
- Collapsible tree view
- Copy to clipboard
- Download as `.json` file

### 7.6 History

- Store last **20** generations in `localStorage` (no backend)
- Each entry: `id`, `createdAt`, `thumbnail`, `ocr`, `uiJson`
- Reload restores Generate page state
- Per-item delete

### 7.7 Pages & navigation

| Route | Purpose |
|-------|---------|
| `/` | Marketing landing with feature overview and CTA to Generate |
| `/generate` | Main tool: upload, pipeline, preview, JSON output |
| `/history` | Local generation history |

Shared app shell with navigation between pages.

---

## 8. Data Model

### 8.1 Top-level shape

```json
{
  "page": {
    "type": "dashboard | landing | form | other",
    "theme": "dark | light",
    "sections": [ /* UiSection[] */ ]
  }
}
```

### 8.2 Section types

Defined in `types/ui-schema.ts` and validated in `lib/schemas.ts`.

| Type | Key fields |
|------|------------|
| `navbar` | `items: string[]` |
| `sidebar` | `items: string[]` |
| `hero` | `title`, `subtitle?`, `image_url?` |
| `card_grid` | `columns`, `cards[]` with `title`, `value?`, `icons?`, `button?` |
| `list` | `items: string[]` |
| `buttons` | `items[]` with `label`, `variant?`, colors |
| `form` | `fields[]` with `label`, `type?`, `placeholder?` |

### 8.3 Asset placeholders

Screenshots cannot yield real CDN URLs. The model emits **empty strings** for assets the user fills in later:

| Field | Location | Notes |
|-------|----------|-------|
| `image_url` | `hero` | Hero/banner image |
| `icon_url` | `card.icons[]` | Small icon beside feature text |
| `background_color` | `button`, `card.button` | Hex or `""` |
| `text_color` | `button`, `card.button` | Hex or `""` |

**CTA placement rule:** CTAs inside cards use `card.button`. Standalone button rows use a separate `buttons` section.

---

## 9. Non-Functional Requirements

### Performance

| Stage | Limit |
|-------|-------|
| API route (`maxDuration`) | 120s (local) |
| OCR | 25s timeout |
| Groq vision | 45s timeout |
| Client image size | ≤ 10 MB; resized to 1280px width |

### Reliability

- OCR failure must not abort the pipeline (vision-only fallback)
- AI errors return structured JSON with `step`, `retryable`, and HTTP status
- Retry without re-upload when `retryable: true`

### Security & privacy

- `GROQ_API_KEY` stored server-side only (`.env.local` / deployment env)
- No user accounts; no server-side persistence of uploads or JSON
- History is browser-local only

### Compatibility

- Node.js 20+
- Modern browsers with `localStorage` support
- Deploy target: Netlify (with Next.js plugin)

### Accessibility & UX

- Loading states with step-specific labels during OCR and AI
- Toast notifications for warnings (e.g., OCR fallback) and errors
- Responsive layout: upload column + output column on large screens

---

## 10. Technical Architecture

```text
┌─────────────────────────────────────────────────────────┐
│  Client (Next.js App Router, React 19)                  │
│  ┌──────────┐  ┌─────────────┐  ┌─────────────────────┐ │
│  │ Upload   │  │ Preview     │  │ JSON Viewer         │ │
│  │ (resize) │  │ Renderer    │  │ (syntax + tree)     │ │
│  └────┬─────┘  └─────────────┘  └─────────────────────┘ │
│       │         Zustand (app-store) + localStorage history│
└───────┼─────────────────────────────────────────────────┘
        │ POST /api/generate (multipart file)
        ▼
┌─────────────────────────────────────────────────────────┐
│  API Route (Node.js runtime, maxDuration 120s)          │
│  1. Validate MIME + size                                │
│  2. services/ocr.ts → Tesseract.js                      │
│  3. services/groq-parser.ts → Groq vision + Zod + normalize│
└─────────────────────────────────────────────────────────┘
```

### Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router), TypeScript (strict) |
| UI | Tailwind CSS v4, shadcn-style components, Framer Motion |
| State | Zustand |
| OCR | tesseract.js v7 |
| AI | groq-sdk |
| Validation | Zod v4 |

### Key modules

| Path | Responsibility |
|------|----------------|
| `app/api/generate/route.ts` | Upload validation, orchestration |
| `services/ocr.ts` | Tesseract worker with timeout |
| `services/groq-parser.ts` | Vision prompt, JSON parse, Zod |
| `lib/normalize-ui.ts` | Default empty asset URLs/colors |
| `lib/history.ts` | localStorage CRUD (cap 20) |
| `components/preview/` | Section renderers |
| `components/json/json-viewer.tsx` | Raw + tree views |

---

## 11. Constraints & Known Limitations

| Limitation | Impact |
|------------|--------|
| **Netlify function timeout (26s in config)** | Production OCR + AI may timeout unless limits are raised or tool is run locally |
| **No real image URLs** | Preview uses placeholders; user must supply assets manually |
| **Single-screen focus** | Multi-page flows and deep component trees are out of scope |
| **OCR quality** | Depends on screenshot resolution, font, and contrast; fallback is vision-only |
| **AI inference** | Layout hierarchy is best-effort; complex or novel UIs may misclassify sections |
| **No collaboration** | History is per-browser, not synced across devices |
| **Groq dependency** | Requires API key and external service availability |

---

## 12. Out of Scope (MVP)

- Figma API integration or plugin
- User authentication or cloud sync
- Pixel-perfect CSS/code export (React/Vue/HTML)
- Real image extraction or icon generation from screenshots
- Batch processing of multiple screens
- Custom schema editing in the UI
- Paid tiers or usage metering

---

## 13. Future Considerations

Prioritized ideas for post-MVP iterations:

1. **Code export** — Generate React/Tailwind components from validated JSON
2. **Figma plugin** — Push JSON directly from Figma selections
3. **Longer server timeouts** — Background jobs or edge/worker architecture for production OCR + AI
4. **Schema extensions** — Tables, modals, tabs, charts
5. **Asset upload** — Let users map placeholder URLs to uploaded files in preview
6. **Comparison view** — Side-by-side screenshot vs preview overlay
7. **Cloud history** — Optional account-backed sync

---

## 14. Environment & Deployment

### Required environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API secret key |

### Deployment (Netlify)

- Build: `npm run build`
- Plugin: `@netlify/plugin-nextjs`
- OCR WASM files bundled via `netlify.toml` and `next.config.ts` tracing includes

---

## 15. Acceptance Criteria (MVP)

The MVP is complete when:

- [ ] User can upload a valid screenshot and receive schema-valid JSON within 120s locally
- [ ] Preview renders all supported section types from generated JSON
- [ ] JSON can be copied and downloaded from the Generate page
- [ ] OCR failure shows a warning and still returns JSON when AI succeeds
- [ ] History stores, reloads, and deletes entries (max 20)
- [ ] Invalid uploads are rejected with clear errors before API call
- [ ] Landing page explains the three-step value prop (OCR → AI → Preview)

---

## 16. Open Questions

| Question | Notes |
|----------|-------|
| Should production use a queue/worker for >26s pipelines? | Blocks reliable Netlify hosting today |
| Is multi-model fallback (non-Groq) needed for resilience? | Not implemented |
| Should JSON schema versioning be explicit in output? | History items from older shapes may differ |
| Target accuracy benchmark for section classification? | No formal eval set yet |

---

## Appendix: Example Output

Mobile landing page (abbreviated):

```json
{
  "page": {
    "type": "landing",
    "theme": "light",
    "sections": [
      {
        "type": "hero",
        "title": "Welcome to eSIM",
        "subtitle": "With the Smart eSIM, you never have to worry about losing or breaking your SIM card!",
        "image_url": ""
      },
      {
        "type": "card_grid",
        "columns": 1,
        "cards": [
          {
            "title": "Buy New eSIM",
            "value": "Check available numbers, buy your favorite one online and activate it on an eSIM.",
            "icons": [
              { "icon_url": "", "text": "Starts from 8 USD" },
              { "icon_url": "", "text": "Only takes 5 minutes" }
            ],
            "button": {
              "label": "Buy now",
              "variant": "primary",
              "background_color": "#009639",
              "text_color": "#FFFFFF"
            }
          }
        ]
      }
    ]
  }
}
```
