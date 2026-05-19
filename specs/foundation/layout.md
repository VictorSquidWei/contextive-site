# Layout

Container widths, page padding, breakpoints — the rules that keep every section visually consistent.

## File(s)

- Inline in every section component (no shared layout wrapper).
- Tailwind defaults govern breakpoints.

## Container

Every section content area is wrapped in:

```html
<div class="max-w-screen-xl mx-auto">
  …
</div>
```

`max-w-screen-xl` resolves to **1280px**. This is the canonical content width. No component should set its own max-width on a top-level section without documenting it here.

## Section padding

Every section uses the pattern:

```html
<section class="px-6 lg:px-12 py-24 lg:py-32 …">
```

- **Horizontal:** `px-6` (24px) on mobile → `lg:px-12` (48px) from 1024px up.
- **Vertical:** `py-24` (96px) on mobile → `lg:py-32` (128px) from 1024px up.

Exceptions, documented:
- **Hero** uses `pt-12 pb-24 lg:pt-20 lg:pb-32` — asymmetric top padding for nav clearance.
- **Ticker** uses only `py-3` (12px) — it's a strap, not a section.
- **Nav** uses `py-5` (20px).
- **Manifesto** uses `py-24 lg:py-32` (matches the standard).
- **Footer** uses `py-20 lg:py-28` (slightly tighter than sections — intentional).

## Breakpoints

Tailwind defaults, in use:

| Token | Width | Used for |
|---|---|---|
| `sm:` | ≥ 640px | Form layout switches (column → row), Logo size step |
| `md:` | ≥ 768px | Nav links visible (`md:flex`), mobile-only Access button hides (`md:hidden`) |
| `lg:` | ≥ 1024px | Grid columns activate, padding bumps, type scale steps |
| `xl:` | ≥ 1280px | Headline final step, container reaches max-width |

Do not introduce custom breakpoints. If a one-off responsive change is needed, use arbitrary `min-[800px]:` syntax inline and note it in the consuming component spec.

## Grid patterns

### 12-column section grid

Used in: Hero, Manifesto, Footer (top half), Campaigns rows.

```html
<div class="grid lg:grid-cols-12 gap-12 lg:gap-20">
  <div class="lg:col-span-7">…</div>
  <div class="lg:col-span-5">…</div>
</div>
```

Column splits in use: **7/5**, **2/10**, **4/8**, **5/7**, **3/9**. Documented per component.

### 1px-line grid (gap technique)

Used in: System steps, Archive cards, Campaigns pillars.

```html
<div class="grid grid-cols-[…] gap-px bg-rule border border-rule">
  <div class="bg-paper p-7 …">…</div>
</div>
```

`gap-px` (1px) + `bg-rule` parent gives the illusion of hairline borders between cells. Cells override the parent bg with their own (`bg-paper` or `bg-canvas`).

### `bg-canvas` for elevated surfaces

Two sections use `bg-canvas` to elevate from the page (`bg-paper`):

- **Thesis** (`bg-canvas border-y border-rule`)
- **Campaigns** (`bg-canvas border-y border-rule`)

DossierCards inside Archive also use `bg-canvas` via the `.paper-grain` class.

## Sticky / fixed elements

- **Nav** is `sticky top-0 z-50`.
- The Thesis left column has `lg:sticky lg:top-32` for the sidebar headline.

No fixed-position elements. No drawer or modal overlays.

## Boundary

You may change in this spec:
- Adding a new section-padding exception (document it in the exceptions list above).

You must update *other specs* before changing:
- `max-w-screen-xl` value (every section).
- Default `px-6 lg:px-12` padding (every section).
- Tailwind breakpoints (every responsive class).
- Adding a new container size.

## Out of scope

- Per-component grid splits (each component spec lists its own column structure).
- Inner-card padding (owned by the card's component spec).
