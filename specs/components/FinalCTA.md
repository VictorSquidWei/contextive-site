# FinalCTA

Section 05 — the closing subscribe block. Sized to fit alongside the Footer in a single standard viewport.

## File(s)

- [src/components/FinalCTA.tsx](../../src/components/FinalCTA.tsx)

## Purpose

A second waitlist capture point at the bottom of the page, before the Footer. Same submission flow as the Hero waitlist (POST `/api/subscribe`, Substack fallback). Compacted so that FinalCTA + Footer combined fit on a standard ~900px-tall desktop viewport without scrolling.

## State

Identical to Hero waitlist:

| State | Type | Initial |
|---|---|---|
| `email` | `string` | `''` |
| `submitting` | `boolean` | `false` |
| `submitted` | `boolean` | `false` |

Submission flow:

1. POST `{ email }` JSON to `/api/subscribe`.
2. If not ok → open Substack subscribe URL with `?email=` in a new tab.
3. Either way → `setSubmitted(true)`, clear email.
4. On fetch throw → same Substack fallback.

## Visual contract

### Section

`<section class="bg-paper border-y border-rule px-6 lg:px-12 py-12 lg:py-16">`

**Compact vertical padding** — `py-12 lg:py-16` (48px / 64px) instead of the previous `py-24 lg:py-32`. Top + bottom rules unchanged.

No `id` (not a nav target). Sits between System above and Footer below.

### Inner grid

`max-w-screen-xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-12 items-center`

Gap tightened from `gap-12` → `gap-8 lg:gap-12` so mobile is tighter while desktop keeps generous separation.

#### Left (`lg:col-span-7`)

`space-y-4` (was `space-y-6`).

- `<span class="small-caps text-muted">// 05 — Subscribe</span>`
- `<h2 class="font-display font-bold tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-[0.95] text-balance">See the words that decide the story.</h2>`
- `<p class="text-muted text-base leading-relaxed max-w-xl">…</p>`

Headline scale reduced one step at every breakpoint: `text-4xl sm:text-5xl lg:text-6xl` → `text-3xl sm:text-4xl lg:text-5xl`. Still the largest section headline on the page in absolute terms across all breakpoints? **No** — the Hero headline now exceeds it. That's intentional; FinalCTA defers visual weight to the brand-moment Hero headline.

Paragraph downsized from `text-lg` to `text-base`.

#### Right (`lg:col-span-5`)

The form, or the confirmation card if `submitted`.

##### Form

`<form class="space-y-3">` (was `space-y-4`).

1. `<label class="small-caps text-muted block">Archive Access ID</label>`
2. Input — `w-full bg-canvas border border-rule px-4 py-3 text-sm focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink placeholder:text-whisper transition-colors`. Vertical padding tightened `py-4 → py-3`.
3. Submit button — `w-full bg-ink text-paper py-3 small-caps hover:bg-ink/85 active:scale-[0.99] transition-all disabled:opacity-60`. Vertical padding tightened `py-4 → py-3`. Text: `Submitting...` / `Subscribe to the dispatch`.
4. Disclaimer: `<p class="small-caps text-whisper text-[10px]">Free. Weekly. Unsubscribe anytime.</p>`

##### Confirmation card

```html
<div class="border border-ink p-4 bg-canvas space-y-2">
  <div class="small-caps text-ink">Subscription Confirmed</div>
  <p class="text-sm text-muted leading-relaxed">Welcome to the archive. Check your inbox.</p>
</div>
```

Padding `p-6 → p-4`, internal rhythm `space-y-3 → space-y-2`.

## Light / dark mode

All utilities token-based. No `dark:` overrides on FinalCTA internals. The solid primary button inverts intentionally in dark mode — see [interactions.md](../foundation/interactions.md).

## Responsive behavior

- `< lg`: grid collapses to single column. Form appears below the headline.
- Headline scale: `text-3xl sm:text-4xl lg:text-5xl` (3 breakpoint steps).
- Vertical padding: `py-12` (mobile) → `lg:py-16` (desktop).

## Height budget

Targeted total section height on a 1280px-wide desktop, light or dark:
- Padding top/bottom: 128px
- Eyebrow + headline + paragraph: ~150–170px
- (Form is in the right column, height-matched to the left side via `items-center`)
- **Total ≈ 280–300px.**

## Dependencies

- **Imports**: `useState`, `SUBSTACK_SUBSCRIBE` from `../data/terms`.
- **Imported by**: [App.tsx](../../src/App.tsx).
- **Foundation specs**: [interactions.md](../foundation/interactions.md), [layout.md](../foundation/layout.md).

## Boundary

You may change in this spec:
- The headline and intro paragraph copy.
- Button label text and disclaimer.
- The confirmation card copy.
- The `active:scale-[0.99]` value.
- Vertical padding within the documented range (must keep combined height with Footer ≤ ~700px to honor the single-screen guarantee).

You must update *other specs* before changing:
- The `/api/subscribe` request shape — see [infrastructure/api.md](../infrastructure/api.md).
- The headline reaching `text-5xl` as the desktop top end — increasing this risks breaking the single-screen guarantee.

## Out of scope

- The Hero waitlist (separate component despite similar shape — [Hero.md](Hero.md)).
- The serverless function — [infrastructure/api.md](../infrastructure/api.md).
- The Footer composition that shares the viewport — [Footer.md](Footer.md).
