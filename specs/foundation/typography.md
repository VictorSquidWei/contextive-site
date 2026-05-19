# Typography

Three typefaces, one body default, and two custom classes. Every text style in the codebase composes from this set.

## File(s)

- [index.html](../../index.html) lines 24–27 — Google Fonts `<link>`
- [src/index.css](../../src/index.css) — body default + `.small-caps` + `.display` + `.text-balance`
- [tailwind.config.js](../../tailwind.config.js) `fontFamily` (lines 15–19) + `letterSpacing` (20–23)

## Typefaces

| Family | Weights loaded | Tailwind alias | Role |
|---|---|---|---|
| **Inter** | 300, 400, 500, 600, 700 | `font-sans` (default) | Body copy, paragraphs |
| **Space Grotesk** | 300, 400, 500, 600, 700 | `font-display` | Headlines, term wordmarks, large numbers |
| **JetBrains Mono** | 400, 500, 700 | `font-mono` | `.small-caps` micro-labels |

All three are loaded from Google Fonts with `&display=swap`. `<link rel="preconnect">` to `fonts.googleapis.com` and `fonts.gstatic.com` is set in `index.html`.

## Body default

Defined in [src/index.css](../../src/index.css) `@layer base body`:

- `font-family: 'Inter', sans-serif`
- `color: rgb(var(--color-ink))`
- `background-color: rgb(var(--color-paper))`
- `-webkit-font-smoothing: antialiased`
- `-moz-osx-font-smoothing: grayscale`

The `<body>` also carries `class="antialiased bg-paper text-ink"` for redundancy. `<html>` carries `class="bg-paper"`.

## Custom classes

### `.small-caps`

A monospace micro-label used for metadata, section markers, button text, captions.

```css
font-family: 'JetBrains Mono', monospace;
letter-spacing: 0.3em;
font-size: 10px;
font-weight: 500;
text-transform: uppercase;
```

Always uppercase, always 10px, always JetBrains Mono. Used widely; **do not change the size here without auditing every consumer** — many places set tighter `text-[9px]` or `text-[10px]` overrides on top.

### `.display`

A headline base that pairs Space Grotesk with tight tracking.

```css
font-family: 'Space Grotesk', sans-serif;
letter-spacing: -0.02em;
```

In practice, most headlines use `font-display` (the Tailwind alias) directly with explicit `tracking-tight` rather than this class. Both routes are valid.

### `.text-balance`

```css
text-wrap: balance;
```

Applied to multi-line headlines and pull-quotes to even out line breaks. Modern-browser feature; falls back to normal wrap gracefully.

## Tailwind extensions

```js
letterSpacing: {
  widest: '0.3em',
  ultrawide: '0.42em',
}
```

`tracking-widest` is the default `.small-caps` value. `tracking-ultrawide` exists but is currently unused; reserved for future hero or pull-quote treatments.

## Type scale conventions

- Section h2 headlines: `text-4xl lg:text-5xl` (occasionally `text-6xl` at the Final CTA)
- Hero headline: arbitrary stepped scale `text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] xl:text-[6.5rem]` (Hero spec owns this)
- Card titles: `text-3xl sm:text-4xl` (DossierCard) or `text-xl` (System steps)
- Body paragraphs: `text-base lg:text-lg` for hero/intro paragraphs, `text-sm` inside cards
- `.small-caps` labels: always 10px (fixed by the class)
- The Logo wordmark: see [components/Logo.md](../components/Logo.md) — sized `text-sm` (default) or `text-xl sm:text-2xl` (lg variant)

## Boundary

You may change in this spec:
- Adding a new font weight (load it in [index.html](../../index.html), no other code change needed).
- Adding a new `.text-*` utility class (declare it here, define it in `@layer components`).

You must update *other specs* before changing:
- Changing the body font (touches every component).
- Changing `.small-caps` size, family, or letter-spacing (used across every section).
- Changing a Tailwind font alias (cascade across all components).

## Out of scope

- Per-component headline sizes — owned by each component spec.
