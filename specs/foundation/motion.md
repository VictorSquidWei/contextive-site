# Motion

All animations, transitions, and motion utilities used on the site. If you want to add motion anywhere, it goes through this spec first.

## File(s)

- [src/index.css](../../src/index.css) — `@keyframes` blocks + animation classes (lines 76–116)
- Inline `transition-*` classes throughout components
- Inline `style` props for the Hero card stack (3D transforms)

## Keyframe animations

### `marquee`

```css
@keyframes marquee {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}
.marquee-track { animation: marquee 60s linear infinite; }
.marquee-track:hover { animation-play-state: paused; }
```

**Used by:** Ticker only. The translation is `-50%` because the ticker content is duplicated (the two halves loop seamlessly). Duration `60s` linear. Pauses on hover.

### `pulse-velocity`

```css
@keyframes pulse-velocity {
  0%, 100% { opacity: 0.4; }
  50%      { opacity: 1; }
}
.velocity-pulse { animation: pulse-velocity 2s ease-in-out infinite; }
```

**Used by:** Ticker pulse dot. The "live signal" indicator.

### `campaign-slide-in-right` / `campaign-slide-in-left`

```css
@keyframes campaign-slide-in-right {
  from { opacity: 0; transform: translateX(32px); }
  to   { opacity: 1; transform: translateX(0); }
}
@keyframes campaign-slide-in-left {
  from { opacity: 0; transform: translateX(-32px); }
  to   { opacity: 1; transform: translateX(0); }
}
.campaign-slide-in-right { animation: campaign-slide-in-right 450ms cubic-bezier(0.2, 0, 0.2, 1) both; }
.campaign-slide-in-left  { animation: campaign-slide-in-left  450ms cubic-bezier(0.2, 0, 0.2, 1) both; }
```

**Used by:** Campaigns component only. Applied to the active campaign `<article>` via a class swap on chip selection. Direction is `right` when advancing the active index, `left` when going backward. The animation fires on every `key`-driven remount of the article block.

### `campaign-number-pop`

```css
@keyframes campaign-number-pop {
  0%   { opacity: 0; transform: scale(0.85); }
  100% { opacity: 1; transform: scale(1); }
}
.campaign-number-pop { animation: campaign-number-pop 600ms cubic-bezier(0.2, 0, 0.2, 1) 150ms both; }
```

**Used by:** Campaigns component only. Applied to the large `01` / `02` number on the active campaign. The 150ms delay lets the parent slide-in establish before the number resolves, giving a layered entrance.

### `section-reveal` / `section-reveal.in-view`

The per-section entrance animation. Each top-level section is wrapped in [`SectionReveal`](../components/SectionReveal.md), which:
1. Renders a `<div class="section-reveal">` around its children.
2. Uses `IntersectionObserver` (threshold 0.1, one-shot — disconnects after first intersection) to add the `in-view` class when the element enters the viewport.
3. Respects `prefers-reduced-motion` — if the user has reduced motion set, the JS short-circuits and `in-view` is added immediately, AND the CSS media query disables the transition entirely.

```css
.section-reveal {
  opacity: 0;
  transform: translateY(40px) scale(0.97);
  transition: opacity 800ms cubic-bezier(0.2, 0, 0.2, 1),
              transform 800ms cubic-bezier(0.2, 0, 0.2, 1);
  will-change: opacity, transform;
}

.section-reveal.in-view {
  opacity: 1;
  transform: translateY(0) scale(1);
}

@media (prefers-reduced-motion: reduce) {
  .section-reveal,
  .section-reveal.in-view {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
```

**Resting state:** invisible, lifted 40px below its final position, scaled to 97%.

**Final state:** fully visible, in position, full scale.

**Duration:** 800ms. **Easing:** the site-standard `cubic-bezier(0.2, 0, 0.2, 1)`.

**Used by:** Every section wrapped in `<SectionReveal>` in [App.tsx](../../src/App.tsx). On initial load, the Hero (above-the-fold) triggers immediately. Below-the-fold sections trigger as the user scrolls. Nav is **not** wrapped (it's sticky and always visible).

The `will-change` hint promotes the wrapper to its own compositor layer so the transition is GPU-accelerated. There is one such wrapper per section (9 total currently — Hero, Ticker, Thesis, Archive, Manifesto, Campaigns, System, FinalCTA, Footer); the layer cost is negligible.

## 3D perspective utility

```css
.card-stage { perspective: 1500px; }
```

**Used by:** Hero card stack container. Establishes 3D context for the rotating dossier cards.

## Tailwind transition utilities in use

| Class | Where | Notes |
|---|---|---|
| `transition-colors` | Almost every interactive element | Default 150ms; gives all color toggles (hover + theme switch) a smooth animation |
| `transition-opacity` | Logo anchor in Nav | Hover-fade |
| `transition-all` | Form submit buttons | Covers color + scale on `active:scale-[0.98]` |
| `transition-transform` | (not currently used) | — |

## Hero card stack motion

Defined inline in [src/components/Hero.tsx](../../src/components/Hero.tsx) — see [components/Hero.md](../components/Hero.md). Composite of:

- `transition-all duration-1000 ease-[cubic-bezier(0.2,0,0.2,1)]`
- `style={{ transform: 'translate3d(...) scale(...)', opacity: ..., filter: 'blur(...)' }}`
- `setInterval` rotates `index` state every **4500ms**.

## Scroll behavior

```css
html { scroll-behavior: smooth; }
```

All `href="#section"` anchor jumps animate. Nav links rely on this.

## Hover behaviors (color-only)

Color-on-hover transitions universally use `transition-colors`. No bespoke timing curves — the Tailwind default (150ms ease-out) is the standard.

## Reduced motion

**Not currently honored.** No `@media (prefers-reduced-motion: reduce)` rule exists. The marquee, pulse, and card-stack rotation all run regardless. This is a known gap; documented for future fix. If adding reduced-motion support, do it as a single dedicated spec/issue, not inline.

## Boundary

You may change in this spec:
- Tuning duration / easing of an existing keyframe.
- Adding a new keyframe animation class (also add it to the consuming component spec).

You must update *other specs* before changing:
- Removing `marquee` (breaks Ticker).
- Removing `velocity-pulse` (breaks Ticker pulse dot).
- Removing `card-stage` (breaks Hero card stack).
- The Hero card stack rotation interval (Hero spec owns the 4500ms).
- Removing `campaign-slide-in-right` / `-left` or `campaign-number-pop` (breaks the Campaigns navigator transition).
- Removing `section-reveal` (breaks the per-section entrance — touches [SectionReveal.md](../components/SectionReveal.md) and [document.md](../infrastructure/document.md)).

## Out of scope

- Per-component animation choices (each component spec describes its own motion).
- Scroll-reveal observer (not implemented yet).
