# SectionReveal

A transparent wrapper that adds an entrance reveal animation to its children when they scroll into view (or are already in view on first mount).

## File(s)

- [src/components/SectionReveal.tsx](../../src/components/SectionReveal.tsx)

## Purpose

Adds the per-section entrance animation defined in [foundation/motion.md](../foundation/motion.md) (`section-reveal` / `section-reveal.in-view`) to any subtree, **without** the child component needing to know about it. Applied in [App.tsx](../../src/App.tsx) around every top-level section.

The intent: each section feels like its own staged unit. As the user scrolls down the page, sections lift in one at a time. On first paint, the above-the-fold Hero plays its reveal immediately.

## Props

| Prop | Type | Default | Effect |
|---|---|---|---|
| `children` | `ReactNode` | required | Whatever subtree to animate in. |

No other props. Intentionally minimal — the timing, distance, and easing all live in the CSS class.

## State

| State | Type | Initial | Purpose |
|---|---|---|---|
| `visible` | `boolean` | `false` | When `true`, the `in-view` class is applied and the transition plays. |

## Behavior contract

On mount:
1. **Reduced-motion check.** If `window.matchMedia('(prefers-reduced-motion: reduce)').matches`, immediately set `visible = true` and skip creating an observer. The CSS media query also flattens the transition so there's no flicker.
2. Otherwise, create an `IntersectionObserver` with `threshold: 0.1` (10% of the wrapper must be in view to trigger).
3. The observer's callback checks `entry.isIntersecting`. If true, sets `visible = true` AND disconnects the observer (one-shot animation — won't re-trigger on subsequent intersections).
4. On unmount, the observer is disconnected via the effect's cleanup function.

## Visual contract

The wrapper renders a single `<div>` with `className="section-reveal {in-view if visible}"`. No other styling. The wrapper is otherwise transparent — display: block — and inherits the surrounding flow.

The CSS classes are defined in [foundation/motion.md](../foundation/motion.md) and [src/index.css](../../src/index.css):

- `.section-reveal`: opacity 0, `translateY(40px) scale(0.97)`, `will-change: opacity, transform`.
- `.section-reveal.in-view`: opacity 1, `translateY(0) scale(1)`, 800ms cubic-bezier(0.2, 0, 0.2, 1) transition.
- `@media (prefers-reduced-motion: reduce)`: animation disabled.

## Light / dark mode

Animation is theme-agnostic (transforms + opacity only, no color manipulation). Works identically in both modes.

## Performance

- One IntersectionObserver per wrapper instance (one per top-level section, currently 9).
- `will-change: opacity, transform` promotes each wrapper to its own GPU compositor layer for the duration of the animation. The hint is left in the CSS rather than cleared after the animation, which is acceptable here because: (a) we only have ~9 layers, (b) the wrappers are static after the first reveal, and (c) the small composite cost is preferable to layout/paint thrash if the wrappers ever re-animate.
- Each observer disconnects after firing once — no ongoing scroll cost.

## Nesting / layout concerns

- The wrapper is a block-level `<div>`. It does not change layout — its child renders in normal flow.
- Sticky positioning: Nav uses `sticky top-0`. Nav is **not wrapped** in SectionReveal — it's rendered outside `<main>` and stays static.
- Thesis has an inner `lg:sticky lg:top-32` element. That sticky's containing block is the column div inside Thesis, not the SectionReveal wrapper, so the wrapping does not interfere.
- The transform on the wrapper creates a stacking context. This is desired — it isolates each section's compositor layer.

## Dependencies

- **Imports**: `useEffect`, `useRef`, `useState`, `ReactNode` from React.
- **Imported by**: [App.tsx](../../src/App.tsx).
- **Foundation specs**: [motion.md](../foundation/motion.md) (the `section-reveal` CSS contract).
- **Infrastructure specs**: [document.md](../infrastructure/document.md) (which sections are wrapped).

## Boundary

You may change in this spec:
- The IntersectionObserver `threshold` (currently `0.1`).
- The `rootMargin` (currently default `'0px'`).
- The one-shot disconnect behavior (could become re-triggerable for repeat animations).
- The reduced-motion bail-out.

You must update *other specs* before changing:
- The CSS class name `section-reveal` — touches [motion.md](../foundation/motion.md) and [src/index.css](../../src/index.css).
- The animation values (distance, scale, duration, easing) — those live in [motion.md](../foundation/motion.md).
- Which sections get wrapped — touches [document.md](../infrastructure/document.md).
- Removing the wrapper entirely — the section component specs assume their entrance is handled externally.

## Out of scope

- The animation values themselves — owned by [motion.md](../foundation/motion.md).
- Per-section content — owned by each section component's spec.
- Whether Nav animates — Nav is sticky and intentionally not wrapped; if a Nav fade-in is later wanted, it's a separate change to [Nav.md](Nav.md).
