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
- Submit the form on contextive.info — a row (timestamp, email, source, first_name, …) should appear in the Sheet.
- The `/api/subscribe` response now includes `"stored": true` when a durable store accepted the signup.
- The `source` column tags where they signed up: `hero`, `final-cta`, `api-waitlist`, `api-waitlist-footer`.

## Updating the script (version 2: names, ZIP, word requests, ad tags)
Version 2 of `subscribe-sheet.gs` adds columns after `source`: first_name, last_name,
postal_code, city, state, word_request, utm_source, utm_medium, utm_campaign, utm_content,
signup_id. Existing rows keep their three columns; the new header cells are added on the
first new sign-up.

1. Open the Sheet → **Extensions → Apps Script**. Replace the code with the new
   `subscribe-sheet.gs` and **Save**.
2. **Deploy → Manage deployments → pencil (Edit) → Version: New version → Deploy.**
   Do NOT use "New deployment": that makes a new `/exec` URL, and the site keeps posting
   to the old one (you would then have to update `SUBSCRIBE_WEBHOOK_URL` in Vercel).
3. Update the script **before** the site change goes live: the old script ignores the new
   fields, so anything typed into them in between would not be saved.

The sign-up form is two steps: first name + email are saved at once; the optional second
step (word, ZIP, last name) fills in the same row through a random `signup_id`. City and
state are looked up from a US ZIP on the server (only the 5-digit ZIP is sent, to
zippopotam.us); other postal codes are stored as typed.

## Alternative: Vercel KV
Instead of the webhook, provision **Vercel KV** (Upstash) on the project and set `KV_REST_API_URL`
+ `KV_REST_API_TOKEN`. Signups are added to a `subscribers` set. The function supports either store
(or both); no code change needed.
