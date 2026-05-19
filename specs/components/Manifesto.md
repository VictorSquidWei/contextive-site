# Manifesto

A black (in light) full-bleed pull-quote section between the Archive and Campaigns.

## File(s)

- [src/components/Manifesto.tsx](../../src/components/Manifesto.tsx)

## Purpose

A loud editorial break in the page rhythm. Sets the rhetorical premise as a quotable claim before the Campaigns deep dive.

## Visual contract

### Section

```html
<section class="bg-ink text-paper dark:bg-canvas dark:text-ink
                px-6 lg:px-12 py-24 lg:py-32 relative overflow-hidden">
```

**Inverted block.** In light: black bg + paper text. In dark: canvas bg + ink text. See [theming.md](../foundation/theming.md).

`overflow-hidden` because of the absolute-positioned background pattern.

### Background pattern

```html
<div class="absolute inset-0 opacity-[0.04]"
     style="background-image:
       repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 16px)" />
```

A 45° diagonal hairline pattern at 4% opacity. Uses literal `#fff` (one of the few inline hex values on the site, documented in [theming.md](../foundation/theming.md) as intentional — reads as subtle in both light and dark).

### Inner grid

`max-w-screen-xl mx-auto relative` → `grid lg:grid-cols-12 gap-12`

#### Left (`lg:col-span-2`)

`<div class="small-caps text-paper/50 dark:text-ink/50">// MANIFESTO</div>` — section marker.

#### Right blockquote (`lg:col-span-10`)

`space-y-8` rhythm.

- **Pull-quote** — `<p class="font-display font-bold text-balance text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-[1.05] tracking-tight">`.
  - Opens with `In geopolitics, language doesn't describe reality.`
  - Wraps the dim phrase `It sets the terms for how reality is understood.` in `<span class="text-paper/40 dark:text-ink/40">` to give it a faded contrast against the full-strength surrounding text.
  - Closes with `Most readers see headlines. They don't see the language decisions underneath them.`

- **Attribution `<footer>`** — `flex items-center gap-3 small-caps text-paper/60 dark:text-ink/60`.
  - Short 24×1px divider: `<span class="w-6 h-px bg-paper/40 dark:bg-ink/40" />`
  - Caption: `FROM "THE WORDS THAT MOVE MARKETS" — CONTEXTIVE`

## Light / dark mode

Inverted block. Every paper-token utility inside is paired with its ink companion per [theming.md](../foundation/theming.md):

| Element | Light | Dark |
|---|---|---|
| Section bg | `bg-ink` | `dark:bg-canvas` |
| Default text | `text-paper` | `dark:text-ink` |
| Section marker | `text-paper/50` | `dark:text-ink/50` |
| Dim phrase | `text-paper/40` | `dark:text-ink/40` |
| Footer text | `text-paper/60` | `dark:text-ink/60` |
| Footer divider bg | `bg-paper/40` | `dark:bg-ink/40` |

## Responsive behavior

- Pull-quote scale: `text-3xl sm:text-4xl lg:text-5xl xl:text-6xl` — 4 breakpoint steps.
- Grid collapses to single column below `lg`. Section marker moves above the blockquote.

## Dependencies

- **Imports**: none. Static content.
- **Imported by**: [App.tsx](../../src/App.tsx).
- **Foundation specs**: [theming.md](../foundation/theming.md), [typography.md](../foundation/typography.md), [layout.md](../foundation/layout.md).

## Boundary

You may change in this spec:
- The pull-quote text and which sub-phrase is dimmed.
- The attribution caption.
- Background pattern angle, line color, or opacity.
- The pull-quote type scale at each breakpoint.

You must update *other specs* before changing:
- Removing the inverted-block treatment (touches [theming.md](../foundation/theming.md)).
- Removing the `lg:col-span-2` / `lg:col-span-10` split (this is a documented grid pattern).

## Out of scope

- The diagonal pattern's `#fff` value — documented in [theming.md](../foundation/theming.md) as an intentional exception.
