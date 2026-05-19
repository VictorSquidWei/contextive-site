# Design Tokens

The site uses **6 semantic color tokens**. Every color in the codebase resolves through one of them. Literal hex values are forbidden outside this spec and the CSS variable declarations.

## File(s)

- [src/index.css](../../src/index.css) — `:root` and `.dark` blocks (lines 6–22)
- [tailwind.config.js](../../tailwind.config.js) — `theme.extend.colors` (lines 7–14)

## Tokens

| Token | Tailwind alias | Light (RGB triplet) | Dark (RGB triplet) | Role |
|---|---|---|---|---|
| `--color-ink` | `ink` | `0 0 0` | `245 245 243` | Primary text + strong borders |
| `--color-paper` | `paper` | `245 245 243` | `10 10 10` | Page background |
| `--color-canvas` | `canvas` | `255 255 255` | `20 20 19` | Card / elevated surface background |
| `--color-rule` | `rule` | `229 229 225` | `42 42 40` | Subtle dividers + input borders |
| `--color-muted` | `muted` | `85 85 85` | `160 160 155` | Secondary text |
| `--color-whisper` | `whisper` | `154 154 149` | `107 107 102` | Tertiary text + placeholders |

There is also a literal `'rule-strong': '#1F1F1D'` defined in `tailwind.config.js`. It does **not** theme. It is currently **unused** in the codebase but kept for back-compat. Do not introduce new usages; if a stronger rule is needed, add a new themed token.

## How tokens flow

1. CSS variables in [src/index.css](../../src/index.css) hold space-separated RGB triplets (e.g. `--color-ink: 0 0 0`).
2. Tailwind config wraps each as `rgb(var(--color-X) / <alpha-value>)` so opacity modifiers (e.g. `text-ink/40`) work.
3. The `.dark` class on `<html>` flips every variable simultaneously.
4. Every utility (`bg-paper`, `text-ink`, `border-rule`, etc.) re-resolves on theme toggle without per-component edits.

## Opacity policy

Use Tailwind's `/N` modifier (e.g. `text-ink/60`, `border-paper/30`). It compiles to a stable `rgb(var(...) / 0.60)` form. **Do not use arbitrary alpha values** (`text-[#000000aa]`) — they break theming.

## Inverted blocks

Three sections use `bg-ink text-paper` to deliberately invert from the page in **light** mode (Manifesto, Footer, Ticker). In **dark** mode, these blocks switch to `dark:bg-canvas dark:text-ink` so they remain a *tonal* distinct block (a hair lighter than the page) rather than inverting twice. **Every inner element** inside an inverted block that uses `text-paper`, `border-paper`, or `bg-paper` must have a `dark:text-ink` / `dark:border-ink` / `dark:bg-ink` companion. See [theming.md](theming.md).

## ::selection

`::selection` uses `rgb(var(--color-ink))` background and `rgb(var(--color-paper))` text. Inverts cleanly with theme.

## Light-mode parity guarantee

The RGB triplets in `:root` are exact decimal equivalents of the original literal hex values that existed before dark mode was added. Light-mode rendering is byte-identical to the pre-theming baseline. Any change to `:root` values is a visible regression and must be approved explicitly.

## Boundary

You may change in this spec:
- Dark-mode triplet values (visual tuning of the dark theme).

You must update *other specs* before changing:
- Light-mode triplet values (touches every component — requires global review).
- Adding / removing a token (also requires `tailwind.config.js`, plus a sweep of every component spec to declare which token it now uses).
- Renaming a token (every component spec lists the tokens it uses by name).

## Out of scope

- Per-component color choices — those live in each component spec.
- Inverted-block override rules — those live in [theming.md](theming.md).
