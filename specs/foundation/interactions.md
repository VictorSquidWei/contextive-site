# Interactions

Shared interaction patterns — hover treatments, focus rings, group hovers, button styles. If two components feel "the same" on hover, they should both come through this spec.

## File(s)

- No central interaction file. Patterns are repeated inline. This spec is the source of truth for *which* pattern applies *where*.

## Pattern: outline-to-solid button

The canonical CTA / nav button. Black outline in light, white outline in dark. Inverts to solid on hover.

```html
class="small-caps text-ink border border-ink {px-4 py-2 | px-3 py-2 | p-2}
       hover:bg-ink hover:text-paper transition-colors"
```

**Used by:**
- Nav Subscribe button (`px-4 py-2`)
- Nav Access button (mobile, `px-3 py-2`)
- ThemeToggle (`p-2`)
- Campaigns term chips (`px-3 py-1.5 cursor-default` — non-clickable styling)
- Archive tabs use a variant: `border border-ink` group with internal divider, active = `bg-ink text-paper`, inactive = `bg-paper text-ink hover:bg-ink/5`.

**Why this works in dark mode:** every utility is token-based. `text-ink`, `border-ink`, `bg-ink`, and `text-paper` all flip with the theme. No `dark:` override needed.

## Pattern: solid primary button

Filled, used for primary form submits.

```html
class="bg-ink text-paper {px-6 py-4 | w-full py-4}
       small-caps hover:bg-ink/85 active:scale-[0.98] transition-all
       disabled:opacity-60"
```

**Used by:**
- Hero waitlist submit (`px-6 py-4`)
- FinalCTA submit (`w-full py-4`, `active:scale-[0.99]`)

`bg-ink/85` on hover gives a subtle dim. `active:scale-[0.98]` (or `0.99` in FinalCTA) presses the button slightly on click.

## Pattern: text-only link

Used in the Footer bottom strip and inside paragraphs.

```html
class="hover:text-paper dark:hover:text-ink transition-colors"
```

Footer-only because the surrounding text is `text-paper/40` (or `dark:text-ink/40`), and hover brings it to full strength.

## Pattern: input field

```html
class="bg-canvas border border-rule px-4 py-4 text-sm
       focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink
       placeholder:text-whisper transition-colors"
```

**Used by:** Hero email input, FinalCTA email input. Identical styling.

- No default outline (`focus:outline-none`).
- Border darkens to ink on focus + 1px ring in ink color.
- Placeholder uses `whisper` token (auto-flips in dark mode).

## Pattern: group hover

Used on the Footer SocialRow links.

```html
<a class="group hover:bg-paper/5 dark:hover:bg-ink/5 …">
  <div class="… group-hover:border-paper dark:group-hover:border-ink …">…</div>
  <span class="text-paper/40 group-hover:text-paper dark:group-hover:text-ink …">→</span>
</a>
```

Hovering the row brightens the icon-square border and the trailing arrow simultaneously. Both `group-hover:` and `dark:group-hover:` are emitted.

## Pattern: card hover bg shift

System steps grid:

```html
<div class="bg-paper p-7 lg:p-9 group hover:bg-canvas transition-colors">
```

Each step cell shifts from page-bg to canvas-bg on hover. Plus an inner label fades in via `group-hover:opacity-100`.

## Pattern: pagination dot

Hero card-stack dots:

```html
class="h-[2px] transition-all w-{4|8} {bg-ink | bg-rule hover:bg-muted}"
```

Active dot: `w-8 bg-ink` (longer + full ink). Inactive: `w-4 bg-rule hover:bg-muted`.

## Cursor

- `cursor-default` on Campaigns term chips (visually a button, semantically not clickable).
- Default cursor everywhere else.

## Focus management

- All form inputs use `focus:ring-1 focus:ring-ink`.
- Buttons rely on browser default focus indication.
- No `:focus-visible` polyfill. No skip-link.

## Boundary

You may change in this spec:
- Adding a new shared interaction pattern (declare it here, then apply in components).

You must update *other specs* before changing:
- Modifying the outline-to-solid button hover behavior (affects Nav, ThemeToggle, Campaigns chips).
- Modifying the primary button (affects Hero, FinalCTA).
- Modifying the input pattern (affects Hero, FinalCTA).

## Out of scope

- Animation timing curves — those live in [motion.md](motion.md).
- Specific button copy or icons — those live in component specs.
