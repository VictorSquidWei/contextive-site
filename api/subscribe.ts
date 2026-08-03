// Vercel serverless function: POST /api/subscribe
//
// Two jobs:
//   1) Record the email to OUR OWN list (so we can automate emails later).
//   2) Forward to Substack's free-subscription endpoint (the client also opens the
//      Substack page, since subscribing there is revenue).
//
// Our-list persistence (all best-effort; configure any/all):
//   - SUBSCRIBE_WEBHOOK_URL : POST { email, ts, source } to a webhook you own
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

async function recordToOurList(email: string, source: string): Promise<boolean> {
  const ts = new Date().toISOString();
  // Always logged (visible in Vercel runtime logs) even if no durable store is set.
  console.log(`[subscribe] ${ts} ${email} (${source})`);
  let stored = false;

  const webhook = process.env.SUBSCRIBE_WEBHOOK_URL;
  if (webhook) {
    try {
      const r = await fetch(webhook, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, ts, source }),
      });
      stored = stored || r.ok;
    } catch (e) {
      console.error('[subscribe] webhook failed', e);
    }
  }

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

    const email = body?.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: 'Invalid email' });
    }

    // Where the signup came from (e.g. "api-waitlist", "hero", "final-cta"), so the
    // API-waitlist intent is distinguishable from plain dispatch signups in our list.
    const source = (body?.source || 'site').replace(/[^a-z0-9_-]/gi, '').slice(0, 32) || 'site';

    // Record to OUR list only. The Substack subscribe happens client-side (the newsletter
    // CTA opens Substack in the browser); the server no longer forwards arbitrary emails to
    // Substack — that removed an email-amplification abuse vector on this public endpoint.
    const stored = await recordToOurList(email, source);

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
