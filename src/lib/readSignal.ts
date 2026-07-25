// readSignal — the everyday-reader translation layer.
//
// Turns the measured signal (velocity index + 90d delta) into plain-language reads
// a general audience can grasp at a glance. Every output here is a DETERMINISTIC
// function of already-measured numbers — nothing is invented or estimated, so this
// respects "measure, don't estimate": the words are just a legible label on the math.

import type { CampaignTerm, Campaign } from '../data/campaign';

export type Trend = 'surging' | 'rising' | 'steady' | 'cooling' | 'fading' | 'pending';

export interface PlainRead {
  /** One-word momentum chip, e.g. "Surging". */
  chip: string;
  /** Machine key for styling/sorting. */
  trend: Trend;
  /** Short plain sentence, e.g. "gaining ground fast in the news". */
  blurb: string;
  /** True when there is no measured momentum to translate. */
  pending: boolean;
}

const TREND_LABEL: Record<Trend, string> = {
  surging: 'Surging',
  rising: 'Rising',
  steady: 'Steady',
  cooling: 'Cooling',
  fading: 'Fading',
  pending: 'Pending',
};

const TREND_BLURB: Record<Trend, string> = {
  surging: 'gaining ground fast in the news',
  rising: 'gaining ground in the news',
  steady: 'holding steady in the news',
  cooling: 'losing ground in the news',
  fading: 'fading from the news',
  pending: 'not yet at a measurable level',
};

/**
 * Plain read of a term. Primarily driven by the 90-day momentum (which way the word
 * is moving); falls back to the within-campaign velocity index when 90d is unavailable.
 */
export function plainRead(term: CampaignTerm): PlainRead {
  const m = term.measurement;
  if (m.status === 'pending') {
    return { chip: TREND_LABEL.pending, trend: 'pending', blurb: TREND_BLURB.pending, pending: true };
  }

  // Prefer the 90-day momentum; fall back to the 30-day momentum. Both are real,
  // directional coverage-change measures. Only if neither exists do we fall back to
  // the within-set velocity rank, and then to a conservative (non-extreme) read so a
  // pure rank never gets labelled "Surging"/"Fading" without a momentum series behind it.
  const delta =
    m.deltas?.d90 ?? m.deltas?.d30 ?? null;
  let trend: Trend;
  if (delta !== null && delta !== undefined) {
    if (delta >= 25) trend = 'surging';
    else if (delta >= 8) trend = 'rising';
    else if (delta > -8) trend = 'steady';
    else if (delta > -25) trend = 'cooling';
    else trend = 'fading';
  } else {
    const v = m.velocityIndex ?? 50;
    if (v >= 65) trend = 'rising';
    else if (v >= 35) trend = 'steady';
    else trend = 'cooling';
  }

  return { chip: TREND_LABEL[trend], trend, blurb: TREND_BLURB[trend], pending: false };
}

/** Format a signed percentage for humans, e.g. +66% / −30% / flat. */
export function humanPct(v?: number | null): string {
  if (v === null || v === undefined) return '—';
  if (Math.abs(v) < 1) return 'flat';
  const sign = v > 0 ? '+' : '−';
  return `${sign}${Math.abs(Math.round(v))}%`;
}

/** Sort key: measured terms by velocity index desc; pending terms sink to the bottom. */
export function leaderboardSort(a: CampaignTerm, b: CampaignTerm): number {
  const ap = a.measurement.status === 'pending';
  const bp = b.measurement.status === 'pending';
  if (ap !== bp) return ap ? 1 : -1;
  const av = a.measurement.velocityIndex ?? -1;
  const bv = b.measurement.velocityIndex ?? -1;
  return bv - av;
}

/** Find the campaign term matching a defining-tension pole (case-insensitive). */
export function findTerm(c: Campaign, name?: string): CampaignTerm | undefined {
  if (!name) return undefined;
  const target = name.trim().toLowerCase();
  return c.terms.find((t) => t.term.trim().toLowerCase() === target);
}

/**
 * One plain-language sentence describing the campaign's defining tension from the
 * two poles' measured momentum, e.g. "cost allocation is surging while energy
 * dominance is steady." Falls back gracefully if a pole isn't a measured term.
 */
export function tensionCaption(c: Campaign): string | undefined {
  const dt = c.definingTension;
  if (!dt) return undefined;
  const ta = findTerm(c, dt.a);
  const tb = findTerm(c, dt.b);
  const ra = ta ? plainRead(ta) : undefined;
  const rb = tb ? plainRead(tb) : undefined;
  if (ra && rb && !ra.pending && !rb.pending) {
    return `"${dt.a}" is ${ra.chip.toLowerCase()} while "${dt.b}" is ${rb.chip.toLowerCase()}.`;
  }
  return undefined;
}
