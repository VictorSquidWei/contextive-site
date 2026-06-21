---
description: Produce the social-asset spec and on-brand graphic scaffolds for a campaign.
argument-hint: "<campaign number> [carousel|x-card|substack-header]"
---

Produce social graphics assets for: $ARGUMENTS

The design system now lives in **Claude Design** as **"contextive design system"** — so
`/new-graphics` produces the per-card **Claude Design prompts** (pre-filled from the measured
`cards.json`, in the term-profile field layout used by `/new-instructions`) for Courtney to run
there, rather than improvising SVG. Still **offer — but don't build unless I ask** — a small
`generators/build_graphics.js` that emits these prompts (or rendered SVGs) straight from `cards.json`.

Brand visual rules (hard constraints):
- Monochrome, typographic. Tokens: Space Grotesk (display), Inter (body), JetBrains Mono (metadata);
  ink 111111/1A1A1A, mute 555555, cream F5F5F3.
- **No partisan palette, no candidate imagery, no party logos.** No chart that implies a verdict.
- Carousel = 8 slides, Variant A/B/C menu; the three vocabulary slides share one variant family;
  the pivot slide is the visual climax.
- Numbers on a card come from the measured `cards.json`, not invented.

Deliver: the slide-by-slide spec (copy + which signal numbers go where) plus the rendered
scaffolds, formatted so Courtney can finish them in Claude Design. Equal weight across clusters;
no named person in any line.
