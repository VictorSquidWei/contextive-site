# Durable signup capture — 5-minute setup

`/api/subscribe` records every waitlist/dispatch signup to our own list, but durable
storage only happens if a store is configured. Until then, signups land **only** in Vercel's
ephemeral runtime logs (and the function logs a warning saying so). Wire this once and every
signup appends to a Google Sheet you own.

## Steps
1. Create a Google Sheet (e.g. "Contextive signups").
2. **Extensions → Apps Script.** Delete the stub, paste the contents of [`subscribe-sheet.gs`](./subscribe-sheet.gs), and Save.
3. **Deploy → New deployment → type: Web app.** Execute as **Me**, Who has access **Anyone**. Deploy, and authorize when prompted. Copy the Web app URL (ends in `/exec`).
4. In **Vercel → project `contextive-site-test` → Settings → Environment Variables**, add
   `SUBSCRIBE_WEBHOOK_URL` = that `/exec` URL (Production scope). Save.
5. **Redeploy** (Deployments → ⋯ → Redeploy, or push any commit) so the new env var is picked up.

## Verify
- Submit the form on contextive.info — a row `(timestamp, email, source)` should appear in the Sheet.
- The `/api/subscribe` response now includes `"stored": true` when a durable store accepted the signup.
- The `source` column tags where they signed up: `hero`, `final-cta`, `api-waitlist`, `api-waitlist-footer`.

## Alternative: Vercel KV
Instead of the webhook, provision **Vercel KV** (Upstash) on the project and set `KV_REST_API_URL`
+ `KV_REST_API_TOKEN`. Signups are added to a `subscribers` set. The function supports either store
(or both); no code change needed.
