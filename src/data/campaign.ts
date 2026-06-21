// Unified per-campaign data contract.
//
// One shape that the pipeline's cards.json + the brief's campaign.json (campaigns
// 03+) AND the legacy terms.ts (campaigns 01-02) all map onto, so the site and the
// briefs read the same numbers. The web analogue of "measure, don't estimate":
// a campaign page is rendered straight from this data — nothing is hand-keyed into
// the component.

/** The political firewall, verbatim. Shown on every campaign page. Do not edit. */
export const FIREWALL =
  'We track how the words have been used and how fast they are winning, not whether the underlying politics is correct.';

export type MeasurementStatus = 'measured' | 'pending' | 'editorial';

export type AdoptionStage =
  | 'dormant'
  | 'emerging'
  | 'rising'
  | 'spreading'
  | 'contested'
  | 'fading'
  | 'declining';

export interface Deltas {
  /** 30-day % change in coverage intensity. null when the baseline is ~0. */
  d30?: number | null;
  /** 90-day % change. */
  d90?: number | null;
  /** Year-over-year % change (same 30-day window, one year earlier). */
  yoy?: number | null;
}

export interface Inflection {
  /** ISO date (YYYY-MM-DD). */
  date: string;
  /** z-score of the smoothed peak. */
  z?: number;
}

export interface CorpusDensity {
  value: number;
  note?: string;
  /** True when this is the GDELT coverage-intensity proxy, not literal mentions/M. */
  proxy?: boolean;
}

export interface Measurement {
  status: MeasurementStatus;
  /** 0-100 within-set percentile of velocity_ratio (measured campaigns only). */
  velocityIndex?: number;
  /** Qualitative label carried from the legacy 01-02 data (SPIKING/RISING/...). */
  velocityLabel?: string;
  adoptionStage?: AdoptionStage | string;
  deltas?: Deltas;
  /** Clamped GDELT tone, -5..+5; null when unavailable. */
  sentiment?: number | null;
  inflections?: Inflection[];
  corpusDensity?: CorpusDensity;
  /** Retrieval timestamp for measured figures (audit trail). */
  retrievedAt?: string;
  /** Why a term is pending (e.g. "awaiting pipeline run"). */
  reason?: string;
  /** Legacy editorial volume metric (campaigns 01-02 only). */
  totalFiles?: number;
}

export interface Verbatim {
  quote: string;
  attribution?: string;
  sourceUrl?: string;
}

export interface CampaignTerm {
  ref?: string;
  term: string;
  /** 'A' | 'B' | 'C' for clustered campaigns (03+); undefined for flat 01-02. */
  cluster?: string;
  domainTag?: string | null;
  /** Legacy classification (FRAME / EUPHEMISM / ...), campaigns 01-02. */
  classification?: string;
  measurement: Measurement;
  platforms?: string[];
  coOccurrence?: string[];
  whatItDoes?: string;
  whereContested?: string;
  verbatims?: Verbatim[];
  firstSeen?: string;
  statusLabel?: string;
}

export interface Cluster {
  key: string;
  name: string;
  blurb?: string;
}

export interface Pillar {
  title: string;
  body: string;
}

export interface Tension {
  a?: string;
  b?: string;
  title?: string;
  body: string;
}

export interface DefiningTension {
  a: string;
  b: string;
  note?: string;
}

export interface Campaign {
  /** Two-digit campaign number, e.g. '05'. */
  number: string;
  /** URL slug, e.g. 'economy'. */
  slug: string;
  /** Stable id `${number}-${slug}`, e.g. '05-economy'. */
  id: string;
  /** Display label, e.g. 'CAMPAIGN 05'. */
  label: string;
  title: string;
  shortTitle: string;
  period: string;
  status: 'in-progress' | 'published';
  /** 'measured' = pipeline-sourced; 'editorial' = qualitative/sample (01-02). */
  signalBasis: 'measured' | 'editorial';
  firewall: string;
  /** One-line summary for the homepage index. */
  summary?: string;
  anchor?: string;
  thesis?: string[];
  definingTension?: DefiningTension;
  clusters?: Cluster[];
  pillars?: Pillar[];
  tensions?: Tension[];
  terms: CampaignTerm[];
  generatedAt?: string;
  refDate?: string;
  source?: string;
  measurementWindow?: string;
}

/** Canonical route for a campaign sub-space, e.g. '/campaigns/05-economy'. */
export function campaignPath(c: Pick<Campaign, 'number' | 'slug'>): string {
  return `/campaigns/${c.number}-${c.slug}`;
}

/** Count of measured (non-pending) terms — used for the index "X/Y measured" line. */
export function measuredCount(c: Campaign): { measured: number; total: number } {
  const total = c.terms.length;
  const measured = c.terms.filter((t) => t.measurement.status !== 'pending').length;
  return { measured, total };
}
