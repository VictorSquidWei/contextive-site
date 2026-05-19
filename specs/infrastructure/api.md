# API — /api/subscribe

The single serverless endpoint that handles waitlist email submission.

## File(s)

- [api/subscribe.ts](../../api/subscribe.ts)

## Purpose

Forward user-submitted emails to the Contextive Substack publication's free-subscribe endpoint, so the waitlist captures into our existing newsletter list. Acts as a CORS-friendly proxy with input validation.

## Platform

Deployed on **Vercel** as a serverless function (file lives at `/api/subscribe.ts`, exported `default` handler with `(req, res)` shape).

To deploy on **Netlify**: rename the file to `netlify/functions/subscribe.ts` and adapt the handler signature (see comment in source). The current setup is Vercel-native; Netlify use is documented but not active.

## Request contract

`POST /api/subscribe`

- Method: `POST` (preflight `OPTIONS` answered with 204).
- Content-Type: `application/json`.
- Body: `{ "email": "user@example.com" }`.

### CORS

```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```

Open CORS — acceptable because the endpoint is a single-purpose write that validates input and rate-limits via Substack's own protections.

### Validation

- Reads `req.body.email`, trims, lowercases.
- Regex: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/` (simple presence check, not full RFC).
- Returns `400 { error: 'Invalid email' }` on failure.

### Method gating

- `OPTIONS` → 204.
- Anything other than `POST` → `405 { error: 'Method not allowed' }`.

## Response contract

| HTTP | Body | Meaning |
|---|---|---|
| 200 | `{ ok: true }` | Substack accepted (or duplicate, which Substack still returns 2xx for) |
| 400 | `{ error: 'Invalid email' }` | Client validation failed |
| 405 | `{ error: 'Method not allowed' }` | Wrong method |
| 502 | `{ ok: false, fallback: 'https://...' }` | Substack rejected — client should redirect user to `fallback` URL |
| 500 | `{ ok: false, error: '...', fallback: 'https://contextive.substack.com/subscribe' }` | Internal error — client should redirect to `fallback` |

The `fallback` URL on 502 includes the user's email pre-filled (`?email=...`); on 500 it's the generic Substack page.

## Upstream call

```
POST https://contextive.substack.com/api/v1/free
```

Body (JSON):
```json
{
  "email": "<validated>",
  "first_url": "https://contextive.ai",
  "first_referrer": "",
  "current_url": "https://contextive.ai",
  "current_referrer": "",
  "referral_code": "",
  "source": "subscribe_page"
}
```

Headers:
- `Content-Type: application/json`
- `User-Agent: Mozilla/5.0 (compatible; ContextiveSite/1.0)` — Substack rejects empty/missing UAs.

Substack returns 200 even for already-subscribed emails, so any `2xx` is treated as success.

## Consumers

- [Hero waitlist form](../components/Hero.md) — POSTs and falls back to opening `SUBSTACK_SUBSCRIBE?email=...` in a new tab on any non-2xx.
- [FinalCTA form](../components/FinalCTA.md) — same flow, slightly different copy.

## Local dev behavior

`npm run dev` does **not** run serverless functions. The `/api/subscribe` POST will fail (typically with a 404 or a fetch error), and the client-side flow falls through to the Substack popup — this is documented and expected. Test the real endpoint by running `vercel dev` locally if needed.

## Environment variables

None required. The function is open-credential — Substack's free-subscribe endpoint accepts unauthenticated submissions for public publications.

## Boundary

You may change in this spec:
- The email regex (must remain a basic well-formedness check, not deep validation).
- The User-Agent string.
- The body fields sent to Substack (must remain compatible with Substack's v1/free format).
- Response error messages.

You must update *other specs* before changing:
- The request shape — touches [Hero.md](../components/Hero.md) and [FinalCTA.md](../components/FinalCTA.md) fetch calls.
- The response shape — both consumers currently only branch on `res.ok`; changing to require `fallback` parsing on 2xx would touch both.
- Adding required env vars — would require platform config in Vercel (and update [deployment.md](deployment.md)).
- Switching to a different newsletter provider (full rewrite — touches both forms and `SUBSTACK_SUBSCRIBE` in [data/terms.md](../data/terms.md)).

## Out of scope

- The Substack fallback URL string — owned by [data/terms.md](../data/terms.md).
- Rate limiting / abuse protection (currently relies on Substack's own).
- Logging / observability (currently none).
