# Contextive — Spec-Driven Development

Every component, animation, token, and behavior on this site has a spec in this folder. Specs are the **contract**: if you (or Claude Code) want to change something, you find its spec first, read the boundary, and only then touch the matching file.

The point: changes stay isolated. A tweak to Hero never accidentally re-themes the Ticker. A new dark-mode color never silently breaks the DossierCard texture.

## Folder layout

```
specs/
  README.md                  this file — index, conventions, workflow
  foundation/                cross-cutting design system (touch carefully)
    design-tokens.md         color tokens + CSS variables + light/dark values
    typography.md            fonts, weights, custom classes (.small-caps, .display)
    layout.md                container widths, page padding, breakpoints
    motion.md                animations (marquee, velocity-pulse, card-stage, reveal)
    interactions.md          hover/focus patterns shared across components
    theming.md               dark-mode mechanism + dark: override rules
  components/                one spec per .tsx file in src/components/
    Logo.md
    Nav.md
    ThemeToggle.md
    SectionReveal.md         wrapper that adds the per-section entrance animation
    Hero.md
    DossierCard.md
    Ticker.md
    Thesis.md
    Archive.md
    Manifesto.md
    Campaigns.md
    System.md
    FinalCTA.md
    Footer.md
  data/
    terms.md                 src/data/terms.ts shape + constants
  infrastructure/
    document.md              index.html, meta tags, fonts, html attrs
    build.md                 Vite, Tailwind, TypeScript, PostCSS
    api.md                   /api/subscribe serverless function
    deployment.md            Vercel + Netlify configs, headers
```

## How to use this when making a change

1. **Find the spec.** Whatever you want to touch — a button color, a margin, an animation — has a home in exactly one spec. Open it.
2. **Read the "Boundary" section.** It tells you what changes stay local vs. what requires touching foundation specs too.
3. **Make the change in the matching code file.** No other code file should need to change.
4. **Update the spec.** Specs are not historical artifacts — they are the current state. If the code drifts from the spec, the spec is wrong, fix it.
5. **If you cross a foundation boundary** (e.g. add a new color token, a new animation, a new typography class), update the foundation spec *first*, then the component spec, then the code.

## Spec format

Every spec follows this shape:

```markdown
# <Name>

## Purpose
What this is and the role it plays.

## File(s)
Exact paths owned by this spec.

## Visual contract
Dimensions, spacing, typography, colors — by token name, not literal hex.

## Behavior contract
State, events, animations, edge cases.

## Light / dark mode
How it themes — auto via tokens, or explicit `dark:` overrides.

## Responsive behavior
Breakpoint-specific changes.

## Dependencies
- Imports (what this file imports)
- Imported by (where this is used)
- Foundation specs depended on

## Boundary
What you may change inside this spec vs. what requires updating other specs first.

## Out of scope
What this component does *not* handle.
```

## Conventions

- **Never use literal hex values in component code.** Always go through a Tailwind token (`bg-paper`, `text-ink`, etc.). See [foundation/design-tokens.md](foundation/design-tokens.md).
- **Never use literal pixel values where a Tailwind class fits.** Arbitrary values (`text-[10px]`, `w-[480px]`) are allowed only when documented in this spec.
- **Never invert a block with `bg-ink text-paper` without adding `dark:bg-canvas dark:text-ink` and per-element `dark:` companions.** See [foundation/theming.md](foundation/theming.md).
- **Never add an animation without a foundation/motion.md entry.**
- **Light mode must remain byte-identical** to the pre-dark-mode baseline. Any color change that affects light mode is a foundation-level change.

## Audit policy

Before pushing to main, ask: did I touch a file whose spec I didn't read? If yes, stop. Either update the spec, or revert the touch.
