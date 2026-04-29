# Contextive — Landing Page

The Contextive marketing site. React + TypeScript + Vite + Tailwind, with a serverless backend for Substack subscriptions.

Built for the Campaign 02 launch and deployable in under 5 minutes.

---

## What's in here

```
contextive-site/
├── api/
│   └── subscribe.ts          # Serverless function — POSTs emails to Substack
├── public/
│   └── favicon.svg
├── src/
│   ├── components/           # All UI sections (Hero, Archive, Campaigns, etc.)
│   ├── data/
│   │   └── terms.ts          # Term intelligence data — both campaigns
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── index.html
├── vercel.json               # Vercel deployment config
├── netlify.toml              # Netlify deployment config (alternative)
└── package.json
```

## Sections (in order)

1. **Nav** — sticky, transitions to translucent on scroll
2. **Hero** — "Language is leverage." + waitlist + rotating dossier card stack
3. **Ticker** — live marquee of tracked terms
4. **Thesis** — the "what is Contextive" pitch with stats
5. **Archive** — full grid of intelligence files, filterable by campaign
6. **Manifesto** — pull quote on dark background (rhythm break)
7. **Campaigns** — Campaign 01 (Geopolitics) + Campaign 02 (AI & Work) with pillars and term chips
8. **System** — 4-stage pipeline explanation
9. **Final CTA** — second waitlist
10. **Footer** — all social links matching the screenshot brief

---

## Run locally

```bash
npm install
npm run dev
```

Opens at `http://localhost:5173`.

The `/api/subscribe` endpoint is **not active** in Vite dev mode — the form will fall back to opening Substack directly with the email pre-filled. To test the full backend flow locally, use `vercel dev` (see below).

---

## Deploy to Vercel (recommended — 2 minutes)

This is the path that makes the `/api/subscribe` endpoint Just Work.

### Option A: GitHub → Vercel (best if you'll iterate)

1. Create a new GitHub repo, push this folder to it:
   ```bash
   git init
   git add .
   git commit -m "Initial Contextive site"
   git remote add origin https://github.com/YOUR_USER/contextive-site.git
   git push -u origin main
   ```
2. Go to **vercel.com/new**, click "Import Git Repository", select the repo.
3. Vercel auto-detects Vite. Click **Deploy**. Done in ~60 seconds.
4. Optional: in the project settings, add your custom domain (`contextive.ai`).

### Option B: Vercel CLI (fastest if you don't want git yet)

```bash
npm install -g vercel
vercel
# follow the prompts — accept all defaults
vercel --prod
```

That's it. You'll get a `*.vercel.app` URL immediately.

---

## Deploy to Netlify (alternative)

1. Run `npm run build` — produces `dist/`.
2. Drag the `dist/` folder onto **app.netlify.com/drop**.

⚠️ Netlify uses a different serverless function signature. To run the subscribe endpoint on Netlify, move `api/subscribe.ts` to `netlify/functions/subscribe.ts` and adjust the handler signature. Or just leave it as-is — the form falls back to opening Substack directly, which still works.

---

## Custom domain (contextive.ai)

After deploying:

**Vercel:** Project → Settings → Domains → Add `contextive.ai` → follow DNS instructions (point your A record to `76.76.21.21` or use Vercel nameservers).

**Netlify:** Site Settings → Domain Management → Add custom domain → follow DNS instructions.

DNS propagation takes 5 min – 1 hour.

---

## How the email signup works

The waitlist form on the Hero and the Final CTA section both POST to `/api/subscribe`.

1. The serverless function in `api/subscribe.ts` validates the email, then forwards it to Substack's free-subscription endpoint at `https://contextive.substack.com/api/v1/free`.
2. If Substack accepts → form shows "Subscription Confirmed".
3. If Substack rejects (rate-limit, bot-check) → the form opens `https://contextive.substack.com/subscribe?email=...` in a new tab so the user can complete subscription manually.
4. If the API route is missing entirely (e.g., dev mode) → same fallback. The user is never stranded.

This is intentionally redundant — for tomorrow's presentation, "the form always does something useful" matters more than perfect API hygiene.

If you want to switch to a different email tool (ConvertKit, Beehiiv, Mailchimp, Loops), edit `api/subscribe.ts` — it's ~50 lines.

---

## Editing the content

All term data and campaign copy lives in **`src/data/terms.ts`**. To add a new term file or update a campaign:

```ts
export const TERM_FILES: TermFile[] = [
  // ...
  {
    ref: '350-G',
    term: 'NEW TERM',
    domain: 'DOMAIN / TAG',
    velocity: 'SPIKING',
    // ...
  },
];
```

The Archive section will pick it up automatically. Campaign chips, pillars, and descriptions are in `CAMPAIGNS`.

Hero card rotation is set in `src/components/Hero.tsx` (`HERO_CARDS` array — pick which 5 terms cycle).

Social links: `SOCIAL_LINKS` constant in `terms.ts`.

---

## Brand system reference

| Token | Value | Use |
|---|---|---|
| `ink` | `#000000` | Primary text, key buttons |
| `paper` | `#F5F5F3` | Page background |
| `canvas` | `#FFFFFF` | Cards, alternating sections |
| `rule` | `#E5E5E1` | Subtle borders |
| `muted` | `#555555` | Secondary text |
| `whisper` | `#9A9A95` | Tertiary / metadata |

| Font | Use |
|---|---|
| Space Grotesk (display) | Headlines, term names, large numbers |
| Inter (body) | Body copy, UI text |
| JetBrains Mono | Metadata, small caps, file refs |

Visual rules: no gradients, no rounded corners, no playful elements. Intelligence-file / archival / institutional. Match the existing Substack post visuals.

---

## Tomorrow's presentation checklist

- [ ] `vercel --prod` (or push to git connected to Vercel)
- [ ] Verify the `*.vercel.app` URL loads on phone
- [ ] Test the waitlist with a real email — confirm the Substack signup arrives
- [ ] Check footer social links open correctly
- [ ] If using a custom domain, confirm DNS has propagated (`dig contextive.ai`)

That's the whole thing. Good luck with the presentation.

— Built for Victor / Contextive, April 2026
