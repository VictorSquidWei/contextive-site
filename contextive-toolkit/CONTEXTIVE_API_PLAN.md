# Contextive API — Build Plan (v0.1)

**Status:** planning · **Owner:** Victor · drafted with Claude Code, 2026-06-22
**Goal:** turn the measured signal layer into a sellable, *bulletproof* API. Narrow and perfect first; broad later.

> **Brand:** market as **Contextive** (the word — no `.ai` / `.info` suffix). The canonical site address is
> `contextive.info` (the owned domain); `contextive.ai` is owned by a third party and must never appear as
> our URL or brand.

> This plan inherits the brand non-negotiables (measure-don't-estimate, the firewall, no named person,
> honest bounds). For the API those rules stop being editorial guidance and become **engineering
> requirements** — see §3.

---

## 0. The one decision that shapes everything

We sell **derived narrative-momentum metrics from the open news/media record (GDELT DOC 2.0)** —
not raw data, not trading alpha, not a social firehose. Honesty *is* the product. Every choice below
serves a single mandate: **the numbers are real, reproducible, and honestly bounded.** That mandate
is simultaneously our moat (nobody else packages a defensible velocity signal) and our single largest
risk (one fabricated or silently-revised number burns the brand).

## 1. What the API sells

- **Atomic unit = the tracked term** (a phrase under measurement). This is also the **billing unit** —
  legible to customers: *you pay for how many phrases you watch + how much you query.*
- **The signal, per term:** momentum (velocity), dated inflection points, adoption stage, sentiment,
  co-occurrence, coverage/corpus density — each labelled `measured` vs `pending`, each stamped with
  as-of date, source, and methodology version.
- **Signature primitive — `compare(A, B)`:** the defining-tension head-to-head (`obliterated` vs
  `ceasefire`). Differentiated and demoable; nobody else ships it cleanly. Our campaigns already prove it.

## 2. Customers — beachhead first

| Segment | Fit | WTP | Role |
|---|---|---|---|
| Comms / PR / public-affairs teams + agencies | ★★★ | Med–High | **Beachhead.** "Is our framing winning vs theirs?" = `compare()`. Neutral, recurring, re-billable. |
| Brand / trend / cultural intelligence | ★★★ | Med | **Beachhead.** The adoption-stage field is a niche→mainstream trend signal. |
| Newsrooms / media-monitoring | ★★ | Low–Med | Credibility + backlinks → also fixes the brand-name collision. |
| Think tanks / comms researchers / academics | ★★ | Low | Credibility, grant budgets. |
| Hedge funds / event-driven / macro | ★ | Highest | **Later, separate tier only.** Worst fit now: commoditized, needs finance-grade infra, pulls the brand off neutral. |

The API audience and the public brand are **separable**: we can serve a finance buyer later through the
same neutral signal without the homepage ever claiming to be a trading terminal.

## 3. The data contract — where "bulletproof" is won or lost

### 3.1 Honest labeling, as schema
Every metric is an object, never a bare number:
```
{ "value": 100, "status": "measured", "as_of": "2026-06-21",
  "source": "gdelt-doc-2.0", "methodology_version": "1.0", "coverage": 0.83 }
```
`status ∈ measured | pending | insufficient_data`. **"Pending, not guessed" becomes a literal API state**,
not a marketing line. No field is ever fabricated; editorial fields (platforms, co-occurrence) are flagged
`source: "editorial"` distinct from `gdelt`.

### 3.2 The velocity-index relativity problem — **must-fix before v1**
Today `velocity_index` is a **within-set percentile** — only meaningful inside a campaign's 17-term set.
An API answering arbitrary single-term queries has no "set," so the current index **cannot be exposed
as-is.** Fix:
- **Primary metric = absolute & reproducible:** 30-day mean coverage ÷ 90-day baseline (the raw ratio the
  percentile is derived from), normalized, plus the underlying `d90` / `yoy` % changes. Deterministic given
  `(data, ref_date)`.
- **Secondary = within-universe percentile** against a **fixed, published reference universe** (a standing
  basket of terms), so "velocity 100" means something stable over time — not "highest among whatever you
  happened to query."
