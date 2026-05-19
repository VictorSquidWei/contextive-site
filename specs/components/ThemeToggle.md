# ThemeToggle

The icon button that flips light ↔ dark.

## File(s)

- [src/components/ThemeToggle.tsx](../../src/components/ThemeToggle.tsx)

## Purpose

A single small icon button that toggles the site theme, persists the choice, and respects the system preference on first load.

## State

- Local React state: `theme: 'light' | 'dark'`.
- Initialized from `getInitialTheme()`:
  1. Read `localStorage['contextive-theme']`. If `'light'` or `'dark'`, use it.
  2. Else read `window.matchMedia('(prefers-color-scheme: dark)').matches`.
  3. Default `'light'`.
- On every state change, a `useEffect` adds/removes `'dark'` on `document.documentElement` and writes the value back to localStorage.
- Click handler flips state.

## Visual contract

- Outer button uses the **outline-to-solid pattern** ([interactions.md](../foundation/interactions.md)):
  - `small-caps text-ink border border-ink p-2 hover:bg-ink hover:text-paper transition-colors`
- Icon is an inline SVG, `w-4 h-4`, `stroke="currentColor"`, `strokeWidth="1.75"`, rounded line caps/joins.
- Light mode → moon icon (signals "click to go dark").
- Dark mode → sun icon (signals "click to go light").
- `aria-label` updates with state: `"Switch to dark mode"` / `"Switch to light mode"`.
- Decorative SVG marked `aria-hidden="true"`.

## Storage key

`contextive-theme`. Values: `'light'` | `'dark'`. Anything else is ignored.

## Dependencies

- **Imports**: `useEffect`, `useState` from React.
- **Imported by**: [Nav.tsx](../../src/components/Nav.tsx).
- **Foundation specs**: [theming.md](../foundation/theming.md), [interactions.md](../foundation/interactions.md).

## Boundary

You may change in this spec:
- The icon SVG paths (must remain `currentColor`-stroked, `w-4 h-4`).
- The button padding (`p-2` is matched to the Subscribe button visual weight — see Nav spec before changing).
- The `aria-label` text.

You must update *other specs* before changing:
- The localStorage key name (would orphan returning visitors).
- The mechanism (class vs. media query) — see [theming.md](../foundation/theming.md).
- The "lives next to Subscribe in the Nav" placement (touches Nav spec).

## Out of scope

- The transition animation between light and dark — handled by `transition-colors` on every consuming element, not by the toggle itself.
- The actual color values — owned by [design-tokens.md](../foundation/design-tokens.md).
