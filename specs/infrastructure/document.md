# Document Shell

The HTML document, React root, and page composition — `index.html`, `src/main.tsx`, `src/App.tsx`.

## File(s)

- [index.html](../../index.html)
- [src/main.tsx](../../src/main.tsx)
- [src/App.tsx](../../src/App.tsx)

## `index.html`

The static HTML shell served to every visitor before the React bundle loads.

### `<html>`

`<html lang="en" class="bg-paper">` — language declaration + initial paper background (prevents a white flash if React mounts slowly).

### `<head>`

- `<meta charset="UTF-8">`
- `<link rel="icon" type="image/svg+xml" href="/favicon.svg">` — see [public/favicon.svg](../../public/favicon.svg).
- `<meta name="viewport" content="width=device-width, initial-scale=1.0">`
- `<meta name="theme-color" content="#F5F5F3">` — matches light-mode `paper`. **Note:** this hardcoded hex is currently only correct for light mode; in dark mode the browser chrome will still tint paper. Acceptable cosmetic gap; not currently dynamically updated.
- `<title>Contextive — Language Intelligence</title>`
- `<meta name="description">` — fallback SEO description.
- **Open Graph tags** (`og:title`, `og:description`, `og:type`, `og:url`) for link previews. `og:url` is `https://contextive.ai`.
- **Twitter Card tags** (`twitter:card`, `twitter:site`, `twitter:title`, `twitter:description`) — `summary_large_image` format, no image asset currently linked.
- **Fonts** — preconnect to `fonts.googleapis.com` + `fonts.gstatic.com`, then a single `<link>` to load three families with weights (see [typography.md](../foundation/typography.md)).

### `<body>`

`<body class="antialiased bg-paper text-ink">` — redundant with the `:root`-level body styles in [src/index.css](../../src/index.css), kept as a hedge against FOUC.

Inside: `<div id="root"></div>` then `<script type="module" src="/src/main.tsx"></script>`.

## `src/main.tsx`

Tiny React mount.

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
```

- `StrictMode` is on. In dev, effects mount-cleanup-remount once (verified safe for ThemeToggle — it idempotently writes the same class).
- The `!` non-null assertion on `getElementById('root')` is acceptable because `index.html` guarantees the element exists.

## `src/App.tsx`

Page composition. The order of sections is the source of truth for the page's vertical flow. Every section (except Nav) is wrapped in [`<SectionReveal>`](../components/SectionReveal.md) — see [foundation/motion.md](../foundation/motion.md) for the entrance-animation mechanism.

```tsx
<div className="min-h-screen bg-paper text-ink">
  <Nav />
  <main>
    <SectionReveal><Hero /></SectionReveal>
    <SectionReveal><Ticker /></SectionReveal>
    <SectionReveal><Thesis /></SectionReveal>
    <SectionReveal><Archive /></SectionReveal>
    <SectionReveal><Manifesto /></SectionReveal>
    <SectionReveal><Campaigns /></SectionReveal>
    <SectionReveal><System /></SectionReveal>
    <SectionReveal><FinalCTA /></SectionReveal>
  </main>
  <SectionReveal><Footer /></SectionReveal>
</div>
```

| Position | Component | Wrapped in SectionReveal | Section ID | Notes |
|---|---|---|---|---|
| 1 | Nav | **no** (sticky, always visible) | — | Sticky |
| 2 | Hero | yes | `#top`, `#waitlist` | Above-the-fold — reveal plays on first paint |
| 3 | Ticker | yes | — | Inverted block |
| 4 | Thesis | yes | `#thesis` | Elevated surface |
| 5 | Archive | yes | `#archive` | — |
| 6 | Manifesto | yes | — | Inverted block |
| 7 | Campaigns | yes | `#campaigns` | Elevated surface |
| 8 | System | yes | `#system` | — |
| 9 | FinalCTA | yes | — | — |
| 10 | Footer | yes | — | Inverted block |

The outer `<div class="min-h-screen bg-paper text-ink">` guarantees the page bg/color even before `<body>` styles apply.

## Boundary

You may change in this spec:
- `<title>`, `<meta>` content, OG/Twitter tags.
- Theme-color value (must remain matched to a CSS variable in light mode).
- Section order in App.tsx — but document any change here AND check that Nav anchor IDs still point to existing sections.
- The fonts loaded (must update [typography.md](../foundation/typography.md) too).

You must update *other specs* before changing:
- Removing `StrictMode` — would affect ThemeToggle's mount behavior; document the intent.
- Adding routing (currently single-page; introducing react-router etc. would touch every component's `id`-based anchors).
- The `root` element id.
- Removing the `<SectionReveal>` wrappers from any section — touches [SectionReveal.md](../components/SectionReveal.md) and [motion.md](../foundation/motion.md).
- Wrapping Nav (intentionally excluded — it's sticky).

## Out of scope

- Per-section content — owned by component specs.
- Tailwind/Vite config — see [build.md](build.md).
