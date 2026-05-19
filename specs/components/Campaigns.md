# Campaigns

Section 03 — a compact horizontally-navigable carousel of campaign blocks. One active campaign is shown at a time; selecting another via a scrollable chip strip animates the new one in. Sized to fit a single standard desktop viewport.

## File(s)

- [src/components/Campaigns.tsx](../../src/components/Campaigns.tsx)

## Purpose

Frames Contextive's editorial focus by spelling out what each campaign covers, what the pillars are inside it, and which terms are being tracked. Designed to scale from **2 to 30+** campaigns without re-layout, and sized so the whole section fits on a standard ~900px-tall desktop viewport.

## State

| State | Type | Initial | Purpose |
|---|---|---|---|
| `activeIdx` | `number` | `0` | Index into `CAMPAIGNS` of the currently displayed campaign |
| `direction` | `'forward' \| 'backward'` | `'forward'` | Slide-in direction for the next remount of the active block |

State transitions:
- `goTo(i)` → sets `direction` based on `i` vs current `activeIdx`, then sets `activeIdx = i`.
- `prev()` → `goTo(activeIdx - 1)` if `> 0`.
- `next()` → `goTo(activeIdx + 1)` if `< CAMPAIGNS.length - 1`.

Plus a `useEffect` on `activeIdx` that calls `scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })` on the matching chip, keeping the active chip centered in the scrollable strip.

## Visual contract

### Section

`<section id="campaigns" class="bg-canvas border-y border-rule px-6 lg:px-12 py-12 lg:py-16">`

Elevated surface (unchanged classification). Vertical padding compacted from `py-24 lg:py-32` to `py-12 lg:py-16` (48px / 64px). Same `id="campaigns"` (Nav anchor).

### Header row

A flex row containing the section eyebrow + headline on the left and the navigator controls (prev / counter / next) on the right. On mobile, the controls stack below.

```html
<div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
  <div>
    <span class="small-caps text-muted">// 03 — Campaigns</span>
    <h2 class="font-display font-bold tracking-tight text-3xl lg:text-4xl mt-4 leading-[1.0] text-balance">
      The vocabulary war, by campaign.
    </h2>
  </div>
  <div class="flex items-center gap-3 shrink-0">
    {prev / counter / next controls}
  </div>
</div>
```

**Reorganization vs. the prior layout:**
- The intro paragraph (`"Each Contextive campaign maps the vocabulary war..."`) has been **deleted**.
- The prev / counter / next controls have **moved up** from below the chip strip to sit inline with the headline (right-aligned on `lg+`, stacked below on smaller).
- Top margin on the headline is `mt-4` (was `mt-6`).
- Headline scale reduced one step: `text-3xl lg:text-4xl` (was `text-4xl lg:text-5xl`).
- Bottom margin on the header row is `mb-6` (was `mb-12`).

### Controls

Identical mechanism to the previous design, just located in the new header row.

```html
<button onClick={prev} disabled={activeIdx === 0} aria-label="Previous campaign"
        class="border border-ink p-2 transition-colors
               enabled:hover:bg-ink enabled:hover:text-paper
               disabled:opacity-40 disabled:cursor-not-allowed">
  <svg …chevron left .../>
</button>
<div class="small-caps tabular-nums text-muted whitespace-nowrap">
  <span class="text-ink">{padded(activeIdx + 1)}</span> / {padded(CAMPAIGNS.length)}
</div>
<button onClick={next} … class="… same pattern …">
  <svg …chevron right /></svg>
</button>
```

`padded(n)` = `String(n).padStart(2, '0')`.

### Chip strip

Unchanged from the prior design — the navigator stays full-width, scroll-snap, with edge fades:

```html
<div class="relative mb-8">
  <div ref={chipRowRef}
       class="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth py-2
              [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
    {chips}
  </div>
  <div class="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-canvas to-transparent" />
  <div class="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-canvas to-transparent" />
</div>
```

Each chip is the same 2-line outline-bordered button (`min-w-[180px] sm:min-w-[200px]`, label + shortTitle, active = `bg-ink text-paper`, inactive = `bg-canvas text-ink hover:bg-ink/5`). Strip bottom margin `mb-8` (was `mb-12`).

### Active campaign block

```html
<div class="relative overflow-hidden">
  <article key={activeIdx}
           class="grid lg:grid-cols-12 gap-8 {slideClass}">
    …number column + content column…
  </article>
</div>
```

Article grid gap `gap-8` (was `gap-12`).

#### Number column (`lg:col-span-3`)

```html
<div class="flex lg:flex-col gap-4 lg:gap-2 items-baseline">
  <div class="campaign-number-pop font-display font-bold text-6xl lg:text-7xl
              leading-none text-ink/90">
    {padded(activeIdx + 1)}
  </div>
  <div>
    <div class="small-caps text-muted mb-1">{active.label}</div>
    <div class="small-caps text-ink">{active.period}</div>
  </div>
</div>
```

Compacted:
- Number scale `text-6xl lg:text-7xl` (was `text-7xl lg:text-8xl`).
- Mobile horizontal gap `gap-4` (was `gap-6`); desktop vertical gap `lg:gap-2` (was `lg:gap-3`).

