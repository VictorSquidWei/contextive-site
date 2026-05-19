# DossierCard

The recurring "intelligence file" card. Used in two places: rotating stack in Hero, grid in Archive.

## File(s)

- [src/components/DossierCard.tsx](../../src/components/DossierCard.tsx)

## Purpose

A textured, bordered card that displays one `TermFile` — metadata header, term wordmark, three stats (velocity, sentiment, files), a contextual note, and a footer with first-seen and status.

## Props

| Prop | Type | Default | Effect |
|---|---|---|---|
| `term` | `TermFile` | required | The data record to render. Shape defined in [data/terms.md](../data/terms.md). |
| `compact` | `boolean` | `false` | When true, fixes width to `300px sm:340px`. Otherwise the card stretches `w-full`. |

## Visual contract

### Outer `<article>`

`paper-grain dossier-shadow {compact-width-or-w-full} border border-ink/10 p-7 sm:p-8 flex flex-col gap-6 text-ink relative`

- **`paper-grain`** — see [foundation/theming.md](../foundation/theming.md). Provides the card's textured surface; themes via `var(--color-canvas)` and switches the dot color in `.dark`.
- **`dossier-shadow`** — soft three-layer drop shadow ([motion.md](../foundation/motion.md) section CSS), visually elevates the card in light mode. Invisible in dark mode (black on dark); the 10%-opacity ink border carries the elevation in dark.
- **`border border-ink/10`** — hairline edge that becomes visible in dark mode.
- **`p-7 sm:p-8`** — interior padding bumps from 28px to 32px at 640px.
- **`gap-6`** — 24px vertical rhythm between sections.

### Internal structure (top to bottom)

1. **Top metadata bar** — `flex items-start justify-between border-b border-ink/15 pb-5`
   - Left: `REF / {term.ref}` and `{term.campaign}` in `small-caps text-ink/60` and `text-ink/40`.
   - Right: `{term.classification}` and `CONF. HIGH` (also `small-caps`).

2. **Term title block**
   - `<div class="small-caps text-muted">TERM PROFILE</div>`
   - `<h3 class="font-display font-bold uppercase leading-[0.95] tracking-tight text-3xl sm:text-4xl text-balance">{term.term}</h3>`
   - `<div class="small-caps text-muted">{term.domain}</div>`

3. **Stats grid** — `grid grid-cols-3 gap-4 pt-2 pb-2 border-y border-ink/10 py-4`
   - **VELOCITY**: label + `<VelocityBar>` + uppercase velocity value
   - **SENTIMENT**: label + `+` / `−` / `·` + fixed-decimal value in `font-mono`
   - **FILES**: label + `term.totalFiles.toLocaleString()` in `font-mono`

4. **Contextual note** — `flex-1 space-y-3`
   - `⚐` glyph + `CONTEXTUAL NOTE` label (small-caps, ink/40)
   - `<p class="font-display text-base leading-snug text-balance">{term.scope}</p>` — short framing line
   - `<p class="text-[13px] leading-relaxed text-muted">{term.contextNote}</p>` — longer detail

5. **Footer** — `flex items-center justify-between pt-4 border-t border-ink/10 mt-auto`
   - `FIRST SEEN / {term.firstSeen}` (small-caps)
   - `{term.status}` + a 10×10 outlined square (`w-2.5 h-2.5 border border-ink/40`)

## Sentiment tone glyph

Computed once per render:

```ts
term.sentiment > 1   → '+'
term.sentiment < -1  → '−'  (U+2212 minus sign)
otherwise            → '·'
```

## VelocityBar

A 4-bar mini-chart. Four `<div class="w-[3px]">` bars with increasing heights `6, 8, 10, 12px`. Bars at index `<= activeLevel` are `bg-current`; others are `bg-current opacity-15`. Levels:

```ts
FALLING → 1   STEADY → 2   RISING → 3   SPIKING → 4
```

`transition-colors` on each bar so they respond to theme switch.

## Light / dark mode

- `paper-grain` themes via foundation (canvas bg in both modes, dot color flips).
- All inner text uses `text-ink/N` or `text-muted` — auto-flips.
- The dossier-shadow has no visible effect in dark mode; the `border-ink/10` provides edge definition. Documented and intentional in [theming.md](../foundation/theming.md).

## Responsive behavior

- Padding `p-7 sm:p-8` and title `text-3xl sm:text-4xl` step at 640px.
- `compact={true}` width `w-[300px] sm:w-[340px]`.
- In Hero, the rotating stack constrains visible width — see [Hero.md](Hero.md).
- In Archive, the parent grid determines the cell width — see [Archive.md](Archive.md).

## Dependencies

- **Imports**: `TermFile` type from `../data/terms`.
- **Imported by**: [Hero.tsx](../../src/components/Hero.tsx), [Archive.tsx](../../src/components/Archive.tsx).
- **Foundation specs**: [theming.md](../foundation/theming.md) (paper-grain), [typography.md](../foundation/typography.md).

## Boundary

You may change in this spec:
- The order of internal sections (header → title → stats → note → footer).
- Internal section borders' opacity (`border-ink/10` vs `/15`).
- The VelocityBar bar widths, gaps, or height progression.
- Stats grid layout.

You must update *other specs* before changing:
- The `TermFile` shape — owned by [data/terms.md](../data/terms.md).
- The `compact` prop API — used by Hero, would need to update [Hero.md](Hero.md).
- Removing `paper-grain` (touches `[theming.md](../foundation/theming.md)`).

## Out of scope

- Stack layout, rotation timing, blur — owned by Hero.
- Grid placement — owned by Archive.
- Card data — owned by [data/terms.md](../data/terms.md).