- Never ship a relative number dressed as an absolute. This is *the* core schema decision.
- **Resolved + implemented** (`contextive-api/app/store.py`): the API returns `velocity_percentile`
  (rank of the term's 90-day momentum within the **fixed seed universe**) as the headline 0–100, the
  raw `momentum` deltas (absolute, reproducible), and the original within-campaign index relabelled
  `campaign_velocity_index`. Duplicate terms (e.g. *America First*, measured in C04 + C06) resolve to
  the most recently retrieved reading; the others surface in `also_measured_in`.

### 3.3 Point-in-time reproducibility
Same `(term, ref_date, methodology_version)` ⇒ identical answer, forever. We snapshot measurements and
**never silently revise history.** Customers can pin `ref_date` and `methodology_version`.

### 3.4 Methodology versioning
`methodology_version` on every response + a public changelog. On a formula change we recompute or freeze;
customers pin a version. `/how-it-works` is the human-readable companion.

## 4. Architecture — decouple the API from GDELT

GDELT rate-limits (~1 req / 5s + long cooldowns) and is occasionally flaky. **The API must never call
GDELT synchronously per request.**

```
  GDELT ──(throttled, retrying)──▶ Ingestion workers ──▶  OUR STORE  ──▶  API service  ──▶ customer
         (signal_pipeline.py,        (scheduled cron)     (terms, daily      (reads store
          productionized)                                  series, snapshots)  only — fast)
```

- **Ingestion workers:** the existing `signal_pipeline.py`, productionized — scheduled, throttled, retry +
  backfill — writing measurements and smoothed series into our store. Honors each term's `ref_date`.
- **Store:** terms · daily coverage/tone series · point-in-time measurement snapshots · reference universes.
- **API service:** reads **only** from the store → sub-100ms, reliable, independent of GDELT's health.
- **Pending path:** a queried term not yet in the universe → returns `status: pending`, enqueues it for
  measurement, notifies when ready. Reliability and brand-honesty in one move.
- **Hosting (DECIDED — Victor, 2026-06-22): a dedicated FastAPI service from day one.** The pipeline is
  already Python, so FastAPI keeps one language across ingestion + serving. Shape: a FastAPI app (the API
  layer) + scheduled ingestion workers (the productionized pipeline) + **Postgres** (terms · daily
  coverage/tone series · point-in-time snapshots · reference universes; add a time-series extension/table as
  volume grows). The marketing site stays on Vercel and calls the FastAPI service; the existing
  `/api/subscribe` Vercel function continues to handle the Phase-0 waitlist.

## 5. Endpoints (v1)

| Method | Path | Returns |
|---|---|---|
| GET | `/v1/terms/{phrase}` | current signal card (the seven fields, each labelled) |
| GET | `/v1/terms/{phrase}/history?from=&to=` | smoothed coverage series + dated inflection points |
| GET | `/v1/compare?a=&b=` | head-to-head velocity — the signature primitive |
| POST | `/v1/watch` *(Phase 3)* | register term(s) for continuous monitoring |
| — | webhooks *(Phase 3)* | `inflection` · `velocity_threshold` · `stage_change` |

All: versioned `/v1/`, ISO-8601 timestamps, explicit units, `status` on every metric, `X-RateLimit-*` headers.

## 6. Auth, limits, billing integrity

- **API keys** per account; scopes; rotation; revocation.
- **Quota + rate limit** enforced at the gateway; clear `429` + `X-RateLimit-Remaining/Reset` headers.
- **Stripe:** subscription tier + metered overage; **idempotency keys** on every usage event; daily usage
  reconciliation; no double-count; graceful degradation when quota is hit (serve cached, flag overage).

## 7. Pricing → enforcement mapping

| Tier | Audience | Enforced by |
|---|---|---|
| Free / Dev | students, journalists, devs | few lookups/day · 1–2 watches · no alerts · **doubles as the disambiguation flywheel** (cites/links our Contextive) |
| Starter (self-serve) | solo analysts, small shops | N watches · M calls/mo · daily refresh · email alerts |
| Pro (self-serve) | comms / trend teams | more watches+calls · webhooks · full history · `compare` · export |
| Enterprise / data license (annual) | agencies, brands | bulk + historical backfill · SLA · watchlist dashboards |

**Launch pricing (v1 — live, lower-end-to-learn; Victor, 2026-06-22).** Benchmarked to comparables surveyed
this day — trend intelligence *Exploding Topics* ($39 / $99 / $249/mo, API at the top tier), self-serve
monitoring *Brand24* ($199 → $999/mo), usage-metered *NewsAPI.ai* (tokens). Victor's call: **ship at the lower
end now and watch how it converts**, rather than gate on discovery calls. Four public tiers:

| Tier | Price / mo | Included |
|---|---|---|
| Free / Dev | **$0** | ~25 lookups/day · 2 watches · attribution required (the disambiguation flywheel) |
| Starter | **$39** | 10 watches · 5k calls/mo · daily refresh · email alerts |
| Pro | **$149** | 50 watches · 50k calls/mo · webhooks · full history · `compare` · export |
| Enterprise / data license | **custom (from $999)** | bulk + historical backfill · SLA · watchlist dashboards · annual |

**Two-axis billing:** the tier sets included quota (watches + calls + features); usage beyond it is **metered
per call** (a credit model like NewsAPI.ai), via Stripe. These are **deliberately lower-end launch numbers** —
priced to win the first cohort, then revisit on real conversion data. *Measure, don't estimate* — including on
whether the price is right.

## 8. Testing / QA — what "bulletproof" actually requires

- **Golden-term regression set** — known historical curves; catch silent drift in the pipeline.
- **Schema contract tests** — the data contract must not break customers across deploys.
- **Reproducibility tests** — same `(query, ref_date, version)` ⇒ identical bytes.
- **GDELT-outage simulation** — API stays up serving cache; ingestion degrades to `pending`, never to a guess.
- **Load tests** — p99 latency from the store; quota enforcement under burst.

## 9. Legal / abuse

- **GDELT DOC 2.0** is free/open; we serve **derived metrics, not raw redistribution** → defensible.
  Confirm attribution terms.
- **No PII:** we track public phrases, not people — the API analogue of "no named person in a critical sentence."
- ToS + acceptable-use; rate-limit + key revocation for abuse.

## 10. Phased roadmap — narrow & perfect, then broad

- **Phase 0 — now:** waitlist page + this plan + define the curated reference universe. Capture beachhead demand.
- **Phase 1 — MVP (read-only, perfect):** `/v1/terms/{phrase}` + `/v1/compare` over a **curated universe —
  the 28 measured terms of campaigns 03–06** (no pending, no legacy 01–02; see §11.3), precomputed store, API
  keys + simple quotas, a docs page, and the golden/contract/reproducibility tests. No arbitrary ingestion, no
  webhooks, no metering yet. *Perfect and narrow beats broad and flaky.*
  **Status (2026-06-22): scaffolded & green** — `contextive-api/` (FastAPI): `/v1/health` +
  `/v1/terms/{phrase}` + `/v1/compare`, API-key gate, the §3.2 normalization, honest `pending`, seed
  generated from the site's campaign JSON (`scripts/build_seed.py`), **5/5 tests passing**. Remaining
  for GA: golden/reproducibility suite, rate-limit + quota enforcement, hosted docs page.
- **Phase 2 — self-serve + breadth:** arbitrary-term `pending→measure` path, history endpoint, Stripe
  self-serve tiers, and the **dashboard** (the concrete artifact + the API on-ramp).
- **Phase 3 — monitoring:** watchlists, webhooks/alerts, enterprise data-license + backfill, SLAs.
- **Later — finance segment:** only behind a separate finance-grade tier (point-in-time, lower latency,
  entity mapping). Never repositions the public brand.

## 11. Open decisions (for Victor)

1. **Pricing dollars** — **LIVE lower-end** (§7): Free $0 / Starter $39 / Pro $149 / Enterprise custom.
   Victor's call: ship low, watch conversion, revisit on real data (not gated on discovery calls). *(closed-for-launch)*
2. **Hosting/store** — **DECIDED: dedicated FastAPI + Postgres from day one** (§4). *(closed)*
3. **MVP universe** — **DECIDED (Victor, 2026-06-22): the measured terms of campaigns 03–06 only** — no
   pending, no legacy 01–02. **29 measured entries / 28 unique** ("America First" spans C04+C06):
   *C03* seed oils · chronic disease epidemic · evidence-based · weight management · food noise · body
   neutrality; *C04* MAGA Warrior · America First · endorsement machine · open seat · battleground;
   *C05* vibecession · greedflation · junk fees · price gouging · affordability · soft landing · higher for
   longer · real wages · are you better off; *C06* boots on the ground · regime change · obliterated ·
   ceasefire · de-escalation · breakout · peace through strength · mission accomplished. Everything else
   returns `pending` + enqueue. *(closed)*
4. **Waitlist page** — **DONE (Phase 0):** combined waitlist + Substack capture at `/waitlist`. *(closed)*
5. **og:image** — **DONE:** on-brand monochrome share card generated + wired. *(closed)*

---

*The campaigns are the API's marketing: each brief is a live demo of the exact signal the API returns.
Publication → "available as an API" → free tier → paid is one funnel — and it answers the "prove the
output" critique for free.*