Big number still carries `campaign-number-pop` for the layered scale-and-fade entrance with a 150ms delay (see [motion.md](../foundation/motion.md)).

#### Content column (`lg:col-span-9 space-y-6`)

`space-y-6` (was `space-y-10`).

1. **Title block** — `space-y-3` (was `space-y-5`)
   - h3 `font-display font-bold tracking-tight text-2xl lg:text-3xl leading-[1.05] text-balance` (scale reduced one step from `text-3xl lg:text-4xl`).
   - Intro `<p class="text-muted leading-relaxed text-base max-w-3xl text-balance">` (was `text-lg`).

2. **Pillars grid** — `grid md:grid-cols-3 gap-px bg-rule border border-rule`
   - Each pillar: `bg-canvas p-5 lg:p-6 space-y-2` (was `p-6 lg:p-8 space-y-3`).
   - Inner: `PILLAR / 0N` label small-caps, h4 `font-display font-bold text-base leading-tight` (was `text-lg`), body `text-sm text-muted leading-relaxed` (unchanged).

3. **Tracked-terms chips** — `space-y-2` (was `space-y-3`)
   - Label: `<div class="small-caps text-muted">TRACKED TERMS</div>`
   - Chips: `<div class="flex flex-wrap gap-2">` — each chip is the existing outline-to-solid cursor-default term chip, unchanged.

## Behavior contract

Identical to the prior design — only the layout/sizing changed.

- Click any chip → that campaign becomes active; the article remounts with a slide animation; the chip auto-scrolls to center.
- Click prev (←) → step backward, slide-in from left.
- Click next (→) → step forward, slide-in from right.
- Disabled prev at index 0; disabled next at last index.
- Touch/mouse drag on the chip strip → native horizontal scroll with snap.
- No keyboard arrow-key handler (avoids form-input interference).
- No wrap-around; no autoplay.

## Light / dark mode

Every utility token-based. Campaigns is **not** an inverted block (it's an elevated surface like Thesis). No `dark:` overrides anywhere in the component. See the table in [data/terms.md](../data/terms.md) and [design-tokens.md](../foundation/design-tokens.md).

## Responsive behavior

- `< lg`: header row stacks (controls below headline); article grid collapses; number column stacks horizontally above content.
- `< md`: pillars grid collapses (`md:grid-cols-3` → 1 column).
- Chip strip is horizontally scrollable at every viewport.

## Height budget

Targeted total section height on a 1280px-wide desktop:
- Padding top/bottom: 128px
- Header row: ~70px (headline + inline controls)
- mb-6 between header and chip strip: 24px
- Chip strip with py-2: ~70px
- mb-8 between strip and article: 32px
- Active article: max(number col ~150px, content col ~360–400px) → ~400px
- **Total ≈ 700–730px.**

Fits a 1080p viewport (~937px usable with browser chrome) with ~200px of headroom. Combined with the page-level `<SectionReveal>` wrapper, each campaign view feels like its own staged unit when the section lifts into view.

## Data dependency

Each entry in `CAMPAIGNS` must include the `shortTitle: string` field. See [data/terms.md](../data/terms.md) for the full shape. The hardcoded section intro paragraph that used to render between the headline and the chip strip is **gone**; if you want section-level intro copy back, document it here and restore it in the JSX.

## Dependencies

- **Imports**: `useEffect`, `useRef`, `useState` from React; `CAMPAIGNS` from `../data/terms`.
- **Imported by**: [App.tsx](../../src/App.tsx), wrapped in [`<SectionReveal>`](SectionReveal.md).
- **Foundation specs**: [layout.md](../foundation/layout.md), [motion.md](../foundation/motion.md) (campaign slide keyframes + section-reveal), [interactions.md](../foundation/interactions.md), [design-tokens.md](../foundation/design-tokens.md), [theming.md](../foundation/theming.md).

## Boundary

You may change in this spec:
- Chip `min-w` values.
- Slide-in distance / duration / easing (also edit [motion.md](../foundation/motion.md) keyframes if you change the curves).
- The 2-line chip layout.
- Prev/next disabling behavior.
- The 12-column split inside the active block (currently 3/9).
- Pillar count assumption (currently 3 per campaign — `md:grid-cols-3`).
- The section headline copy.
- Vertical padding within the documented height budget.

You must update *other specs* before changing:
- Adding new campaign data fields — touches [data/terms.md](../data/terms.md).
- Adding a 3rd campaign domain on `TermFile.campaign` — touches [Archive.md](Archive.md) tab list.
- Removing the `shortTitle` field — breaks this navigator; touches [data/terms.md](../data/terms.md).
- The `id="campaigns"` (breaks Nav anchor).
- The three slide / pop keyframes — touches [motion.md](../foundation/motion.md).
- Restoring or rewriting the section intro paragraph (this spec documents its removal).

## Out of scope

- Campaign content (titles, descriptions, pillars, term lists) — owned by [data/terms.md](../data/terms.md).
- The chip's color-token resolution — owned by [design-tokens.md](../foundation/design-tokens.md).
- The slide / pop keyframe definitions — owned by [motion.md](../foundation/motion.md).
- The section's entrance animation when scrolled into view — owned by [SectionReveal.md](SectionReveal.md).
