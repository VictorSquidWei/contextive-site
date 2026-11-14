// Ad attribution for a sign-up: the utm_* tags on the link a visitor arrived by.
//
// Captured once, on the first page of the visit, into sessionStorage, so someone who
// lands on the homepage from an Instagram ad and signs up two pages later still carries
// the ad's tags. Nothing here identifies a person; the tags only name the ad.

const KEY = 'ctx_utm';
const FIELDS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'] as const;

export type Attribution = Partial<Record<(typeof FIELDS)[number], string>>;

const clean = (v: string) => v.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 60);

/** Call once at startup: keeps the first tagged landing of this visit. */
export function captureAttribution(): void {
  try {
    const params = new URLSearchParams(window.location.search);
    const found: Attribution = {};
    for (const f of FIELDS) {
      const v = params.get(f);
      if (v && clean(v)) found[f] = clean(v);
    }
    if (Object.keys(found).length && !sessionStorage.getItem(KEY)) {
      sessionStorage.setItem(KEY, JSON.stringify(found));
    }
  } catch {
    // Storage blocked (private mode, embedded browser): the sign-up still works untagged.
  }
}

/** The tags captured for this visit, or {} when the visitor did not arrive by a tagged link. */
export function readAttribution(): Attribution {
  try {
    const raw = JSON.parse(sessionStorage.getItem(KEY) || '{}');
    const out: Attribution = {};
    for (const f of FIELDS) if (typeof raw?.[f] === 'string') out[f] = clean(raw[f]);
    return out;
  } catch {
    return {};
  }
}
