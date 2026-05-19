# Archive

Section 02 — a filterable grid of sample DossierCards.

## File(s)

- [src/components/Archive.tsx](../../src/components/Archive.tsx)

## Purpose

Demonstrates the format and breadth of the intelligence archive. Header on the left, three filter tabs on the right, then a responsive 1/2/3-column grid of DossierCards filtered by the active tab.

## State

| State | Type | Initial | Purpose |
|---|---|---|---|
| `active` | `Tab` (`'ALL' \| 'GEOPOLITICS' \| 'AI & WORK'`) | `'ALL'` | Filter selection |

## Visual contract

### Section

`<section id="archive" class="px-6 lg:px-12 py-24 lg:py-32 bg-paper">`

Standard page-bg section. Sits between Thesis (canvas) and Manifesto (inverted) so the paper bg provides tonal contrast.

### Header row

`grid lg:grid-cols-12 gap-12 mb-16`

#### Left (`lg:col-span-7`)

- `<span class="small-caps text-muted">// 02 — Archive</span>`
- `<h2 class="font-display font-bold tracking-tight text-4xl lg:text-5xl mt-6 leading-[1.0] text-balance">Sample intelligence files.</h2>`
- `<p class="text-muted mt-6 max-w-2xl leading-relaxed">…</p>` — intro paragraph.

#### Right (`lg:col-span-5 flex lg:justify-end items-end`)

A grouped tab control: `<div class="flex border border-ink">`.

Each tab: `<button class="px-4 py-3 small-caps transition-colors border-r border-ink last:border-r-0 {active-styles}">`. The internal vertical dividers come from `border-r border-ink` on each tab (with `last:border-r-0` suppressing the trailing one).

Active state: `bg-ink text-paper`. Inactive: `bg-paper text-ink hover:bg-ink/5`.

Tabs in order: **ALL**, **GEOPOLITICS**, **AI & WORK**.

### Grid

`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-rule`

Uses the 1px-line grid pattern. Each cell is `<div class="bg-paper p-px"><DossierCard term={term} /></div>`.

Filter logic:

```ts
filtered = active === 'ALL' ? TERM_FILES : TERM_FILES.filter(t => t.campaign === active)
```

`TERM_FILES` contains 17 entries (8 GEOPOLITICS + 9 AI & WORK).

### Footer note

```html
<div class="flex flex-wrap justify-between items-center mt-12 pt-8 border-t border-rule small-caps text-muted">
  <span>{filtered.length} FILES // SYNTHETIC SAMPLE OUTPUT</span>
  <span>ACCESS LEVEL: DEMO</span>
</div>
```

Top border + small-caps caption row.

## Light / dark mode

All utilities are token-based. No `dark:` overrides.

- Active tab `bg-ink text-paper` becomes a bright white-on-near-black pill in dark mode — visually still the "primary" tab.
- Inactive tabs `bg-paper text-ink` blend with the page bg in dark mode, but the `border border-ink` outline keeps the control bounded and `hover:bg-ink/5` gives a subtle hover lightening.
- DossierCard themes per its own spec — [DossierCard.md](DossierCard.md).

## Responsive behavior

- < `sm`: grid 1 column. < `lg`: 2 columns. ≥ `lg`: 3 columns.
- Tab control may wrap below the header on smaller viewports (the right column is `lg:justify-end items-end` and the grid header collapses).

## Dependencies

- **Imports**: `useState`, `TERM_FILES` from `../data/terms`, `DossierCard`.
- **Imported by**: [App.tsx](../../src/App.tsx).
- **Foundation specs**: [layout.md](../foundation/layout.md) (1px-line grid), [interactions.md](../foundation/interactions.md) (tab pattern is a variant of outline-to-solid).

## Boundary

You may change in this spec:
- Tab labels (must match valid `TermFile.campaign` values or `'ALL'`).
- Grid breakpoints (`sm:grid-cols-2 lg:grid-cols-3`).
- Header copy and the footer note.

You must update *other specs* before changing:
- Adding a fourth campaign — touches [data/terms.md](../data/terms.md) and the `TermFile.campaign` union type.
- The DossierCard internal layout — [DossierCard.md](DossierCard.md).
- The `id="archive"` (breaks Nav anchor).

## Out of scope

- Card internals — [DossierCard.md](DossierCard.md).
- `TERM_FILES` content — [data/terms.md](../data/terms.md).
