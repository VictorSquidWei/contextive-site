# Footer

The page-closing inverted block. Brand reintroduction on the left, a compact channels grid on the right, bottom strip below. Sized so that FinalCTA + Footer fit together on a standard desktop viewport.

## File(s)

- [src/components/Footer.tsx](../../src/components/Footer.tsx)

## Purpose

Site-wide footer. Reinforces the brand pitch, surfaces the four external channels (web, Substack, X, Instagram) in a tight grid, and provides quick anchors back to the page's main sections.

## Composition

The file declares:

- `SocialIcon` — a switch on `kind: 'substack' | 'twitter' | 'instagram' | 'web'` returning an inline SVG (`w-5 h-5`). **Unchanged.**
- `ChannelTile` — a single compact tile: outlined icon-square + label + truncated URL. Replaces the previous full-width `SocialRow`.
- `CHANNELS` — a local const array of the four channel entries (label, value, optional href, kind), iterated by `ChannelTile`.

## Visual contract

### Outer `<footer>`

```html
<footer class="bg-ink text-paper dark:bg-canvas dark:text-ink px-6 lg:px-12 py-12 lg:py-16">
```

**Inverted block** (unchanged classification). Vertical padding tightened from `py-20 lg:py-28` to `py-12 lg:py-16` (48px / 64px). Other padding unchanged.

### Top grid

`max-w-screen-xl mx-auto` → `grid lg:grid-cols-12 gap-8 lg:gap-12 mb-10`

Gap tightened from `gap-12` → `gap-8 lg:gap-12`. Bottom margin `mb-12 → mb-10`.

#### Left brand column (`lg:col-span-5`)

