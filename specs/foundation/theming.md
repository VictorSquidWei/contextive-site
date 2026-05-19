# Theming (Light / Dark Mode)

The dark-mode mechanism, the rules for adding new dark variants, and the override rules for inverted blocks.

## File(s)

- [tailwind.config.js](../../tailwind.config.js) line 3 — `darkMode: 'class'`
- [src/components/ThemeToggle.tsx](../../src/components/ThemeToggle.tsx) — toggle button + persistence
- [src/index.css](../../src/index.css) — `:root` and `.dark` variable blocks
- [src/components/Manifesto.tsx](../../src/components/Manifesto.tsx), [Footer.tsx](../../src/components/Footer.tsx), [Ticker.tsx](../../src/components/Ticker.tsx) — explicit `dark:` override sites

## Mechanism

1. `<html>` carries the `dark` class when dark mode is active.
2. ThemeToggle reads from `localStorage['contextive-theme']`, falling back to `prefers-color-scheme`.
3. When active, the `.dark` selector in CSS overrides the `:root` CSS variables for all 6 color tokens.
4. Every Tailwind utility (`bg-paper`, `text-ink`, etc.) resolves through those variables, so every token-using element re-themes automatically.
5. The `dark:`-prefixed variant in Tailwind (e.g. `dark:bg-canvas`) compiles to `.dark\:bg-canvas:is(.dark *) { … }` — it matches descendants of any element with class `dark`, which includes everything under `<html.dark>`.

## When do you need a `dark:` override?

You need a `dark:` override when:

1. The element uses **`bg-ink` or `text-paper` as background or foreground deliberately**, to invert from the surrounding page. (Inverted block bodies.) Without an override, in dark mode these would invert *again* — `bg-ink` becomes white, `text-paper` becomes dark — making the block look like a glaring white slab.
2. The element lives **inside an inverted block** and uses `text-paper`, `border-paper`, or `bg-paper` for inner detail. In dark mode, the surrounding block is `dark:bg-canvas` (slightly lighter dark), but `text-paper` resolves to *near-black* — invisible. Must be paired with `dark:text-ink` (off-white).

You do **not** need a `dark:` override when:

- The element uses a token in its intuitive role (`text-ink` for primary text on `bg-paper`, etc.). Both tokens flip in sync; contrast is preserved.
- The element uses `text-muted`, `text-whisper`, `border-rule`, `bg-canvas`. All adapt automatically.

## Inverted block rule

The three inverted-block components are **Manifesto**, **Footer**, **Ticker**.

Each has a top-level wrapper with the pattern:

```html
class="bg-ink text-paper dark:bg-canvas dark:text-ink …"
```

| Mode | Page bg | Block bg | Block text |
|---|---|---|---|
| Light | `paper` (off-white) | `ink` (black) — inverted | `paper` (off-white) |
| Dark | `paper` (near-black) | `canvas` (slightly-lighter dark) — distinct tonal block | `ink` (off-white) |

The intent is the **same**: a visually distinct block from the surrounding page. The mechanism differs because in dark mode the page is already dark and a second inversion would look wrong.

**Every inner element** inside one of these blocks that uses a paper-flavored utility must add the ink companion:

| Light utility | Dark companion |
|---|---|
| `text-paper` | `dark:text-ink` |
| `text-paper/N` | `dark:text-ink/N` |
| `border-paper` | `dark:border-ink` |
| `border-paper/N` | `dark:border-ink/N` |
| `bg-paper` | `dark:bg-ink` |
| `bg-paper/N` | `dark:bg-ink/N` |
| `hover:text-paper` | `dark:hover:text-ink` |
| `group-hover:border-paper` | `dark:group-hover:border-ink` |

This rule is **mechanical**. When adding a new line inside Manifesto, Footer, or Ticker, every paper-token utility automatically gets its dark companion. No exceptions.

## ThemeToggle behavior

- Initial state: read `localStorage['contextive-theme']`. If `'light'` or `'dark'`, use it. Otherwise consult `prefers-color-scheme`.
- Click: flips state, persists to localStorage, adds/removes `.dark` on `document.documentElement`.
- Renders a sun icon in dark mode (click to go light) or moon icon in light mode (click to go dark).
- See [components/ThemeToggle.md](../components/ThemeToggle.md) for full visual contract.

## What's special-cased in CSS (not Tailwind)

- `.paper-grain` background-color uses `rgb(var(--color-canvas))` so the DossierCard surface themes. The dot texture is overridden in `.dark .paper-grain` to use white dots at low opacity (the light-mode black dots vanish on dark canvas).
- `.institution-rule` uses `currentColor` instead of literal black so it inherits whatever surrounding text color is set.
- `::selection` uses `rgb(var(--color-ink))` / `rgb(var(--color-paper))` for theme-aware highlight.

## Light-mode parity guarantee

When light mode is active, every CSS variable resolves to its original literal hex value (exact decimal RGB equivalent). Light mode is byte-identical to the pre-theming baseline.

## Known unthemed bits (intentional)

- `dossier-shadow` and `dossier-shadow-deep` use black rgba shadows. In dark mode these are invisible against the dark page. The card's `border-ink/10` provides edge definition in dark; the shadow has no visual effect. Acceptable.
- Manifesto background pattern uses literal `#fff` lines at 4% opacity. Visible in both modes (subtler in dark on canvas). Acceptable.

## Boundary

You may change in this spec:
- Dark-mode override rules above (this is the source of truth — keep aligned with actual code).

You must update *other specs* before changing:
- Adding a fourth inverted block (requires updating the Inverted Block Rule and the new component's spec).
- Dropping `darkMode: 'class'` (every `dark:` utility breaks).
- Switching from class-based to media-query dark mode (changes the entire mechanism — touches ThemeToggle, every `dark:` consumer).

## Out of scope

- Color values — those live in [design-tokens.md](design-tokens.md).
- Per-component `dark:` listings — those live in each component's spec.
