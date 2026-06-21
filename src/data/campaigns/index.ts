// Single typed registry of every campaign on the site.
//
// Campaigns 01-02 are reconciled from the legacy terms.ts; campaigns 03+ are
// dropped in as JSON produced by the converter (scripts/build-campaign.mjs) from
// the toolkit's campaign.json + the pipeline's cards.json. To add a campaign:
// generate its JSON, import it here, and add it to `measuredCampaigns`.

import { legacyCampaigns } from '../legacy';
import type { Campaign } from '../campaign';

// --- Measured / brief-driven campaigns (added in Phase 3) ---------------------
import c03 from './03.json';
import c04 from './04.json';
import c05 from './05.json';

const measuredCampaigns: Campaign[] = [
  c03 as unknown as Campaign,
  c04 as unknown as Campaign,
  c05 as unknown as Campaign,
];

/** Every campaign, newest last (sorted by number). */
export const ALL_CAMPAIGNS: Campaign[] = [...legacyCampaigns(), ...measuredCampaigns].sort(
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
