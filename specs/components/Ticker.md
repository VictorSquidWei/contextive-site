# Ticker

A black strap below the Hero showing a live-scrolling list of tracked terms.

## File(s)

- [src/components/Ticker.tsx](../../src/components/Ticker.tsx)

## Purpose

Reinforces the "we are watching the language" premise. An inverted block (visually distinct from the page) running a horizontal marquee of `TICKER_TERMS` with framing metadata.

## Visual contract

### Outer wrapper

`<div class="border-y border-ink bg-ink text-paper dark:bg-canvas dark:text-ink py-3 overflow-hidden relative">`

**Inverted block.** Carries the foundation override pattern — see [theming.md](../foundation/theming.md). Top + bottom borders use `border-ink` (which themes correctly).

### Edge fades

Two absolute-positioned divs:

- Left: `absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-ink to-transparent dark:from-canvas z-10 pointer-events-none`
- Right: same, mirrored with `right-0` and `bg-gradient-to-l`.

These mask the edges so terms appear to fade in/out rather than pop. The `dark:from-canvas` override matches the bg flip.

### Header line

Above the marquee:

```html
<div class="flex items-center gap-2 small-caps mb-2 px-6 lg:px-12 text-whisper">
  <span class="inline-block w-1.5 h-1.5 bg-paper dark:bg-ink velocity-pulse" />
  <span>LIVE SIGNAL // CROSS-PLATFORM TERM TRACKING</span>
</div>
```

- Pulse dot: 6×6px square (`w-1.5 h-1.5`), uses `velocity-pulse` keyframe (2s ease-in-out infinite, 0.4 ↔ 1.0 opacity). `bg-paper dark:bg-ink` — flips so it's always the bright dot on the dark block.

### Marquee track

```html
<div class="flex marquee-track whitespace-nowrap">
  {items.map((item, i) => (
    <div class="flex items-center gap-3 px-8 shrink-0">
      <span class="font-display text-sm font-bold tracking-tight uppercase text-paper dark:text-ink">{item.term}</span>
      <span class="text-whisper small-caps">{item.meta}</span>
      <span class="text-whisper">·</span>
    </div>
  ))}
</div>
```

- `items` = `[...TICKER_TERMS, ...TICKER_TERMS]` (duplicated to enable seamless looping).
- Animation: see [motion.md](../foundation/motion.md) — `marquee` keyframe, 60s linear infinite, pauses on hover.
- Each item: term wordmark (Space Grotesk Bold) + meta label (`text-whisper`) + a separator dot.

## Data source

`TICKER_TERMS` from [data/terms.md](../data/terms.md). Fourteen entries, each `{ term, meta }`.

## Light / dark mode

Block-level wrapper carries `dark:bg-canvas dark:text-ink`. Inner paper-flavored utilities carry their dark companions:

| Utility | Dark companion |
|---|---|
| `bg-paper` (pulse dot) | `dark:bg-ink` |
| `text-paper` (term span) | `dark:text-ink` |
| Edge gradient `from-ink` | `dark:from-canvas` |

`text-whisper` (header label + meta + separator) auto-flips.

## Responsive behavior

Header row uses `px-6 lg:px-12` to align with section padding. Marquee items use fixed `px-8` (32px) horizontal spacing regardless of viewport. The marquee speed does not adapt — 60s for one full cycle at every viewport.

## Dependencies

- **Imports**: `TICKER_TERMS` from `../data/terms`.
- **Imported by**: [App.tsx](../../src/App.tsx).
- **Foundation specs**: [theming.md](../foundation/theming.md), [motion.md](../foundation/motion.md), [design-tokens.md](../foundation/design-tokens.md).

## Boundary

You may change in this spec:
- The `60s` marquee duration (in [src/index.css](../../src/index.css) `.marquee-track`).
- The `velocity-pulse` timing (2s, in [src/index.css](../../src/index.css)).
- Edge-fade width (`w-12`).
- The header line copy.

You must update *other specs* before changing:
- Removing the duplication (`[...TICKER_TERMS, ...TICKER_TERMS]`) — breaks the seamless loop because the `-50%` translate in the marquee keyframe assumes doubled content. See [motion.md](../foundation/motion.md).
- The `TICKER_TERMS` content — owned by [data/terms.md](../data/terms.md).
- Removing the inverted-block treatment (would require redesign — touches theming spec).

## Out of scope

- The pulse animation — defined in [motion.md](../foundation/motion.md).
- The marquee animation — same.
- Data — owned by [data/terms.md](../data/terms.md).
