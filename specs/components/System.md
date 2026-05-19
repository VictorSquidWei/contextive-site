# System

Section 04 — explains the pipeline: 4 numbered steps + a 3-column "strap" of operating principles.

## File(s)

- [src/components/System.tsx](../../src/components/System.tsx)

## Purpose

A how-it-works section. Shows the four-stage pipeline as a 1/2/4-column grid, then closes with three labels (PIPELINE / CADENCE / SCOPE) summarizing operating cadence.

## Static data

`STEPS` is declared inline at the top of the file: 4 entries with `number`, `title`, `body`. Steps are `01` Signal Detection → `02` Context Mapping → `03` Intelligence Files → `04` Archive.

## Visual contract

### Section

`<section id="system" class="px-6 lg:px-12 py-24 lg:py-32 bg-paper">`

Standard page-bg section (returns to `bg-paper` after the elevated Campaigns).

### Header

```html
<div class="mb-16 max-w-3xl">
  <span class="small-caps text-muted">// 04 — The System</span>
  <h2 class="font-display font-bold tracking-tight text-4xl lg:text-5xl mt-6 …">Signal in. Intelligence out.</h2>
  <p class="text-muted mt-6 leading-relaxed text-lg max-w-2xl">…</p>
</div>
```

### Steps grid

```html
<div class="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-rule border border-rule">
  {STEPS.map(s => (
    <div class="bg-paper p-7 lg:p-9 space-y-6 group hover:bg-canvas transition-colors">
      …
    </div>
  ))}
</div>
```

1px-line grid (see [layout.md](../foundation/layout.md)).

Each step cell:

1. **Number + STAGE label row** — `flex items-baseline justify-between`
   - `<span class="font-display font-bold text-3xl">{s.number}</span>`
   - `<span class="small-caps text-muted opacity-0 group-hover:opacity-100 transition-opacity">STAGE</span>` — the `STAGE` label appears on hover (reveal pattern).

2. **Dashed divider** — `<div class="institution-rule"></div>` — see [theming.md](../foundation/theming.md). 1px high, dashed-look gradient using `currentColor` so it inherits.

3. **Title + body**
   - `<h3 class="font-display font-bold text-xl leading-tight">{s.title}</h3>`
   - `<p class="text-sm text-muted leading-relaxed">{s.body}</p>`

Each cell also has `group hover:bg-canvas transition-colors` — hovering shifts the cell bg from `paper` to `canvas` (subtle elevation pulse).

### Bottom strap

```html
<div class="mt-16 grid lg:grid-cols-3 gap-8 lg:gap-16 pt-12 border-t border-rule">
```

Three columns: PIPELINE / CADENCE / SCOPE. Each:

```html
<div class="small-caps text-muted mb-2">{LABEL}</div>
<div class="font-display text-lg leading-snug">{phrase}</div>
```

## Light / dark mode

All token-based. No `dark:` overrides.

- The `paper → canvas` hover shift works in both modes (paper-dark → canvas-dark in dark mode — both near-black but distinguishable).
- `.institution-rule` uses `currentColor` so it inherits the cell's text color — black in light, off-white in dark. See [theming.md](../foundation/theming.md).

## Responsive behavior

- < `md`: 1 column. < `lg`: 2 columns. ≥ `lg`: 4 columns.
- Cell padding `p-7 lg:p-9`.
- Strap: `lg:grid-cols-3` (stacks vertically below `lg`).

## Dependencies

- **Imports**: none. `STEPS` is inline.
- **Imported by**: [App.tsx](../../src/App.tsx).
- **Foundation specs**: [layout.md](../foundation/layout.md), [theming.md](../foundation/theming.md) (`institution-rule`).

## Boundary

You may change in this spec:
- The 4 step entries (`STEPS` array — number / title / body).
- The 3 strap entries (currently hardcoded inline).
- The `group-hover` reveal of `STAGE`.
- Cell padding (`p-7 lg:p-9`).

You must update *other specs* before changing:
- Adding a 5th step (would break `lg:grid-cols-4` rhythm; reconsider grid).
- Removing the `institution-rule` divider (touches [theming.md](../foundation/theming.md)).
- The `id="system"` (breaks Nav anchor).

## Out of scope

- Section ordering — owned by [App.tsx](../../src/App.tsx).
