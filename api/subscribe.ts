// Vercel serverless function: POST /api/subscribe
// Subscribes an email to the Contextive Substack publication.
// Works automatically when deployed to Vercel — no env vars required.
//
// On Netlify: rename this file to netlify/functions/subscribe.ts
// (Netlify uses a slightly different handler signature — see README)

const SUBSTACK_URL = 'https://contextive.substack.com/api/v1/free';

interface RequestBody {
  email?: string;
}

export default async function handler(req: any, res: any) {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body: RequestBody = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const email = body?.email?.trim().toLowerCase();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email' });
    }

    // Forward to Substack's free-subscription endpoint.
    // Substack accepts this format for public publications.
    const substackRes = await fetch(SUBSTACK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; ContextiveSite/1.0)',
      },
      body: JSON.stringify({
        email,
        first_url: 'https://contextive.ai',
        first_referrer: '',
        current_url: 'https://contextive.ai',
        current_referrer: '',
        referral_code: '',
        source: 'subscribe_page',
      }),
    });

    // Substack returns 200 even when the email is already subscribed,
    // so we treat any 2xx as success.
    if (substackRes.ok) {
      return res.status(200).json({ ok: true });
    }

    // If Substack rejects, fall through and tell the client to redirect.
    return res.status(502).json({
      ok: false,
      fallback: `https://contextive.substack.com/subscribe?email=${encodeURIComponent(email)}`,
    });
  } catch (err: any) {
    return res.status(500).json({
      ok: false,
      error: 'Subscription service unavailable',
      fallback: 'https://contextive.substack.com/subscribe',
    });
  }
}
