// Vercel serverless function: POST /api/subscribe
//
// Two jobs:
//   1) Record the email to OUR OWN list (so we can automate emails later).
//   2) Forward to Substack's free-subscription endpoint (the client also opens the
//      Substack page, since subscribing there is revenue).
//
// Our-list persistence (all best-effort; configure any/all):
//   - SUBSCRIBE_WEBHOOK_URL : POST one SignupRecord (below) to a webhook you own
//       (e.g. a Google Apps Script bound to a Sheet, Zapier, Make). Easiest durable store.
//   - Vercel KV / Upstash (KV_REST_API_URL + KV_REST_API_TOKEN): appends to a "subscribers" set.
//   - Always console.log("[subscribe] ...") so signups land in Vercel runtime logs
//     until a store above is wired — nothing is lost in the meantime.

const SUBSTACK_SUBSCRIBE = 'https://contextive.substack.com/subscribe';

interface RequestBody {
  email?: string;
  source?: string;
  /** Honeypot — real users never fill this; bots often do. Any value = silently dropped. */
  hp?: string;
  first_name?: string;
  last_name?: string;
  postal?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  /** Random id from the form that ties the optional second step to the same row. */
  signup_id?: string;
  /** Second step: fill in optional details on the row with this signup_id. */
  update?: boolean;
  word_request?: string;
}

/** One row of the sign-up Sheet. Field order matches scripts/subscribe-sheet.gs. */
interface SignupRecord {
  email: string;
  ts: string;
  source: string;
  first_name: string;
  last_name: string;
  postal: string;
  city: string;
  state: string;
  word_request: string;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  signup_id: string;
}

/** The optional second step: details for the row this signup_id created. */
interface SignupUpdate {
  update: true;
  signup_id: string;
  last_name: string;
  postal: string;
  city: string;
  state: string;
  word_request: string;
}

const SIGNUP_ID = /^[a-zA-Z0-9-]{10,40}$/;

/** Free text from the form: no control characters, single spaces, capped. */
function text(v: unknown, max: number): string {
  return typeof v === 'string'
    ? v.replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, max)
    : '';
}
/** An ad tag: letters, digits and . _ - only. */
function tag(v: unknown): string {
  return typeof v === 'string' ? v.trim().replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_.-]/g, '').slice(0, 60) : '';
}

/** POST a payload to the Sheet webhook; true when it accepted it. */
async function toWebhook(payload: SignupRecord | SignupUpdate): Promise<boolean> {
  const webhook = process.env.SUBSCRIBE_WEBHOOK_URL;
  if (!webhook) return false;
  try {
    const r = await fetch(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    // Apps Script answers HTTP 200 even when it refuses a write, so read its { ok }.
    const j: any = await r.json().catch(() => null);
    return r.ok && j?.ok === true;
  } catch (e) {
    console.error('[subscribe] webhook failed', e);
    return false;
  }
}

/**
 * City and state for a US ZIP, so the form never has to ask for them. Best effort:
 * only the 5-digit ZIP leaves our server (to the free zippopotam.us lookup), with a
 * short timeout; anything else (a non-US postal code, a timeout) leaves both blank.
 */
async function placeForZip(postal: string, country: string): Promise<{ city: string; state: string }> {
  const zip = /^(\d{5})(?:-\d{4})?$/.exec(postal)?.[1];
  // Five digits are a ZIP only in the US (75001 is also Paris): look up US visitors only,
  // going by Vercel's request country. Everyone else keeps the code exactly as typed.
  if (!zip || country !== 'US') return { city: '', state: '' };
  try {
    const r = await fetch(`https://api.zippopotam.us/us/${zip}`, { signal: AbortSignal.timeout(1500) });
    if (!r.ok) return { city: '', state: '' };
    const j: any = await r.json();
    const place = j?.places?.[0];
    return { city: text(place?.['place name'], 60), state: text(place?.['state abbreviation'], 4) };
  } catch {
    return { city: '', state: '' };
  }
}

// Best-effort in-memory per-IP throttle (per warm serverless instance). A durable
// cross-instance limit needs Vercel KV / Upstash — deferred to Victor's account.
const HITS = new Map<string, number[]>();
const RL_WINDOW_MS = 60_000;
const RL_MAX = 8;
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (HITS.get(ip) || []).filter((t) => now - t < RL_WINDOW_MS);
  arr.push(now);
  HITS.set(ip, arr);
  if (HITS.size > 5000) HITS.clear(); // crude memory guard
  return arr.length > RL_MAX;
}