`space-y-4` (was no rhythm declared; previous spacing was via Logo's `mb-6`).

- `<Logo className="text-paper dark:text-ink" />` — default `'sm'` size variant. Note: the previous `mb-6` is removed (rhythm now lives on the column wrapper).
- `<p class="text-paper/60 dark:text-ink/60 text-sm leading-relaxed max-w-md">` — short re-pitch paragraph. Unchanged copy.

#### Right channels column (`lg:col-span-7`)

```html
<div class="small-caps text-paper/40 dark:text-ink/40 mb-3">// CHANNELS</div>
<div class="grid grid-cols-2 md:grid-cols-4 gap-3">
  {CHANNELS.map(c => <ChannelTile {...c} key={c.label} />)}
</div>
```

`mb-2 → mb-3`. The vertical SocialRow stack is replaced with a **2-column-on-mobile / 4-column-on-desktop grid** of `ChannelTile`s.

### `ChannelTile`

```html
<a class="flex items-center gap-3 p-3 border border-paper/15 dark:border-ink/15
          hover:border-paper/40 dark:hover:border-ink/40 transition-colors group">
  <div class="w-10 h-10 border border-paper/30 dark:border-ink/30 flex items-center justify-center
              text-paper dark:text-ink shrink-0
              group-hover:border-paper dark:group-hover:border-ink transition-colors">
    <SocialIcon kind={kind} />  <!-- w-5 h-5 -->
  </div>
  <div class="flex-1 min-w-0">
    <div class="small-caps text-paper/40 dark:text-ink/40 leading-none">{label}</div>
    <div class="font-display font-bold text-xs text-paper dark:text-ink truncate mt-1">{value}</div>
  </div>
</a>
```

When `href` is absent (the WEB row), the wrapper renders as a `<div>` instead of `<a>`, the group-hover behavior still applies but the URL isn't clickable.

**Dimensions:**
- Tile padding: `p-3` (12px).
- Icon square: `w-10 h-10` (was `w-12 h-12`).
- Inner SocialIcon SVG: `w-5 h-5` (unchanged).
- Value text: `text-xs` (was `text-base sm:text-lg`).
- `truncate` on the value so long URLs (`open.substack.com/pub/contextive`, etc.) clip with ellipsis. Full URLs remain in the `href`.

**Hover behavior:** the outer border deepens from `paper/15 → paper/40`, and the icon-square border deepens from `paper/30 → paper`. Same dark companions. The trailing `→` from the previous design is removed for compactness.

### `CHANNELS` data

Declared inline in the Footer file:

```ts
const CHANNELS = [
  { label: 'WEB',         value: 'contextive.ai',                       kind: 'web' },
  { label: 'SUBSTACK',    value: 'open.substack.com/pub/contextive',    href: SOCIAL_LINKS.substack,  kind: 'substack' },
  { label: 'X / TWITTER', value: 'x.com/contextive_ai',                 href: SOCIAL_LINKS.twitter,   kind: 'twitter' },
  { label: 'INSTAGRAM',   value: 'www.instagram.com/contextive.ai',     href: SOCIAL_LINKS.instagram, kind: 'instagram' },
];
```

The four URLs and labels are unchanged from the prior design; only the visual presentation has changed.

### Bottom strip

```html
<div class="pt-6 border-t border-paper/15 dark:border-ink/15
            flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4
            small-caps text-paper/40 dark:text-ink/40 text-[10px]">
  <div class="flex flex-wrap gap-x-6 gap-y-1">
    <span>© 2026 CONTEXTIVE INTELLIGENCE</span>
    <span>SIGNAL ARCHIVE // LONDON · SF</span>
  </div>
  <div class="flex gap-6">
    <a href="#thesis" class="hover:text-paper dark:hover:text-ink transition-colors">PROTOCOL</a>
    <a href="#archive" class="hover:text-paper dark:hover:text-ink transition-colors">ARCHIVE</a>
    <a href="#system" class="hover:text-paper dark:hover:text-ink transition-colors">STATUS</a>
  </div>
</div>
```

Changes from previous:
- `pt-10 → pt-6`.
- Copyright + location were stacked vertically (`flex flex-col gap-1`); now **horizontal on a single row with wrap fallback** (`flex flex-wrap gap-x-6 gap-y-1`).
- Strip is forced to `text-[10px]` to match the small-caps style without over-emphasizing.
- Anchor gap `gap-8 → gap-6`.

## Light / dark mode

Inverted block. Every paper-token utility carries its ink companion:

| Utility | Light | Dark |
|---|---|---|
| Footer bg | `bg-ink` | `dark:bg-canvas` |
| Footer text | `text-paper` | `dark:text-ink` |
| Logo color | `text-paper` | `dark:text-ink` |
| Re-pitch paragraph | `text-paper/60` | `dark:text-ink/60` |
| Channels label | `text-paper/40` | `dark:text-ink/40` |
| Tile outer border | `border-paper/15` | `dark:border-ink/15` |
| Tile outer hover border | `hover:border-paper/40` | `dark:hover:border-ink/40` |
| Tile icon-square border | `border-paper/30` | `dark:border-ink/30` |
| Tile icon-square hover | `group-hover:border-paper` | `dark:group-hover:border-ink` |
| Tile label | `text-paper/40` | `dark:text-ink/40` |
| Tile value | `text-paper` | `dark:text-ink` |
| Tile icon color | `text-paper` | `dark:text-ink` |
| Bottom-strip border | `border-paper/15` | `dark:border-ink/15` |
| Bottom-strip text | `text-paper/40` | `dark:text-ink/40` |
| Bottom-strip link hover | `hover:text-paper` | `dark:hover:text-ink` |

This list is the canonical reference for the inverted-block override pattern as applied here.

## Responsive behavior

- `< lg`: top grid collapses to single column.
- `< md`: channels grid drops from 4-up to 2-up.
- `< sm`: bottom strip stacks vertically.
- Tile icon-square stays `w-10 h-10` at every viewport.
- Tile value text stays `text-xs` at every viewport (truncate handles overflow).

## Height budget

Targeted total Footer height on a 1280px-wide desktop:
- Padding top/bottom: 128px
- Logo + paragraph column: ~110px
- Channels label + 4-up grid: ~110px (single row of tiles ~64px tall + label + spacing)
- `mb-10` spacer + `pt-6` of bottom strip + content: ~70px
- **Total ≈ 290–320px.**

Combined with FinalCTA's ~280–300px, total bottom-of-page block is ~570–620px — fits the single-screen guarantee on any desktop ≥768px tall.

## Data source

`SOCIAL_LINKS` from [data/terms.md](../data/terms.md) — provides `substack`, `twitter`, `instagram` URLs. WEB uses literal `contextive.ai` (no `href`). **Unchanged.**

## Dependencies

- **Imports**: `Logo`, `SOCIAL_LINKS` from `../data/terms`.
- **Imported by**: [App.tsx](../../src/App.tsx).
- **Foundation specs**: [theming.md](../foundation/theming.md), [typography.md](../foundation/typography.md), [interactions.md](../foundation/interactions.md) (group-hover pattern, text-only link pattern).

## Boundary

You may change in this spec:
- ChannelTile inner dimensions (`w-10 h-10` icon square, `p-3` outer, `text-xs` value).
- Tile gap (`gap-3`).
- Channel grid breakpoints (`grid-cols-2 md:grid-cols-4`).
- Bottom-strip copy.
- Anchors in the bottom strip (must remain valid in-page anchors).
- Padding (`py-12 lg:py-16`) within the documented height budget.

You must update *other specs* before changing:
- Adding a fifth social channel — must add to `CHANNELS` and update [data/terms.md](../data/terms.md) `SOCIAL_LINKS` if needed.
- Changing `SOCIAL_LINKS` keys — touches [data/terms.md](../data/terms.md).
- Removing the inverted-block treatment (touches [theming.md](../foundation/theming.md)).
- Increasing padding beyond the height budget (risks breaking the single-screen guarantee — touches [FinalCTA.md](FinalCTA.md) which depends on this).

## Out of scope

- Logo internals — [Logo.md](Logo.md).
- URLs themselves — [data/terms.md](../data/terms.md).
- FinalCTA composition — [FinalCTA.md](FinalCTA.md).
