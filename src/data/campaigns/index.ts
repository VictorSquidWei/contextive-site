// Single typed registry of every campaign on the site.
//
// Campaign 02 is still reconciled from the legacy terms.ts; campaign 01 has been
// moved onto the measured standard (01.json, slug trade-war) and campaigns 03+
// are dropped in as JSON produced by the converter (scripts/build-campaign.mjs)
// from the toolkit's campaign.json + the pipeline's cards.json. To add a
// campaign: generate its JSON, import it here, and add it to `measuredCampaigns`.

import { legacyCampaigns } from '../legacy';
import type { Campaign } from '../campaign';

// --- Measured / brief-driven campaigns (added in Phase 3) ---------------------
import c01 from './01.json';
import c02 from './02.json';
import c03 from './03.json';
import c04 from './04.json';
import c05 from './05.json';
import c06 from './06.json';
import c07 from './07.json';
import c08 from './08.json';
import c09 from './09.json';
import c10 from './10.json';

const measuredCampaigns: Campaign[] = [
  c01 as unknown as Campaign,
  c02 as unknown as Campaign,
  c03 as unknown as Campaign,
  c04 as unknown as Campaign,
  c05 as unknown as Campaign,
  c06 as unknown as Campaign,
  c07 as unknown as Campaign,
  c08 as unknown as Campaign,
  c09 as unknown as Campaign,
  c10 as unknown as Campaign,
];

// C01 and C02 now ship from the measured 01.json / 02.json above; drop their
// legacy entries so the measured pages (trade-war, ai-and-work) supersede them.
const legacyMeasuredExcluded: Campaign[] = legacyCampaigns().filter(
  (c) => c.number !== '01' && c.number !== '02'
);

/** Every campaign, newest last (sorted by number). */
export const ALL_CAMPAIGNS: Campaign[] = [...legacyMeasuredExcluded, ...measuredCampaigns].sort(
  (a, b) => a.number.localeCompare(b.number)
);

export function getCampaign(number: string, slug?: string): Campaign | undefined {
  return ALL_CAMPAIGNS.find(
    (c) => c.number === number && (slug === undefined || c.slug === slug)
  );
}

export function getCampaignById(id: string): Campaign | undefined {
  return ALL_CAMPAIGNS.find((c) => c.id === id);
}
