// gdelt-geo — the Monitor map's data contract.
//
// A SEPARATE instrument from velocity: "places named in articles that use this word",
// measured by the toolkit's pipeline/geo_pipeline.py (GDELT Web NGrams articles joined
// on URL to the GDELT GKG record, reading its V2Locations). It never feeds velocity,
// percentiles or the plainRead() chips. Until a measured run lands, the file is a
// `pending` placeholder and the map draws no points at all.

import raw from '../../data/geo/gdelt-geo.json';

export interface GeoPoint {
  /** GDELT's geocoded name, e.g. "Austin, Texas, United States". */
  name: string;
  /** FIPS 10-4 country code (GDELT's convention, not ISO). */
  cc: string;
  lat: number | null;
  lon: number | null;
  /** Distinct articles using the word that name this place. */
  articles: number;
  /** articles ÷ the word's located articles (an article can name many places). */
  share: number;
  /** GDELT location type (1 country, 2 US state, 3 US city, 4 world city, 5 world state). */
  type?: number;
}

export interface GeoTerm {
  campaign: string;
  term: string;
  window: { start: string; end: string };
  articles: number;
  gkg_articles: number;
  located_articles: number;
  status: 'measured' | 'pending';
  reason?: string;
  countries?: GeoPoint[];
  places?: GeoPoint[];
}

export interface GeoFile {
  instrument: 'gdelt-geo';
  methodology_version: string;
  label: string;
  source: string;
  status: 'measured' | 'pending';
  mode: 'recent' | 'campaign' | null;
  window: { start: string; end: string; days: number } | null;
  retrieved_at: string | null;
  min_located_articles: number;
  reason?: string;
  notes?: string[];
  terms: Record<string, GeoTerm>;
}

export const GEO = raw as unknown as GeoFile;

/** Key a term the way geo_pipeline.py does: campaign number + lowercased term. */
export function geoKey(campaign: string, term: string): string {
  return `${campaign}|${term.trim().toLowerCase()}`;
}

/** The measured geography for a term, or undefined (pending / not in the file). */
export function geoFor(campaign: string, term: string): GeoTerm | undefined {
  if (GEO.status !== 'measured') return undefined;
  const g = GEO.terms[geoKey(campaign, term)];
  return g && g.status === 'measured' ? g : undefined;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** "2026-07-21" → "Jul 21, 2026", parsed by hand so it never shifts across a timezone. */
export function fmtDate(iso?: string | null): string | null {
  const m = iso ? /^(\d{4})-(\d{2})-(\d{2})/.exec(iso.trim()) : null;
  if (!m) return null;
  const mi = Number(m[2]) - 1;
  if (mi < 0 || mi > 11) return null;
  return `${MONTHS[mi]} ${Number(m[3])}, ${m[1]}`;
}

/** "Jul 15 – Jul 21, 2026" (year once when both ends share it). */
export function fmtRange(a?: string | null, b?: string | null): string | null {
  const fa = fmtDate(a);
  const fb = fmtDate(b);
  if (!fa || !fb) return null;
  if (a!.slice(0, 4) === b!.slice(0, 4)) return `${fa.replace(/, \d{4}$/, '')} – ${fb}`;
  return `${fa} – ${fb}`;
}
