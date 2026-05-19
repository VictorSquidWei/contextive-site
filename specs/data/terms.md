# Data — terms.ts

The single source of truth for term records, campaigns, ticker feed, and external links.

## File(s)

- [src/data/terms.ts](../../src/data/terms.ts)

## Exports

### `TermFile` (type) + `TERM_FILES` (array)

The intelligence file shape, used by [DossierCard](../components/DossierCard.md), [Hero](../components/Hero.md), and [Archive](../components/Archive.md).

```ts
type Velocity = 'SPIKING' | 'RISING' | 'STEADY' | 'FALLING';
type Sentiment = number;

interface TermFile {
  ref: string;                        // e.g. '092-A' — reference code
  term: string;                       // e.g. 'RECIPROCAL'
  domain: string;                     // e.g. 'TRADE / POLICY'
  velocity: Velocity;
  sentiment: Sentiment;               // signed; ~[-4, +4]
  novelty: 'HIGH' | 'MEDIUM' | 'LOW';
  firstSeen: string;                  // free-form date string
  totalFiles: number;
  status: 'ACTIVE' | 'REVIEWED' | 'ARCHIVED';
  scope: string;                      // 1-line framing
  contextNote: string;                // 1-2 sentence explanation
  campaign: 'GEOPOLITICS' | 'AI & WORK';
  classification: string;             // e.g. 'FRAME', 'EUPHEMISM', 'WARNING'
}
```

**`TERM_FILES`** is an array of 17 entries: **8 GEOPOLITICS** + **9 AI & WORK**. Order is preserved when rendering — Archive grid renders in array order; Hero picks 5 specific terms by `term` match.

### `CAMPAIGNS`

The campaign descriptors. Used by [Campaigns](../components/Campaigns.md). The array is variable-length — the consumer is designed to scale from 2 to 30+ entries.

```ts
{
  id: string;                         // slug, used for React key
  label: string;                      // 'CAMPAIGN 01' / 'CAMPAIGN 02'
  shortTitle: string;                 // short navigator label, e.g. 'Geopolitics'
  title: string;                      // full headline
  period: string;                     // e.g. 'Q2 2026'
  description: string;                // paragraph
  pillars: { title: string; body: string }[];  // exactly 3
  terms: string[];                    // tracked-term chip list
}
```

`shortTitle` is the chip label shown in the horizontal navigator. Convention: 1–2 words, title-case (e.g. `'Geopolitics'`, `'AI & Work'`, `'Climate Policy'`). Kept short so dozens of chips fit comfortably in the scrollable strip.

The `terms` array entries must match `TermFile.term` values in `TERM_FILES` (string match, uppercase). Campaigns.tsx renders them as visual chips only — it doesn't cross-reference back to the term records.

### `TICKER_TERMS`

Used by [Ticker](../components/Ticker.md). Independent of `TERM_FILES` (no cross-reference required).

```ts
{ term: string; meta: string }[]
```

14 entries. Each `meta` is a short framing label like `"TRADE // SPIKING"`.

### `SOCIAL_LINKS`

```ts
{
  substack: 'https://open.substack.com/pub/contextive',
  twitter: 'https://x.com/contextive_ai',
  instagram: 'https://www.instagram.com/contextive.ai',
}
```

Used by [Nav](../components/Nav.md) (Subscribe button → `substack`) and [Footer](../components/Footer.md) (all four channels — the WEB row uses no link).

### `SUBSTACK_SUBSCRIBE`

```ts
'https://contextive.substack.com/subscribe'
```

The fallback URL opened in a new tab when `/api/subscribe` fails. Used by [Hero](../components/Hero.md) and [FinalCTA](../components/FinalCTA.md).

## Boundary

You may change in this spec:
- Adding / removing / editing entries in `TERM_FILES` (must conform to `TermFile` type).
- Adding / editing `TICKER_TERMS` entries.
- Updating `SOCIAL_LINKS` URLs.
- Updating `SUBSTACK_SUBSCRIBE`.
- Updating `CAMPAIGNS` content.

You must update *other specs* before changing:
- The `TermFile` type — touches [DossierCard.md](../components/DossierCard.md), [Hero.md](../components/Hero.md), [Archive.md](../components/Archive.md).
- The `Velocity` union — touches DossierCard's VelocityBar mapping.
- The campaign union (`'GEOPOLITICS' | 'AI & WORK'`) — touches [Archive.md](../components/Archive.md) tab list. Adding a third campaign domain (e.g. `'CLIMATE'`) requires extending this union AND adding a new Archive tab.
- Renaming `SOCIAL_LINKS` keys — touches Nav and Footer.
- Removing the `shortTitle` field — breaks the Campaigns chip navigator.

Adding a new entry to `CAMPAIGNS` (no schema change, just data) is a pure data edit. The Campaigns component renders the navigator dynamically and handles any count from 2 to 30+ without code changes.

## Out of scope

- How any of this data is rendered — owned by component specs.
- The subscribe API endpoint — [infrastructure/api.md](../infrastructure/api.md).
