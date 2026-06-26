# Contextive API & Selling — Status Tracker

**Living doc — the resume point for the API product + go-to-market.** Update it as work lands.
Last updated **2026-06-22**. Status: **Phase 0 shipped & live; API Phase 1 scaffold built & tested;
workstream PAUSED awaiting two manual setup steps + real waitlist demand.**

Companion docs (same folder, kept local/untracked pending a public-vs-private call):
- `CONTEXTIVE_API_PLAN.md` — the full bulletproof build plan (architecture, §-numbered).
- `CONTEXTIVE_PRICING_DISCOVERY.md` — Van-Westendorp call script to validate pricing.

---

## TL;DR — where we are
The website is a complete, honest funnel end-to-end: positioning → product page (`/waitlist`) →
combined waitlist+Substack capture. The API itself exists as a tested, read-only Phase-1 service in
its own local repo. We deliberately **paused before sinking weeks into the full service**, to let the
live waitlist gather real demand first. Two short manual steps (Victor's accounts) unlock the rest.

---

## Track A — API development

**Done**
- [x] **Build plan** written — `CONTEXTIVE_API_PLAN.md` (product, beachhead, data contract, architecture, endpoints, auth, pricing, testing, phased roadmap).
- [x] **Phase-1 service scaffold** — `contextive-api/` (its own **local git repo**, commits `4d22700` + `2a2434a`). FastAPI, **read-only**, serves a precomputed seed; never calls GDELT in the request path.
  - Endpoints: `GET /v1/health`, `GET /v1/terms/{phrase}` (unknown → honest `pending`), `GET /v1/compare?a=&b=` (the signature primitive).
  - Resolves PLAN §3.2: absolute reference-universe `velocity_percentile` (ranked by d90 across the seed) + raw `momentum` deltas; dedupes "America First" (latest reading canonical + `also_in`).
  - Honest contracts: `status` / `as_of` / `source` / `methodology_version` on every reading.
  - API-key gate (`X-API-Key`; demo `ctx_demo_key`; prod via `CONTEXTIVE_API_KEYS`), CORS (`CONTEXTIVE_CORS_ORIGINS`), `Procfile`, README deploy notes.
  - **5 passing tests** (`python -m pytest`; deps `pip install -r requirements.txt`).
- [x] **Seed** — `contextive-api/data/seed_terms.json`: the **28 unique measured terms** (29 entries) of campaigns 03–06. Regenerate: `python -X utf8 scripts/build_seed.py`.
- [x] **Live-sample wiring shipped** — the site's `/waitlist` sample becomes a real API round-trip when `VITE_CONTEXTIVE_API_URL` is set (falls back to the static measured sample otherwise). Site commit `0430461`, `src/components/SampleResponse.tsx`.

**Pending (needs Victor's accounts — can't be automated from this box; no `gh` CLI here)**
- [ ] Push `contextive-api` to a GitHub repo (private recommended).
- [ ] Deploy it (Render / Railway / Fly — `uvicorn app.main:app`, Procfile handles it; free tier fine).
- [ ] Set `VITE_CONTEXTIVE_API_URL` (+ optional `VITE_CONTEXTIVE_API_KEY`) on the **site's** Vercel project → `/waitlist` sample goes live automatically.

**Deferred to Phase 2+ (after demand)**
- [ ] Postgres + scheduled ingestion (arbitrary-term `pending → measure`).
- [ ] History endpoint; webhooks/alerts (inflection, threshold, stage-change).
- [ ] Stripe self-serve billing on the live tiers; golden / contract / reproducibility test suites.

---

## Track B — Selling / go-to-market

**Done & live**
- [x] **Positioning realigned** to the honest product — neutral "velocity, not verdict" across politics, the economy, AI, culture (dropped the finance over-claim). Hero + Footer + all metadata.
- [x] **SEO / disambiguation** — accurate meta + `<link rel=canonical>` + JSON-LD (Organization/WebSite + `sameAs`) to separate us from the other "Contextive"s; OG share card (`public/og-image.png`).
- [x] **`/waitlist` product page — REDESIGNED** (commit `774bd70`) around an interactive **Signal Explorer**: click a measured term → the card animates (velocity bar, momentum sparkline whose direction tracks the real 90d move, deltas, tone, co-occurrence, inflection); toggle **Compare** for a head-to-head (the `compare()` primitive, e.g. obliterated vs ceasefire). Real measured data via `scripts/build-api-demo.mjs` → `src/data/apiDemo.ts` (28 terms, 8 featured). Cleaner flow: hero → explorer → who-it's-for → tracked terms → pricing → firewall + CTA (dropped the redundant "what you get" grid; removed `SampleResponse`, its live-API round-trip now lives in the explorer's JSON view). "API" nav link; animated API teaser on the homepage. Mobile-audited 375px; interactivity + clean console verified.
- [x] **Combined capture** — one email submit records to our list (tagged by `source`) **and** subscribes via Substack (`WaitlistForm`).
- [x] **Pricing (live, lower-end-to-learn):** Free **$0** / Starter **$39** / Pro **$149** / Enterprise **custom (from $999)**; two-axis (tier quota + metered overage). Benchmarked vs Exploding Topics / Brand24 / NewsAPI.ai.
- [x] **Beachhead chosen:** comms / PR / public-affairs **+** brand / trend intelligence. (Finance = later, separate tier; not the front door.)

**Pending**
- [ ] **Durable signup capture** — until wired, signups sit only in ephemeral Vercel logs. Create a Google Sheet, deploy `contextive-site/scripts/subscribe-sheet.gs` as a web app, set `SUBSCRIBE_WEBHOOK_URL` in Vercel, redeploy. Steps: `contextive-site/scripts/SUBSCRIBE_SETUP.md`. *(Most urgent — we're driving traffic to the waitlist.)*
- [ ] **Validate pricing** — run `CONTEXTIVE_PRICING_DISCOVERY.md` with 6–10 beachhead prospects before treating $39/$149 as settled.

---

## Live URLs & commits
- Site: **contextive.info** (Vercel project `contextive-site-test`, auto-deploys `main`). Latest deploy commit `0430461`, READY.
- Commits on `contextive-site`: `892cf78` (positioning + `/waitlist` + SEO + OG + nav), `0c10cd7` (durable-capture hardening), `0430461` (live-sample wiring), `774bd70` (`/waitlist` redesign — interactive Signal Explorer).
- API repo (local, not yet on GitHub): `contextive-api/` — `4d22700` (scaffold), `2a2434a` (README env-var note).

## To resume (in order)
1. **Victor, ~5 min each:** wire durable signups (Sheet + `SUBSCRIBE_WEBHOOK_URL`); push + deploy `contextive-api`, then set `VITE_CONTEXTIVE_API_URL` on the site.
2. Let the waitlist gather signups; run the discovery calls (Track B pending).
3. Build **API Phase 2** (Postgres + ingestion + Stripe + tests) once demand justifies it.

## Open decisions
- `CONTEXTIVE_API_PLAN.md` + `CONTEXTIVE_PRICING_DISCOVERY.md` (+ this doc): public repo, private repo, or local-only?
- X handle still `@contextive_ai` — leave or rebrand to match `.info`?
- A pre-existing uncommitted edit to `CONTEXTIVE_CLAUDE_CODE_HANDOFF.md` in the site repo — commit or discard?