async function recordToOurList(rec: SignupRecord): Promise<boolean> {
  const { email, ts, source } = rec;
  const webhook = process.env.SUBSCRIBE_WEBHOOK_URL;
  let stored = await toWebhook(rec);

  const kvUrl = process.env.KV_REST_API_URL;
  const kvToken = process.env.KV_REST_API_TOKEN;
  if (kvUrl && kvToken) {
    try {
      const r = await fetch(`${kvUrl}/sadd/subscribers/${encodeURIComponent(email)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${kvToken}` },
      });
      stored = stored || r.ok;
    } catch (e) {
      console.error('[subscribe] kv failed', e);
    }
  }

  // Logged for every sign-up. The email appears only when no store took it, so a failed
  // write is never lost and a stored one keeps personal details out of the logs.
  console.log(
    `[subscribe] ${ts} (${source}${rec.utm_content ? ` · ${rec.utm_content}` : ''}) stored=${stored}` +
      (stored ? '' : ` ${email}`),
  );

  if (!webhook && !kvUrl) {
    console.warn(
      '[subscribe] no durable store configured — set SUBSCRIBE_WEBHOOK_URL or Vercel KV; ' +
        'signup is only in runtime logs (see scripts/SUBSCRIBE_SETUP.md)',
    );
  }
  return stored;
}

export default async function handler(req: any, res: any) {
  // Lock cross-origin access to the site itself (the form is same-origin; no third party needs this).
  const ALLOWED_ORIGIN = 'https://contextive.info';
  if (req.headers?.origin === ALLOWED_ORIGIN) {
    res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  }
  res.setHeader('Vary', 'Origin');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  // Best-effort per-IP throttle (ads attract bots; a durable limit needs Vercel KV).
  const fwd = req.headers?.['x-forwarded-for'];
  const ip = (Array.isArray(fwd) ? fwd[0] : fwd || '').split(',')[0].trim() || 'unknown';
  if (rateLimited(ip)) return res.status(429).json({ ok: false, error: 'Too many requests' });

  try {
    // Reject oversized payloads before parsing (abuse / memory guard).
    const raw = typeof req.body === 'string' ? req.body : JSON.stringify(req.body ?? {});
    if (raw && raw.length > 2048) {
      return res.status(413).json({ ok: false, error: 'Payload too large' });
    }
    const body: RequestBody = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {};

    // Honeypot: bots fill this hidden field. Return a benign OK without recording.
    if (body?.hp) {
      return res.status(200).json({ ok: true, stored: false });
    }

    const cc = req.headers?.['x-vercel-ip-country'];
    const country = (Array.isArray(cc) ? cc[0] : cc || '').toUpperCase();

    // Second step: optional details for a row created moments ago. It names the row by
    // its random signup_id, never by email, so nobody can edit someone else's sign-up.
    if (body?.update) {
      const signup_id = typeof body.signup_id === 'string' ? body.signup_id : '';
      if (!SIGNUP_ID.test(signup_id)) return res.status(400).json({ ok: false, error: 'Invalid signup id' });
      const postal = text(body?.postal, 10).toUpperCase();
      const { city, state } = await placeForZip(postal, country);
      const stored = await toWebhook({
        update: true,
        signup_id,
        last_name: text(body?.last_name, 60),
        postal,
        city,
        state,
        word_request: text(body?.word_request, 60),
      });
      console.log(`[subscribe] details ${signup_id.slice(0, 8)} stored=${stored}`);
      return res.status(200).json({ ok: true, stored });
    }

    const email = body?.email?.trim().toLowerCase();

    if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: 'Invalid email' });
    }

    // Where the signup came from (e.g. "api-waitlist", "hero", "final-cta"), so the
    // API-waitlist intent is distinguishable from plain dispatch signups in our list.
    const source = (body?.source || 'site').replace(/[^a-z0-9_-]/gi, '').slice(0, 32) || 'site';

    // Record to OUR list only. The Substack subscribe happens client-side (the newsletter
    // CTA opens Substack in the browser); the server no longer forwards arbitrary emails to
    // Substack — that removed an email-amplification abuse vector on this public endpoint.
    const postal = text(body?.postal, 10).toUpperCase();
    const { city, state } = await placeForZip(postal, country);
    const stored = await recordToOurList({
      email,
      ts: new Date().toISOString(),
      source,
      first_name: text(body?.first_name, 60),
      last_name: text(body?.last_name, 60),
      postal,
      city,
      state,
      utm_source: tag(body?.utm_source),
      utm_medium: tag(body?.utm_medium),
      utm_campaign: tag(body?.utm_campaign),
      utm_content: tag(body?.utm_content),
      word_request: text(body?.word_request, 60),
      signup_id: typeof body?.signup_id === 'string' && SIGNUP_ID.test(body.signup_id) ? body.signup_id : '',
    });

    return res.status(200).json({
      ok: true,
      stored,
      substackUrl: `${SUBSTACK_SUBSCRIBE}?email=${encodeURIComponent(email)}`,
    });
  } catch {
    // Never break the user flow; the client also opens Substack directly.
    return res.status(200).json({ ok: true, substackUrl: SUBSTACK_SUBSCRIBE });
  }
}
