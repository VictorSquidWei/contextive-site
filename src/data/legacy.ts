// Adapts the original campaigns 01-02 (qualitative "sample" data in terms.ts) into
// the unified Campaign contract, so every campaign renders from one shape without
// re-keying the existing data. New campaigns (03+) are dropped in as JSON by the
// converter; these two are reconciled in code from their existing source.

import { TERM_FILES, CAMPAIGNS as LEGACY_CAMPAIGNS } from './terms';
import type { TermFile } from './terms';
import { FIREWALL } from './campaign';
import type { Campaign, CampaignTerm, AdoptionStage } from './campaign';

const CAMPAIGN_ENUM: Record<string, TermFile['campaign']> = {
  geopolitics: 'GEOPOLITICS',
  'ai-work': 'AI & WORK',
};

const VELOCITY_TO_STAGE: Record<TermFile['velocity'], AdoptionStage> = {
  SPIKING: 'spreading',
  RISING: 'rising',
  STEADY: 'contested',
  FALLING: 'declining',
};

function adaptTerm(t: TermFile): CampaignTerm {
  return {
    ref: t.ref,
    term: t.term,
    domainTag: t.domain,
    classification: t.classification,
    measurement: {
      status: 'editorial',
      velocityLabel: t.velocity,
      adoptionStage: VELOCITY_TO_STAGE[t.velocity],
      sentiment: t.sentiment,
      totalFiles: t.totalFiles,
    },
    whatItDoes: t.scope,
    whereContested: t.contextNote,
    firstSeen: t.firstSeen,
    statusLabel: t.status,
  };
}

/** Campaigns 01-02 as unified Campaign objects, derived from terms.ts at load. */
export function legacyCampaigns(): Campaign[] {
  return LEGACY_CAMPAIGNS.map((c) => {
    const number = c.label.replace(/[^0-9]/g, '').padStart(2, '0'); // 'CAMPAIGN 01' -> '01'
    const enumKey = CAMPAIGN_ENUM[c.id];
    const terms = TERM_FILES.filter((t) => t.campaign === enumKey).map(adaptTerm);
    return {
      number,
      slug: c.id,
      id: `${number}-${c.id}`,
      label: c.label,
      title: c.title,
      shortTitle: c.shortTitle,
      period: c.period,
      status: 'published' as const,
      signalBasis: 'editorial' as const,
      firewall: FIREWALL,
      summary: c.description,
      thesis: [c.description],
      pillars: c.pillars,
      terms,
    };
  });
}
