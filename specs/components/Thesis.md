# Thesis

Section 01 — the editorial argument: "the words people choose are never random." Pairs a sticky left-column headline with a long-form right column.

## File(s)

- [src/components/Thesis.tsx](../../src/components/Thesis.tsx)

## Purpose

The first content section after the Hero. Establishes the editorial thesis with three paragraphs, then closes with a two-stat block to ground the claim numerically.

## Visual contract

### Section

`<section id="thesis" class="bg-canvas border-y border-rule px-6 lg:px-12 py-24 lg:py-32">`

**Elevated surface.** This is one of two sections (along with Campaigns) that uses `bg-canvas` to elevate from the page's `bg-paper`. Top + bottom hairline rule (`border-y border-rule`).

### Inner grid

`max-w-screen-xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20`

#### Left column (`lg:col-span-4`)

`<div class="lg:sticky lg:top-32">` — sticks the headline alongside the scrolling right column on desktop.

- `<span class="small-caps text-muted">// 01 — Thesis</span>` — section marker.
- `<h2 class="font-display font-bold tracking-tight text-3xl lg:text-4xl mt-6 leading-[1.05] text-balance">The words people choose are never random.</h2>`

#### Right column (`lg:col-span-8`)

`space-y-8 text-lg lg:text-xl leading-[1.55] text-ink/85 text-balance` — long-form body with relaxed line-height.

- **Paragraph 1** — the policy frame example ("reciprocal" vs "aggressive"). `<em>` tags around the contrast terms.
- **Paragraph 2** — the corporate frame example ("workforce optimization" vs "replaced by AI").
- **Paragraph 3** — the Contextive pitch line. Uses `text-ink font-medium` (no `/85` opacity) to emphasize.

### Stat block

After the paragraphs:

```html
<div class="grid grid-cols-2 gap-px bg-rule pt-8 mt-8 border-t border-rule">
  <div class="bg-canvas pt-8 pr-6">
    <div class="font-display text-4xl lg:text-5xl font-bold tracking-tight">14.3K</div>
    <div class="small-caps text-muted mt-2">Terms tracked across 6 platforms</div>
  </div>
  <div class="bg-canvas pt-8 pl-6">
    <div class="font-display text-4xl lg:text-5xl font-bold tracking-tight">240+</div>
    <div class="small-caps text-muted mt-2">Active intelligence files</div>
  </div>
</div>
```

Two large numbers, each with a one-line small-caps label. Uses the **1px-line grid pattern** ([layout.md](../foundation/layout.md)) — `gap-px bg-rule` between cells, each cell with `bg-canvas`.

## Light / dark mode

All token-based. The section `bg-canvas` ↔ page `bg-paper` contrast holds in both modes (elevated surface is a tonal step away from the page). No `dark:` overrides needed.

## Responsive behavior

- `< lg`: grid collapses to single column. The headline column drops `sticky`.
- Body text: `text-lg` → `lg:text-xl`.
- Stat block numbers: `text-4xl` → `lg:text-5xl`.

## Dependencies

- **Imports**: none. Static content.
- **Imported by**: [App.tsx](../../src/App.tsx).
- **Foundation specs**: [layout.md](../foundation/layout.md), [typography.md](../foundation/typography.md).

## Boundary

You may change in this spec:
- The body copy (all three paragraphs).
- The stat numbers / labels (currently `14.3K` / `240+`).
- The section marker text (`// 01 — Thesis`).
- The `lg:top-32` sticky offset.

You must update *other specs* before changing:
- The `id="thesis"` (breaks Nav anchor).
- Removing `bg-canvas` (this is one of two `bg-canvas` sections — see [layout.md](../foundation/layout.md)).

## Out of scope

- Section ordering — owned by [App.tsx](../../src/App.tsx).
