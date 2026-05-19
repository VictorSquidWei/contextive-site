# Nav

The sticky top navigation bar.

## File(s)

- [src/components/Nav.tsx](../../src/components/Nav.tsx)

## Purpose

A persistent header with the Logo on the left, primary in-page anchors in the middle (desktop only), and a right-side cluster containing the theme toggle plus the primary CTA (Subscribe on desktop, Access on mobile).

## State

- `scrolled: boolean` — true once the user scrolls past 8px. Toggled via a passive `scroll` listener on window.

## Visual contract

### Outer `<nav>`

`sticky top-0 z-50 transition-colors duration-300`. Background depends on `scrolled`:
- `scrolled === false`: `bg-paper border-b border-transparent`
- `scrolled === true`: `bg-paper/85 backdrop-blur-md border-b border-rule`

The 300ms color transition smooths the entry of the backdrop blur.

### Inner row

`max-w-screen-xl mx-auto flex items-center justify-between px-6 lg:px-12 py-5`

Three children, distributed by `justify-between`:

1. **Logo anchor** — `<a href="#top">` with `text-ink hover:opacity-70 transition-opacity`. Renders `<Logo size="lg" />`.
2. **Desktop nav cluster** — `hidden md:flex items-center gap-10`. Four anchors: Thesis, Archive, Campaigns, System. Each is `small-caps text-muted hover:text-ink transition-colors`.
3. **Right cluster** — `flex items-center gap-3`. Contains:
   - **ThemeToggle** (always visible)
   - **Subscribe anchor** — `hidden md:inline-flex …`, opens [SOCIAL_LINKS.substack](../data/terms.md) in a new tab. Outline-to-solid styling, `px-4 py-2`.
   - **Access anchor** — `md:hidden …`, links to `#waitlist`. Outline-to-solid styling, `px-3 py-2`.

The right cluster is wrapped in its own flex container so the toggle visually sits next to the CTA rather than scattering across the row.

## Responsive behavior

| Viewport | Desktop nav links | CTA shown | Total row content |
|---|---|---|---|
| < 768px | hidden | Access | Logo + ThemeToggle + Access |
| ≥ 768px | visible (gap-10) | Subscribe | Logo + 4 anchors + ThemeToggle + Subscribe |

Logo scales responsively inside its own component — see [Logo.md](Logo.md).

## Light / dark mode

All utilities are token-based (`text-ink`, `bg-paper`, `border-rule`, `text-muted`). No `dark:` overrides needed — everything flips through the variables. The 85%-opacity scrolled background `bg-paper/85` compiles through `rgb(var(--color-paper) / 0.85)` and themes correctly.

## Anchor targets

| Link | Target |
|---|---|
| Logo | `#top` (Hero section id) |
| Thesis | `#thesis` |
| Archive | `#archive` |
| Campaigns | `#campaigns` |
| System | `#system` |
| Access (mobile) | `#waitlist` (Hero form id) |
| Subscribe | `SOCIAL_LINKS.substack` (external, new tab) |

All in-page anchors use the global `html { scroll-behavior: smooth }` rule — see [motion.md](../foundation/motion.md).

## Dependencies

- **Imports**: `useEffect`, `useState`, `Logo`, `ThemeToggle`, `SOCIAL_LINKS` from `../data/terms`.
- **Imported by**: [App.tsx](../../src/App.tsx).
- **Foundation specs**: [layout.md](../foundation/layout.md), [interactions.md](../foundation/interactions.md), [theming.md](../foundation/theming.md).

## Boundary

You may change in this spec:
- The 8px scroll threshold (`scrolled = window.scrollY > 8`).
- The 300ms transition duration.
- The order of links in the desktop cluster (but keep all 4 anchors — they map to the page's 4 main sections).
- The right-cluster gap (`gap-3`).

You must update *other specs* before changing:
- Adding a fifth nav link (would require adding a new section to the page).
- Replacing the Logo size variant `lg` (touches Logo spec).
- Moving the ThemeToggle out of the Nav (touches ThemeToggle spec).
- Changing `sticky` to `fixed` (would require body padding compensation site-wide).

## Out of scope

- Logo internals — [Logo.md](Logo.md).
- ThemeToggle internals — [ThemeToggle.md](ThemeToggle.md).
- The Hero waitlist form that the mobile Access button links to — [Hero.md](Hero.md).
