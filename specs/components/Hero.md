# Hero

The above-the-fold section: oversized headline, intro paragraph, waitlist form on the left; a rotating 3D card stack on the right.

## File(s)

- [src/components/Hero.tsx](../../src/components/Hero.tsx)

## Purpose

The page entry point. Pitches the thesis, captures email, and immediately demonstrates the product format via the rotating dossier-card preview.

## State

| State | Type | Initial | Purpose |
|---|---|---|---|
| `index` | `number` | `0` | Which card sits at the front of the stack |
| `email` | `string` | `''` | Waitlist input value |
| `submitting` | `boolean` | `false` | Disables submit during fetch |
| `submitted` | `boolean` | `false` | Switches to confirmation card |
| `error` | `string \| null` | `null` | Reserved (currently never displayed as red text exists but isn't set on the existing flow) |

## Card data

`HERO_CARDS` is a fixed array of 5 `TermFile` entries pulled from [terms.ts](../data/terms.md), in this order:
1. `AGENTIC`
2. `PROMPTWASHING`
3. `RECIPROCAL`
4. `AI SLOP`
5. `CEASEFIRE`

These are chosen for variety across both campaigns and across velocity types.

## Behavior contract

### Card rotation

A `setInterval` of **4500ms** advances `index` by 1 (mod 5). Cleared on unmount.

For each card, `offset = (i - index + length) % length`. The frontmost card has `offset === 0`. The transform applied:

```js
transform: `translate3d(${offset * 14}px, ${-offset * 18}px, ${-offset * 80}px) scale(${1 - offset * 0.04})`
opacity: offset > 3 ? 0 : 1 - offset * 0.18
zIndex: HERO_CARDS.length - offset
filter: offset === 0 ? 'blur(0)' : `blur(${offset * 0.6}px)`
```

Combined with `transition-all duration-1000 ease-[cubic-bezier(0.2,0,0.2,1)]`, this gives a smooth 1-second crossfade with depth-based blur.

The container is `card-stage` (see [motion.md](../foundation/motion.md)) — establishes `perspective: 1500px`.

### Pagination dots

Below the card stack, 5 buttons, each `h-[2px]`. Active = `w-8 bg-ink`. Inactive = `w-4 bg-rule hover:bg-muted`. Clicking jumps `index` to that position.

### Waitlist form (`#waitlist`)

`<form>` on submit:
1. `preventDefault()`. Bail if email empty or already submitting.
2. POST `{ email }` JSON to `/api/subscribe`.
3. If `res.ok` → set `submitted = true`, clear email.
4. If not ok → open `${SUBSTACK_SUBSCRIBE}?email=…` in a new tab, set `submitted = true`.
5. On fetch throw → same Substack fallback.
6. Always sets `submitting = false` in `finally`.

When `submitted === true`, the form is replaced by a confirmation card:

```html
<div class="border border-ink p-5 bg-canvas">
  <div class="small-caps text-ink mb-2">Subscription Confirmed</div>
  <p class="text-sm text-muted leading-relaxed">…</p>
</div>
```

## Visual contract

### Section

`<section id="top" class="relative pt-12 pb-24 lg:pt-20 lg:pb-32 px-6 lg:px-12">`

Asymmetric vertical padding — top is tighter for nav clearance. Wraps in `max-w-screen-xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20 items-start`.

### Left column (`lg:col-span-7`)

Vertical rhythm `space-y-10`. In order:

1. **Eyebrow row** — diamond glyph + small-caps label
   - `<span class="w-2 h-2 bg-ink rotate-45">` (decorative)
   - `<span class="small-caps text-muted">Intelligence Archive // Active Cycle 02</span>`

2. **Headline** — `<h1>` with `font-display font-bold leading-[0.95] tracking-tight text-balance`
   - Type scale: `text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] xl:text-[6.5rem]`
   - Two `<span class="block">` lines: "Language" and "is leverage."
   - "leverage" is wrapped in `<em class="italic font-extrabold not-italic"><span class="italic">leverage</span></em>` — the nested italic is intentional: the outer `em` is `not-italic font-extrabold`, the inner span flips italic back on, giving extrabold italic without browser default styling.

3. **Intro paragraph** — `text-base lg:text-lg text-muted max-w-[480px] leading-relaxed text-balance`.

4. **Waitlist form** at `id="waitlist"` — `<div class="max-w-md space-y-4">` containing the form (or confirmation card on submit).
   - Input: `flex-1 bg-canvas border-rule …` — see [interactions.md](../foundation/interactions.md) input pattern.
   - Submit button: `bg-ink text-paper px-6 py-4 small-caps hover:bg-ink/85 active:scale-[0.98] …` — see solid primary button pattern.
   - On `< sm:` the input + button stack vertically (`flex-col sm:flex-row`).

5. **Feature bullets** — three rows with `w-1.5 h-1.5 bg-ink rotate-45` diamonds + `text-[9px] small-caps text-muted` labels:
   - Cross-platform velocity tracking
   - Human-reviewed signal files
   - Weekly intelligence dispatch

### Right column (`lg:col-span-5`)

- **Card stage** — `relative h-[480px] lg:h-[560px] flex items-center justify-center card-stage`. Renders all 5 DossierCards positioned absolutely with the transforms above. Cards use `<DossierCard term={card} compact />`.
- **Pagination dots** — `flex justify-center gap-2 mt-6`, 5 buttons described above.

## Light / dark mode

All utilities are token-based. No `dark:` overrides on Hero internals.

- Headline `text-ink` flips to off-white in dark.
- Submit button `bg-ink text-paper` becomes white-with-dark-text in dark — an intentionally inverted CTA against the near-black page background.
- Input `bg-canvas` becomes the slightly-lighter dark surface; `border-rule` becomes a soft dark gray; `placeholder:text-whisper` flips automatically.
- Confirmation card `bg-canvas border-ink text-ink` reads correctly in both modes.

## Responsive behavior

- < `lg`: grid collapses to single column, card stack appears below the form.
- < `sm`: form input + button stack vertically.
- Card-stage height: `h-[480px]` → `lg:h-[560px]`.
- Headline scale steps through 4 breakpoints.

## Dependencies

- **Imports**: `useEffect`, `useState`, `TERM_FILES`, `SUBSTACK_SUBSCRIBE` from `../data/terms`, `DossierCard`.
- **Imported by**: [App.tsx](../../src/App.tsx).
- **Foundation specs**: [layout.md](../foundation/layout.md), [motion.md](../foundation/motion.md) (card-stage perspective), [interactions.md](../foundation/interactions.md) (input, primary button).

## Boundary

You may change in this spec:
- The card rotation interval (4500ms).
- The transform parameters (offset multipliers, scale factor, blur step).
- The `HERO_CARDS` selection.
- Pagination dot dimensions.
- Confirmation card copy.
- The 480/560px card-stage height.

You must update *other specs* before changing:
- Removing the `id="top"` (breaks Nav Logo anchor).
- Removing the `id="waitlist"` (breaks Nav mobile Access anchor).
- Changing the `/api/subscribe` POST contract — see [infrastructure/api.md](../infrastructure/api.md).
- The DossierCard `compact` prop — see [DossierCard.md](DossierCard.md).

## Out of scope

- The card rendering itself — [DossierCard.md](DossierCard.md).
- The Substack fallback URL — [data/terms.md](../data/terms.md).
- The serverless function implementation — [infrastructure/api.md](../infrastructure/api.md).
