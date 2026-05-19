# Logo

The Contextive wordmark + icon, used in the Nav (top-left) and Footer.

## File(s)

- [src/components/Logo.tsx](../../src/components/Logo.tsx)

## Purpose

A small composite logo: two short horizontal bars on the left (resembling the "≡" of headlines or signal indicators), followed by the wordmark "Contextive" in Space Grotesk Bold uppercase tight-tracked.

## Props

| Prop | Type | Default | Effect |
|---|---|---|---|
| `className` | `string` | `''` | Applied to the outer wrapper. Use for **color** (e.g. `text-paper dark:text-ink`) or spacing. |
| `size` | `'sm' \| 'lg'` | `'sm'` | Visual scale. `'lg'` is responsive: smaller on mobile, larger on `sm:`+. |

## Visual contract

### `size='sm'` (default)

| Part | Class |
|---|---|
| Outer | `flex items-center gap-2` |
| Icon block | `w-4 h-4 flex flex-col justify-center gap-[3px]` |
| Top bar | `h-[1.8px] w-full bg-current` |
| Bottom bar | `h-[1.8px] w-2/3 bg-current` |
| Wordmark | `text-sm font-bold tracking-tight uppercase font-display` |

Used in: **Footer**.

### `size='lg'`

Responsive: smaller on phones, full impact on `sm:`+ (640px and up).

| Part | Mobile | sm: + |
|---|---|---|
| Outer gap | `gap-2` | `sm:gap-2.5` |
| Icon block | `w-5 h-5` | `sm:w-6 sm:h-6` |
| Icon gap | `gap-[3px]` | `sm:gap-1` |
| Bar height | `h-[2px]` | `sm:h-[2.5px]` |
| Wordmark | `text-xl` | `sm:text-2xl` |

Used in: **Nav** top-left.

## Colors

Both bars use `bg-current` and the wordmark inherits text color. The Logo has **no intrinsic color** — it adopts whatever `color` (text color) the wrapper passes in. In Nav, the parent anchor sets `text-ink hover:opacity-70` so the Logo is black in light and off-white in dark. In Footer, the wrapper passes `text-paper dark:text-ink` because the Footer is an inverted block.

## Responsive behavior

Only the `lg` variant is responsive. The `sm` variant has a fixed size at every breakpoint.

## Dependencies

- **Imports**: none. Pure JSX.
- **Imported by**: [Nav.tsx](../../src/components/Nav.tsx) (lg), [Footer.tsx](../../src/components/Footer.tsx) (sm).
- **Foundation specs**: [typography.md](../foundation/typography.md) (Space Grotesk).

## Boundary

You may change in this spec:
- Bar thickness, gap, or icon dimensions in either size variant.
- The wordmark font-size at each breakpoint.

You must update *other specs* before changing:
- Replacing the wordmark with an SVG mark (touches Nav and Footer specs, and the typography spec is no longer the source for the wordmark).
- Adding a third size variant (declare it here and at consuming sites).

## Out of scope

- The color the Logo renders in — that's the parent's responsibility via `text-*` on the wrapper.
- The `<a>` element wrapping the Logo in Nav and Footer (owned by those components).
