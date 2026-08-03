# Contextive — Claude Code Handoff (v12)

**Owner:** Victor · **Live site:** contextive.info · **Repo:** `github.com/VictorSquidWei/contextive-site` (currently **public**)

Standing orientation for a fresh session. Read the **Resume here** block first; everything below it
is durable context. Keep the non-negotiables and the firewall verbatim.

> Note on dating: session clocks have drifted from the stamped dates before (a prior session's clock
> read 2026-06-24 vs docs stamped 2026-06-22). Treat **commit hashes** as the source of truth, not
> dates.

> **This handoff has ONE canonical copy:** `contextive-site/contextive-toolkit/CONTEXTIVE_CLAUDE_CODE_HANDOFF.md`.
> Both `CLAUDE.md` files (the canonical `contextive-site/CLAUDE.md` and the parent-root mirror) *import*
> it by that path — there is **no** parent-root copy of this doc to keep in sync. (Only `CLAUDE.md` and
> `.claude/` are mirrored to the parent root; the toolkit + handoff live under `contextive-site/`.)

---

## Resume here — current state

**This session was almost entirely SITE / UX / MARKETING / SECURITY work — NO new campaign measurement.**
All ten campaigns (01–10) were already MEASURED + LIVE (v11). This session made the site legible to
**everyday readers**, clarified the waitlist as an **API early-access** capture, **wired durable signup
capture end-to-end (verified live)**, and did a **pre-ads security + resilience hardening** pass — then
prepped the marketing/ads launch. Several pushes landed on `main`; **HEAD reported at `2fa788e`**
(commit hashes below are orchestrator-reported, but each change is verified present in the working tree):

- **`93a4b1a`** — campaign pages **redesigned for everyday readers** (hero tension duel + plain-language
  leaderboard + cluster filter tabs; jargon demoted to an opt-in `/readout` page).
- **`81ebc33`, `dde9fd8`** — plain-English **reader hooks** + a consolidated **animated homepage index**.
- **`306c71a`, `caffdda`, `0fd9f48`** — hook/caption fixes (C10 = Victor's Option B; C05 caption honesty
  fix; C07/08/09 hero duels pointed at real measured terms).
- **`3793808`** — the waitlist is now clearly an **API early-access** capture (no forced Substack dump).
- **Signup capture — WIRED + VERIFIED LIVE (Gate-0 CLOSED).** Victor deployed the Apps Script web app and
  set `SUBSCRIBE_WEBHOOK_URL` (Production) in Vercel; end-to-end verified (`stored:true`, source-tagged).
- **`2fa788e`** — **pre-ads security + resilience hardening** (two audit agents, nothing critical). CSP
  **flipped Report-Only → ENFORCING** (verified zero violations live).

**Nothing is STAGED for the site** — the toolkit and the site are in sync. Open work is **doc/graphics +
marketing launch + polish** (no site push pending): Victor's editorial passes on the warm Courtney docs
(C07/C08/C10), the C09/C10 carousel graphics, and the marketing/ads launch (Courtney is building the ad
posts now). The API + selling workstream is still **PAUSED** (folded in below), but its most urgent open
step — durable signup capture — is now **DONE**.

> **What's LIVE (read this before touching the site):** ALL of **C01–C10** are LIVE + measured on
> contextive.info at `2fa788e`, now rendered through the **reader-facing redesign** (hero duel +
> leaderboard + `/readout`). Measured/pending split per campaign (verified in `src/data/campaigns/*.json`):
> C01 16/17, C02 13/17, C03 17/17, C04 15/17, C05 17/17, C06 17/17, C07 17/17, C08 17/17, C09 17/17,
> C10 12/17. **No new measurement this session** — the numbers are unchanged from v11; only the
> presentation changed. **CSP is now ENFORCED** (was Report-Only), verified live.

> **BigQuery costs real money (billing is on Victor's `contextive-signal` project) — and it silently
> DETACHED once (a prior session).** No scan ran this session (no measurement work), so **$0 BigQuery
> spend this session.** Standing discipline: **check billing is attached to `contextive-signal` before any
> scan** — it detached once and fell back to the 1 TiB free tier. Web NGrams scans are billed on-demand at
> ~$6.25/TiB and are **window-bound, not term-bound** — a 180-day scan is ≈7.4 TiB ≈ ~$44 regardless of how
> many terms ride it (a 400-day scan is ≈15.9 TiB ≈ ~$99; figures orchestrator-reported). So **180 days is
> the standard window** (extend only when a yoy read is worth the cost), and **every scan is a deliberate,
> byte-capped, cost-logged run** — combine campaigns/terms into ONE scan, and the mandatory dry-run byte
> cap must clear before any billed query. GCP key: `C:\Users\WEI\.contextive\contextive-gcp-key.json`.

### The reader-facing site redesign — everyday-reader legibility (the headline this session)
The campaign section was rebuilt so a general audience gets the story at a glance; the analyst dossier
moved to an opt-in page. All numbers still come from the measured campaign data — the redesign is a
**translation layer on already-measured math, never new estimation** (pending terms carry NO number
anywhere). Verified present in the working tree:
- **Per-campaign pages cut light (`93a4b1a`):** trimmed header, a hero **defining-tension duel** (reads the
  two poles' measured momentum), a plain-language **leaderboard** (`src/components/TermLeaderboard.tsx`)
  ranking the 17 terms with momentum **chips** (Surging / Rising / Steady / Cooling / Fading), cluster
  **filter tabs**, and the jargon (velocity index / density / inflections) demoted to an opt-in
  **`/campaigns/:id/readout`** page (`CampaignReadout.tsx`, full dossier + thesis + tensions; route wired
  in `App.tsx`).
- **The translation layer (`src/lib/readSignal.ts`, new):** `plainRead()` maps the measured 90d momentum
  (falls back to 30d, then to the within-set velocity rank with a conservative non-extreme read) to a
  deterministic chip + blurb — thresholds ±25 / ±8. `pending` status → "Pending", no number. `humanPct`,
  `leaderboardSort`, `tensionCaption` (derives the hero duel sentence from the two poles' reads). Nothing
  is invented; the words are a legible label on the math.
- **Reader hooks + homepage index (`81ebc33`, `dde9fd8`):** `src/data/readerHooks.ts` (new) holds one
  number-free `READER_HOOKS` line per campaign (from Courtney's messaging pass — her social NUMBERS were
  stale, so **only her qualitative framing was used**, re-anchored), plus `HERO_CAPTIONS` (sharper hand
  lines for C10/C09/C05) and `FEATURED_CAMPAIGN_IDS = ['10-power','05-economy','03-bodies-and-food']`.
  `CampaignIndex.tsx` redesigned "modern + animated": staggered scroll-reveal (`.ci-item`),
  measured-progress bars, hover lift + arrow (all **motion-safe**), featured trio + leaderboard rows.
  Header: "Same event, different words. Which one is winning?".
- **Hook/caption honesty fixes (`306c71a`, `caffdda`, `0fd9f48`):** C10 hook = **Victor's Option B** —
  "The AI power boom's loudest fight is over who pays for it." (pre-pub flagged the "you, or Big Tech?"
  version as populist). C05 caption fixed to "took off / never did" (the old "surging" contradicted the
  measured 90d "Steady" chip). C07/C08/C09 hero duels were pointed at real measured term pairs. **All 10
  hero duels now resolve to real measured term pairs.**

### The waitlist = API early-access capture (`3793808`)
`WaitlistForm.tsx` gained an **`apiWaitlist`** mode: captures the email + confirms "we'll email you when
early access opens" with **NO Substack redirect** (Substack demoted to an optional link). Applied to the
Hero ("Get early access") + both `/waitlist` forms ("Join the API waitlist"). `FinalCTA` stays the free
newsletter / Substack CTA. This fixed the "signup unclear + dumps to Substack" confusion. (Verified:
`apiWaitlist` prop present in `WaitlistForm.tsx`.)

### Signup capture — WIRED + VERIFIED LIVE (Gate-0 DONE)
The long-standing "durable signup capture" open thread is **CLOSED**. Victor deployed the Google Apps
Script web app (`scripts/subscribe-sheet.gs`, steps in `scripts/SUBSCRIBE_SETUP.md`) and set
`SUBSCRIBE_WEBHOOK_URL` (Production) in Vercel + redeployed. Verified end-to-end: the form + a direct POST
return `stored:true`, runtime logs show the `[subscribe]` line, source-tagged (hero / api-waitlist / …).
`api/subscribe.ts` now records to OUR list only — the server-side Substack forward was **removed** (see
security below). **Open cleanup:** delete the 4 test rows from the signup Sheet (all `@example.com`:
`capture-test-delete@`, `waitlist-form-test-delete@`, `prod-apimode-verify-delete@`, `hardening-verify-delete@`).

### Pre-ads security + resilience hardening (`2fa788e`, verified on prod)
Two audit agents swept the site before ads drive traffic to it — **NOTHING CRITICAL.** Fixes (all verified
in the working tree):
- **Dropped the server-side Substack forward** in `api/subscribe.ts` — it was an email-amplification abuse
  vector on the public POST (the server could be made to POST arbitrary emails to Substack). The newsletter
  subscribe now happens **client-side only** (the CTA opens Substack in the browser).
- **Honeypot field + best-effort in-memory per-IP throttle (8/min)** on `api/subscribe.ts` (a durable
  limit still needs Vercel KV — see open threads).
- **CSP flipped Report-Only → ENFORCING** in `vercel.json` (verified zero violations live; fonts / render /
  form intact). The header key is now `Content-Security-Policy` (not `…-Report-Only`).
- **Deleted stale `netlify.toml`**; **crash-proofed `Hero.tsx`** legacy `terms.ts` lookups
  (`filter(Boolean)` + guard — was a homepage white-screen risk); added a top-level **`ErrorBoundary.tsx`**
  (wired in `main.tsx`).

### Marketing / ads — about to launch
- **growth-analyst plan:** `E:\Contextive\08 Misc\files\contextive-toolkit\contextive-toolkit\data\Contextive_Marketing_Ads_Plan.md`
  — organic-first, then a **small Reddit paid test on the C10 hook**, metric = **cost / signup**.
- **Two Courtney task docs delivered + handed off** (same `data/` folder): `Courtney_Task_Organic_Launch_Kit.md`
  (she DELIVERED the posts — numbers correct this time; the fix was giving her exact live numbers) and
  `Courtney_Task_Waitlist_Ads.md` (3 paid-ready X + IG ad concepts driving to `/waitlist`, paste-ready
  links). **Courtney is building the ad posts now.**

### C10 launch + C01/C02 modernization — all 10 campaigns measured + live (durable, from v11)
`7ba085a` (prior session) closed the last gap: the legacy editorial path no longer backs any campaign page.
- **C10 "The Language of Power" — LIVE at `/campaigns/10-power`, 12/17 measured.** Electricity /
  AI-data-center vocabulary war. **Spine (measured): "cost allocation vs energy dominance: velocity vs
  verdict"** — **cost allocation v100** (+66%/90d) vs **energy dominance v9** (flat): the who-pays rate-case
  machinery outruns the buildout banner (loudest ≠ winning). **5 pending** (rate shock, subsidizing Big
  Tech, energy burden, data center tariff, energy emergency — below the news-body-text noise floor →
  `pending`, not guessed). Anchor macro-facts softened to **attributed** form per pre-pub.
- **C01 → "The Language of the Trade War" — LIVE at `/campaigns/01-trade-war`, 16/17 measured.** **Spine
  REVERSED under measurement:** **export controls v87** (+40.4%/90d) vs **trade war v13** (−29.9%) — both
  tariff-naming poles cool while the supply-chain-realignment lexicon leads (**friend-shoring v100**,
  **supply chain resilience v93**). 1 pending (fair trade).
- **C02 → "The Language of AI and Work" — LIVE at `/campaigns/02-ai-and-work`, 13/17 measured.** **Spine:
  "replaced by AI vs efficiency gains"** — **replaced by AI v50** (+38%/90d) vs **efficiency gains v0**
  (−17%): the soft euphemisms fade from both ends while the capability register is loud (**restructuring
  v100**, **AI adoption v92**). 4 pending (quiet cutting, white-collar recession, promptwashing, doing more
  with less). "hype" framing neutralized to "capability-and-claims" per pre-pub.
- **How they moved off legacy (verified in `index.ts`):** `index.ts` imports `c01`/`c02`/`c10` and lists
  all of c01–c10 in `measuredCampaigns`; `legacyCampaigns()` drops 01 + 02 so measured pages supersede
  them. **`terms.ts` / `legacy.ts` were left physically untouched** and are still **imported by
  Hero / Footer / Nav / HowItWorks / WaitlistForm / DossierCard** (verified) — so the stale data must be
  **pruned carefully** (Hero is now crash-proofed but still reads `TERM_FILES`); the homepage
  `TICKER_TERMS` still cites a few geopolitics words.
- **Courtney + briefs (orchestrator-reported):** warm `Contextive_Campaign_10_Week02_Courtney.docx` +
  carousel spec `campaign10_graphics.json` + brief `Contextive_Campaign_10_Brief.docx`; C01/C02 briefs
  built. **Open:** Victor's editorial pass on the C10 Courtney doc + build the C10 carousel graphics.

### C03 / C04 / C05 / C06 — full-text data LIVE (durable, from v11)
`5b9d8e1` (prior session) promoted the staged full-text re-bases. On contextive.info now:
- **C06 "obliterated vs ceasefire" — LIVE 17/17, CONFIRMED** (obliterated **v0** / −22%/90d vs ceasefire
  **v94** / +455%/90d; loudest term overall is **warmonger v100**, the intra-coalition epithet).
- **C05 "soft landing vs vibecession" — LIVE 17/17, CONFIRMED** (vibecession **v100** / +572%/30d vs soft
  landing **v19** / −27%/90d; tariff tax collapsed to v0).
- **C03 "chronic disease epidemic vs food as medicine" — LIVE 17/17** (chronic disease epidemic **v100** vs
  food as medicine **v0**; Big Food v6 collapsed — wins on the diagnosis, loses on the cure).
- **C04 (primaries) — LIVE 15/17, canonical now webngrams.** MAGA Warrior (+599%/30d) and primary
  challenger (+155%) are REAL surges (full-text catches what DOC undercounted ~3×); `endorsement machine`
  and `fight back` / `democracy in danger` came back sparse → shipped **`pending`, not guessed** (2 pending
  in `04.json`). The re-rank was arithmetic (`_assign_velocity_index`), **no billed query, $0**.

Each was measured **as-of its own moment** (`--ref-date` C03 `2026-05-04`, C04 `2026-05-25`, C05
`2026-06-09`, C06 `2026-06-21`; 180-day window). Toolkit `campaign0X_cards.json` are webngrams-canonical
(C04–C06 keep pre-migration DOC sets as `campaign0X_cards.pre-webngrams-backup.json`; C03 had no prior
toolkit cards — its first measured set).

### The resilient multi-source pipeline — **built + in production** (durable)
DOC 2.0 stayed throttled (persistent HTTP 429, confirmed across four network exits — not our IP), so the
fix was to stop depending on it. `signal_pipeline.py` (toolkit copy at `08 Misc/.../pipeline/`) takes
**`--source {doc,bigquery,gkg-raw,wikipedia,webngrams}`** and adds:
- **`build_from_webngrams` + `build_from_bigquery`** — the coverage measure reads **GDELT Web News NGrams
  3.0** (`gdelt-bq.gdeltv2.webngrams`), a **full-text / body-text** channel, non-throttled. The standing
  replacement for the DOC single point of failure.
- **An in-code instrument firewall** — `_assign_velocity_index` (pipeline), the API's
  `_assign_velocity_percentile` (`store.py`), and `merge_never_regress` each **refuse to rank across
  instruments** (raise `ValueError`): a percentile set holds exactly ONE instrument. News **coverage**
  (`gdelt-coverage`) and reader **attention** (`wikipedia-attention`) are never mixed into one velocity.
- **Provenance on every reading** — `source` / `source_channel` / `instrument` / `methodology_version`
  (measured cards stamp `gdelt-webngrams` / `gdelt-coverage` / `gdelt-webngrams-fulltext-v1`; legacy cards
  normalize to `gdelt-doc` / `gdelt-coverage` / `1.0`). Schema `term_cards.schema.json` gained the
  provenance fields + a `measurement.attention` sibling block.
- **A mandatory dry-run byte cap** before any billed BigQuery query, and a **calibration harness**
  (`--calibrate-from`).
- **A Wikipedia-pageviews attention lens** (`build_from_wikipedia`, instrument `wikipedia-attention`, its
  own `attention_velocity_index`, emitted only into `measurement.attention`) — a **separate labeled signal**,
  **never** folded into GDELT velocity.
- **contextive-api `store.py`** percentiles **per-instrument** (pytest **7/7** — orchestrator-reported).

**Calibration result (orchestrator-reported):** **GKG (title/theme) FAILED 0/8 — it lacks body text — so
it is NOT used.** **Web NGrams (full-text) PASSED.** The `_WEBNGRAMS_OVERRIDES` table (~84 entries) holds
variants / context / exclusions that restore recall + precision. The overrides machinery + instrument
firewall + byte cap are verified present in code; calibration counts and byte/cost figures are runtime
facts from the orchestrator.

> **Note on C04's "failed" calibration (do not misread it):** full-text calibration against DOC "fails"
> 0/3 for C04 **because DOC was undercounting, not because Web NGrams is hot.** Full-text catches the real
> surge; the DOC series it's checked against is the low one.

### Campaign 09 — "The Language of the Real" — **LIVE, measured 17/17** (durable)
AI-authenticity / "slop" vocabulary war. Live at `/campaigns/09-real`. Web NGrams full-text, 180d, ref
2026-07-10. **Spine (CONFIRMED): "slop vs synthetic: velocity vs verdict"** — the epithet plateaus
(**AI slop v50**, −0.7%/90d; **clanker v0**, −66%/90d) while the applied vocabulary gains (**AI-assisted
v94**; **workslop v100** +56%/30d, the fastest mover; **proof of personhood v81**; **made by humans**).
Warm Courtney Week-02 doc WRITTEN. **Open:** Victor's editorial pass + build the C09 carousel graphics.

### Campaign 08 — "The Language of Abundance" — **LIVE, measured 17/17** (durable)
Re-measured on Web NGrams full-text (180d, ref 2026-06-29); abundance-vs-scarcity spine CONFIRMED (build-
more banner cooling while scarcity counter-vocabulary gains). abundance agenda **v38** (−26.8%/90d);
scarcity gaining (degrowth, supply skepticism, polycrisis); **YIMBY v81** the lone build-side climber.
**Note:** `08.json` carries a **hand-fixed `definingTension`** (a="Abundance", b="scarcity: velocity vs
verdict") — **re-apply if `build-campaign.mjs` is re-run.** **Open:** Victor's editorial pass on the warm
C08 doc + refresh the number-bearing carousel slides before Courtney builds.

### Campaign 07 — "The Language of Money" — **LIVE, measured 17/17** (durable)
Re-baselined onto Web NGrams full-text (400d, ref 2026-06-25). **Spine HOLDS: "debasement trade: velocity
vs verdict"** — **debasement trade v100** (+622.7%/30d but −74.0%/90d): the loudest word loud because it's
dying. **hard money honestly corrected AGAIN: DOC +88.6%/90d → full-text +44.7%/90d** (v94). C07 also
powers the Signal Explorer + `/signal`. **Open:** Victor's editorial pass before Courtney publishes.

> **Firewall FLAG — fix the C07 brief docx (STILL OPEN).** The C07 **brief DOCX** uses a money-domain
> firewall variant ("…claim about money"); the **live site firewall is canonical** (converter-hardcoded,
> verified). Correct the C07 docx to the verbatim canonical "…underlying **politics** is correct" string
> for full non-negotiable-#2 compliance. (Orchestrator-reported; not re-opened from the binary.)

### The old DOC auto-retry — **OBSOLETE**
The Windows scheduled task **"Contextive C07 GDELT Retry"** (`retry_c07_measure.py`, every 4h) is dead
weight. **It can be unregistered** (not confirmed done):
`Unregister-ScheduledTask -TaskName "Contextive C07 GDELT Retry" -Confirm:$false`.

### The product layer (shipped earlier; durable)
- **Velocity Card** — the signature shareable primitive (1080×1080 monochrome card per measured term). ONE
  shared renderer **`src/lib/velocityCard.js`** powers both the static generator
  (`scripts/build-velocity-cards.mjs`) and the browser, so they never drift.
- **Card Studio** (`src/components/CardStudio.tsx`) — on `/waitlist`, customize a card's background + share.
- **Per-term pages** — **`/signal/:slug`** (`SignalPage.tsx`): card + Studio + measured readout + per-term
  SEO meta; unknown slug → honest "measurement pending". *Caveat:* meta is client-set (build-time prerender
  deferred).
- **Signal Explorer redesign** (`762c61d`) — Explore mode is a share-first **Stage**.

### QA + security consolidation (durable) — site audited + hardened
Two prior QA sweeps (4 auditors × 7 routes × 6 widths + dark mode; `ddb7185`, `9ab5af7`, `d779e2d`) shipped
CSP + HSTS + Permissions-Policy headers, `api/subscribe` CORS lock + 2 KB body cap, velocityCard hardening,
WCAG-AA contrast, `:focus-visible`, reduced-motion, aria fixes, 6 dead components deleted. **This session's
pre-ads pass (`2fa788e`) added:** dropped the server-side Substack forward, honeypot + in-memory per-IP
throttle (8/min), **CSP flipped Report-Only → ENFORCING** (verified live), deleted `netlify.toml`,
crash-proofed `Hero.tsx`, added a top-level `ErrorBoundary`. **Deferred:** durable per-IP rate-limit +
captcha on subscribe (needs **Vercel KV** — Victor's account); code-split (JS bundle ~737 kB —
orchestrator-reported); `npm audit` (postcss/babel dev-only; bump react-router-dom for GHSA-qwww — not
exploitable on a pure client SPA); optional shared-secret on the Apps Script webhook.

### Competitor intelligence — Ground News (durable)
`competitor-analyst` teardown + ranked borrow list at `08 Misc` data/ **`Ground_News_Competitive_Teardown.md`**
(+ **`Creator_Demo_Playbook.md`**). Their moat = an industrial creator-sponsorship engine. Our wedge = the
firewall (they *adjudicate* bias/truth — we measure velocity). **DO-NOT-COPY:** any bias/truth rating.

### API & selling workstream — **PAUSED; resume from `contextive-toolkit/CONTEXTIVE_API_STATUS.md`**
The living tracker (Track A = API dev, Track B = go-to-market). Companions held local / untracked pending
Victor's public-vs-private call: `CONTEXTIVE_API_PLAN.md`, `CONTEXTIVE_PRICING_DISCOVERY.md`. **Shipped
LIVE in the prior (API) session** (commits `892cf78` → … → `661f343`, all Vercel READY): positioning
realigned to the honest neutral product; SEO / disambiguation vs the other "Contextive"s (contextive.tech,
contextive.com); `/waitlist` API product page with the interactive **Signal Explorer**; live early-access
pricing (Free $0 / Starter $39 / Pro $149 / Enterprise from $999); combined waitlist capture. **API service
scaffold — `contextive-api/`** (sibling of `contextive-site/`, its OWN local git repo; **NOT on GitHub, NOT
deployed**). FastAPI Phase-1 read-only, percentiles per-instrument, **7 passing tests**.

**Domain decision (Victor):** market as the word **"Contextive"** — no TLD suffix. Canonical address stays
**contextive.info**. **`contextive.ai` is a third party's — never use it.** Instagram is
**instagram.com/contextive.info**. X handle is `@contextive_ai` (open — leave or rebrand).

**Pending manual step (was two, now one — Gate-0 signup capture is DONE this session):**
- **Deploy `contextive-api`** (push to a GitHub repo + host on Render/Railway/Fly), then set
  `VITE_CONTEXTIVE_API_URL` (+ optional `VITE_CONTEXTIVE_API_KEY`) on the site's Vercel project → the
  `/waitlist` explorer becomes a live round-trip (the wiring is already shipped).

### Campaigns (durable)
- **TEN campaigns are live on the site — ALL measured**, now rendered through the reader-facing redesign
  (hero duel + leaderboard + `/readout`). LIVE routes: **C01 `/campaigns/01-trade-war`**,
  **C02 `/campaigns/02-ai-and-work`**, **C03 `/campaigns/03-bodies-and-food`**,
  **C04 `/campaigns/04-primaries`**, **C05 `/campaigns/05-economy`**, **C06 `/campaigns/06-iran-war`**,
  **C07 `/campaigns/07-money`**, **C08 `/campaigns/08-abundance`**, **C09 `/campaigns/09-real`**,
  **C10 `/campaigns/10-power`**.
- **Measured/pending split (verified in `src/data/campaigns/*.json`):** C01 16/17, C02 13/17, C03 17/17,
  C04 15/17, C05 17/17, C06 17/17, C07 17/17, C08 17/17, C09 17/17, C10 12/17.
- **Instrument note:** all live campaigns are `gdelt-coverage` via the webngrams full-text channel.
  Within-campaign velocity percentiles are valid; absolute density is a labelled coverage proxy. Never mix
  channels into one percentile set — the in-code firewall enforces this.
- **Measurement divergence (flag every time):** measured data reverses several hand-built brief figures
  (C03 seed oils, C04 America First, C01's spine REVERSED). The site/briefs show measured, never the brief's.

### Open threads
1. **Marketing / ads launch** — organic-first then the small Reddit paid test on the C10 hook (cost/signup);
   Courtney is building the ad posts now from `Courtney_Task_Waitlist_Ads.md`.
2. **Delete 4 test rows from the signup Sheet** — all `@example.com`: `capture-test-delete@`,
   `waitlist-form-test-delete@`, `prod-apimode-verify-delete@`, `hardening-verify-delete@`.
3. **C10 / C09 finish the cadence** — Victor's editorial pass on the warm C10 Courtney doc + build the
   **C10 and C09 carousel graphics** (campaign-graphics, from the measured cards).
4. **C08 / C07 publish** — Victor's editorial passes on the warm C08 + C07 Week-02 docs; refresh the C08
   number-bearing carousel slides to the confirmed abundance-vs-scarcity spine before Courtney builds.
5. **Fix the C07 brief docx firewall** — correct the money-domain variant to the canonical "…politics is
   correct" string (FLAG above). **Still open.**
6. **Post-launch security follow-ups (Victor's account):** durable per-IP rate-limit via **Vercel KV**;
   bump **react-router-dom** (GHSA-qwww — not exploitable, pure client SPA); `npm audit fix` postcss/babel
   (dev-only); optional shared-secret on the Apps Script webhook.
7. **Prune the stale legacy data — CAREFULLY.** `terms.ts` / `legacy.ts` + the homepage `TICKER_TERMS` are
   no longer rendered as campaigns, BUT `terms.ts` is still imported by **Hero, Footer, Nav, HowItWorks,
   WaitlistForm, DossierCard** (verified). Hero is now crash-proofed but still reads `TERM_FILES` — untangle
   the imports before deleting.
8. **Optional C01/C02/C10 400d top-up** — a 400d scan would unlock **yoy + adoption-stage** (n/a on 180d)
   and let a hyphen-variant query recover undercounted hyphenated terms. Byte-cap + one combined scan; only
   if yoy is worth ~$99.
9. **BigQuery / Web NGrams operating discipline** — **check billing is attached to `contextive-signal`
   before any scan**; every scan is billed (~$6.25/TiB), window-bound (180d ≈ ~$44), byte-capped,
   cost-logged; combine campaigns/terms into one scan. **Complete the DOC calibration** (`--calibrate-from`).
10. **Unregister the obsolete DOC auto-retry** (`"Contextive C07 GDELT Retry"`).
11. **QA deferrals** — code-split (~737 kB); per-term social-unfurl (`/signal/<term>` meta is client-set —
    add build-time prerender if shared links must unfurl with the term's card).
12. **Creator-demo GTM** (Ground News Move #1) — Victor to greenlight outreach (**gated**). Durable signup
    capture (its prerequisite) is now DONE.
13. **Deploy `contextive-api`** (the one remaining API manual step) + **public vs private** for the three
    local API docs — see `CONTEXTIVE_API_STATUS.md`.
14. **X handle** `@contextive_ai` — leave or rebrand to the `.info` brand.
15. **Agent-Reach OSS — evaluated, NOT adopted.** Cherry-pick Exa / yt-dlp / Jina / gh off-box later.
16. **MediaCloud / GCP extras** — MediaCloud free key is an optional 2nd coverage corpus; Google Trends
    **rejected**.

## How to work in this repo (read this)
- **Open the next session in `E:\Contextive\06 Website Code\contextive-source\contextive-source`
  (the parent) — the same folder this session used.** Everything works from here: `CLAUDE.md`, the
  `.claude/` slash commands + skills, the site under `contextive-site/`, the API scaffold under
  `contextive-api/`, the toolkit at `08 Misc`, git push, and the local preview.
- Slash commands register at **session start** — they won't appear if added mid-session.
- **Writing to the live site is gated on Victor by default** (prepare the diff → preview → he pushes).
  **This session pushed freely under Victor's per-session grants** (site/UX/security work); **the gate is
  closed again by default next session unless he re-grants push authority.** The push runs under Victor's
  local git creds (commits show "Victor Wei").
- **BigQuery runs cost real money** (billing on Victor's GCP — and it can silently detach; check it's
  attached to `contextive-signal` first). Do a dry-run byte estimate, keep to the 180d window unless yoy is
  worth it, and combine terms/campaigns into one scan. Never fire a billed query casually.

## The agent assembly line (campaign cadence as sub-agents)
The campaign cadence runs as **dedicated sub-agents** in `.claude/agents/` (canonical in
`contextive-site/.claude/agents/`, mirrored to the parent). Each owns one stage, reads the canonical skill
+ its `/command`, applies the non-negotiables, and returns a structured report to the orchestrator.
**Agents report to the orchestrator; the orchestrator reports to Victor.** C07 was the first campaign run
end to end through this line, C08 the second, C09 the third, C10 the fourth — it works. **This session the
line worked the SITE/GROWTH/SECURITY side rather than a campaign:** the growth-analyst produced the
marketing/ads plan + Courtney task docs, security + functional audit agents ran the pre-ads hardening sweep,
and pre-pub-reviewer flagged the populist C10 hook variant (→ Victor's Option B). The measure-don't-estimate
gate held on the reader-facing redesign — the plain-language chips are a deterministic label on measured
math, and pending terms carry no number. **13 agents** (canonical `contextive-site/.claude/agents/`,
mirrored to the parent; orchestrator command `.claude/commands/campaign.md`).

**Campaign line (6):**
- **signal-measurer** — finds ~17 terms, writes terms.json, runs the pipeline (`--source webngrams`), top-up
  merges (never regress). The "measure, don't estimate" engine.
- **brief-author** — campaign.json scaffold + builds/validates the brief docx; lets the measured numbers choose the spine.
- **courtney-instructions** — Week 02 exec doc + Claude Design prompts (needs Victor's warm/neutral tone call).
- **campaign-graphics** — carousel slide spec + per-card Claude Design prompts from measured cards.
- **site-publisher** — builds the campaign page + local preview, prepares the diff, then **STOPS at the push gate**.
- **handoff-scribe** — refreshes this handoff at campaign end.

**Company line (7):**
- **competitor-analyst** — rival teardown + ranked borrow list (did Ground News).
- **trend-scout** — surfaces the next vocabulary war to feed signal-measurer.
- **pre-pub-reviewer** — the PASS/FLAG/BLOCK gate against the six non-negotiables (flagged the C10 hook this session).
- **growth-analyst** — funnel / SEO / waitlist read + ranked growth moves (produced the creator playbook + this session's ads plan).
- **pricing-researcher** — runs the Van-Westendorp discovery → tier/price recommendation.
- **api-engineer** — owns the `contextive-api/` build **and the pipeline infra**; never deploys without Victor.
- **brand-copy-editor** — sweeping brand-voice copy passes.

**Activate it:** `/campaign <nn> <topic>` — the orchestrator dispatches the line (measure → brief →
⛔Victor review + tone → fan out [Courtney ‖ graphics ‖ site] → ⛔push gate → handoff). Any stage runs
standalone. **The two human gates — warm/neutral tone, and the live-site push — are never skippable for
speed.** Agents added mid-session register only at the **next** session start.

## Environment gotchas (these bite)
- Python is **`python`** (3.14), not `python3`. Node v22. **Run the pipeline as `python -X utf8 …`** — the
  box defaults to the GBK codec (Win11 China locale), so an enriched `terms.json` dies with
  `UnicodeDecodeError` without it.
- **The Claude Browser pane does NOT composite frames when hidden** → `getComputedStyle` returns **bogus
  values** (e.g. dark-mode cards read as white bg) for any node inside a `will-change` / transform
  compositing layer. This is **NOT a real rendering bug** — freshly-injected clones read correct, and real
  browsers / screenshots render correctly. **Verify visuals via Victor's screenshots, not `getComputedStyle`.**
  (Screenshots still fail from the tool side — the pane isn't displayed.)
- **The toolkit code RUNS directly — no materialize step.** A full copy *with code + `node_modules`* lives
  at `E:\Contextive\08 Misc\files\contextive-toolkit\contextive-toolkit\` (`pipeline/signal_pipeline.py`,
  `generators/`, `schema/`, `data/`). The repo's vendored `contextive-toolkit/` holds **docs only**.
  Measured cards for C03–C10 live in the `08 Misc` `data/` as webngrams-canonical `campaign0X_cards.json`
  (C04–C09 keep pre-migration DOC sets as `campaign0X_cards.pre-webngrams-backup.json`). The reusable
  combined-scan driver lives at the session `scratchpad/combined_scan.py` (it crashed on a post-query split
  bug — recover a paid job by ID rather than re-scanning). The marketing/ads plan + Courtney task docs also
  live in that `08 Misc` `data/`.
- **Measurement runs on GDELT Web News NGrams 3.0 (full-text) via BigQuery — `--source webngrams`.**
  Requires Victor's GCP: key `C:\Users\WEI\.contextive\contextive-gcp-key.json`, project
  `contextive-signal`, BigQuery **billing ENABLED and ATTACHED** (it detached once — check first;
  `pip install google-cloud-bigquery`). ~$6.25/TiB; dry-run byte cap mandatory; cost is **window-bound not
  term-bound** (180d ≈ 7.4 TiB ≈ ~$44 standard; 400d ≈ 15.9 TiB ≈ ~$99 only when yoy is worth it) →
  **combine into ONE scan.** `--ref-date` per campaign: C03 `2026-05-04`, C04 `2026-05-25`, C05
  `2026-06-09`, C06 `2026-06-21`, C07 `2026-06-25`, C08 `2026-06-29`, C09 `2026-07-10`, C01/C02/C10
  `2026-07-21`.
- **GDELT DOC 2.0 (`--source doc`) is still throttled server-side** (persistent 429 — not our IP). GKG
  (title/theme) does NOT work — it lacks body text (failed calibration 0/8). The Wikipedia lens
  (`--source wikipedia`) is a **separate instrument** (`measurement.attention`), never mixed into GDELT
  velocity.
- `velocity_index` is a within-set percentile (recomputes when the set changes; extremes stay 0/100). For
  top-ups, **merge best-of-both and never regress**. **Disambiguate noisy tokens and verify a surprising
  surge** before it becomes the spine; **~84 `_WEBNGRAMS_OVERRIDES`** restore recall/precision. Rare tokens
  (C04 `endorsement machine`, C10's 5 sub-noise-floor grievance terms) go **sparse/degenerate** → `pending`.
- **`contextive-api/` deps:** `pip install -r requirements.txt`. Tests: `python -m pytest` (7/7). Regenerate
  its seed with `python -X utf8 scripts/build_seed.py`.
- **Preview tooling is under `mcp__Claude_Browser__preview_*` / `navigate` / `javascript_tool`.** Traps:
  the pane sometimes reports a **collapsed width** right after a navigation — verify `window.innerWidth`
  before trusting overflow; **fonts fall back** so mobile overflow can be invisible (stress-test with a wide
  injected element); **screenshots time out** on animated pages (verify via DOM / `getBBox` + `npm run
  build`); after deleting a component, clear Vite HMR (`rm -rf node_modules/.vite`).
- **Vercel:** team `team_QmqXaFOedaDKjV8Fix000nkc`, project `prj_vG2F3INghrWd8trVkfM0znEmYB7X`
  (`contextive-site-test`, Vite). Push `main` → auto-deploy. `get_deployment` on the branch alias **lags**
  one build behind — to confirm the *latest* commit fast, use `list_deployments` with a `since` timestamp.
  **Repo is PUBLIC** (Victor's call); setting it PRIVATE **blocks the deploy** until Vercel's GitHub App
  access is re-granted.

## What Contextive is
A **language-intelligence brand** tracking how vocabulary gains momentum and shifts meaning — **velocity,
not verdict** — published as "intelligence brief" campaigns across Substack, X, Instagram, and (next) sold
as a measured-signal **API**. **Firewall (verbatim, never improvise):** "We track how the words have been
used and how fast they are winning, not whether the underlying politics is correct."

## Roles + media pipeline
- **Victor** — research, strategy, infra, pipeline; signs off on every brief + Courtney doc.
- **Courtney** — publishing, visual/Instagram, scheduling; drafts with ChatGPT (你的好朋友). She builds
  **all** social/visual content in **Claude Design** with the shared **"contextive design system"**
  (monochrome, monospace, dossier-card vocabulary) — no Canva, no hand-built cards. Card numbers come from
  the measured `cards.json`. Courtney-doc tone is Victor's call per campaign (default warm: 宝宝, asides).

## Non-negotiables (outrank everything but safety)
1. **Measure, don't estimate.** Numbers from `signal_pipeline.py`; unmeasurable = pending, never guessed. A
   measured number that kills a narrative IS the story — flag it before shipping. **Qualitative reads are
   never measurements:** no count, engagement tally, or velocity claim from any web/social read may enter a
   signal field, `cards.json`, a Velocity Card, a `/signal` page, or the API — those carry measured values
   or stay `pending`. **One instrument per percentile:** never mix coverage (`gdelt-coverage`) and attention
   (`wikipedia-attention`) into one ranking (enforced in code). *(The reader-facing chips honor this — they
   are a deterministic label on already-measured math, and pending terms carry no number.)*
2. **Firewall, verbatim** (above).
3. **No named person in a critical sentence** — quote patterns of speech, never an individual.
4. **Equal weight across the three clusters**; paraphrase each term's contestation paragraph.
5. **No visual partisanship:** monochrome/typographic, no candidate imagery, no red/blue palette.
6. **Pre-publication review on every ship day** → PASS/FLAG/BLOCK (partisan tilt, named-person, voice leak,
   numerical accuracy, headline misread). Any BLOCK is a hard stop; never cut for time.
7. Tone of Courtney docs is Victor's per-campaign call.

## Campaign lineage
**All ten are now measured + live** (and rendered through the reader-facing redesign). 01 the trade war
*(16/17; slug `trade-war`; spine REVERSED — **"export controls" v87/+40.4% vs "trade war" v13/−29.9%**,
friend-shoring v100 leading)* · 02 AI and work *(13/17; slug `ai-and-work`; **"replaced by AI" v50/+38% vs
"efficiency gains" v0/−17%**, restructuring v100 loud)* · 03 bodies & food (MAHA/GLP-1) *(17/17; spine
**"chronic disease epidemic" v100 vs "food as medicine" v0** — wins on diagnosis, loses on cure)* · 04
primaries *(15/17: MAGA Warrior +599%/30d + primary challenger +155% confirmed; 2 sparse tokens → pending)*
· 05 the economy *(**"soft landing" v19 vs "vibecession" v100** — 17/17; CONFIRMED)* · 06 the Iran war
*(**"obliterated" v0 vs "ceasefire" v94/+455%** — 17/17; CONFIRMED, warmonger v100 the loudest term)* · 07
the language of money *("debasement trade: velocity vs verdict" — 17/17; loudest word loud because dying)* ·
08 the language of abundance *("abundance vs scarcity" — 17/17, CONFIRMED; YIMBY the lone build-side
climber)* · 09 the language of the real *("slop vs synthetic" — 17/17: epithet plateaus, applied vocabulary
gains)* · **10 the language of power** *(the electricity / AI-data-center war; defining tension **"cost
allocation" v100/+66% vs "energy dominance" v9** — 12/17: the who-pays rate-case lexicon outruns the
buildout banner; 5 grievance terms below the noise floor → pending)*. Per campaign: research brief (17
cards / 3 clusters / 7 signal fields) → Week 01 "trailer" → Week 02 launch (2 Substack, 2 X threads, 1
carousel over 8 working days) → editorial passes → optional ads. Brief releases a week ahead; the
mid-Week-02 weekend is a hard reset.

## The signal layer + why we measure
The differentiator is the signal layer; credibility depends on the numbers being real. A C04 audit found
the hand-built numbers off; C06 reshaped its spine around the measured collapse of "obliterated"; **C07 was
the example twice over** (the −74%/90d unwind of "debasement trade" set the spine; a false "hard money" surge
was caught and corrected). **C08 proved the discipline from the opposite direction** (shipped all-pending
rather than estimate, then confirmed its spine). **The signal layer then repaired its own instrument** —
DOC stayed throttled, so the coverage measure migrated to **GDELT Web News NGrams 3.0 (full-text) on
BigQuery** and the whole archive was re-measured on it. **All ten campaigns are now measured**; the
measure-don't-estimate rule held throughout (sub-noise-floor tokens are `pending`, not guessed). **This
session extended that discipline into the presentation layer:** the everyday-reader chips (`readSignal.ts`)
are a deterministic function of the already-measured 90d/30d momentum — a legible label on the math, never a
new estimate — and pending terms show no number anywhere. A hard rule from the migration: **one instrument
per percentile** — coverage (`gdelt-coverage`) and attention (`wikipedia-attention`) are labelled and never
mixed, enforced in code. Seven fields: platforms, corpus density (a labelled full-text coverage proxy),
velocity index 0–100 (within-set percentile), inflection points (dated z-peaks), sentiment −5..+5,
co-occurrence, adoption stage. **The API exposes the same fields**, replacing the within-set index with an
absolute reference-universe `velocity_percentile`, computed **per-instrument**.

## The toolkit
`pipeline/signal_pipeline.py` — GDELT measurement engine, **multi-source**:
`--source {doc,bigquery,gkg-raw,wikipedia,webngrams}`, `--terms`/`--demo`/`--from-raw`, `--ref-date`,
`--calibrate-from`. **webngrams** is the production coverage channel; **wikipedia** is the separate
attention lens; the instrument firewall lives in `_assign_velocity_index` + `merge_never_regress`; **~84
`_WEBNGRAMS_OVERRIDES`** tune noisy terms; a mandatory dry-run byte cap guards every billed query.
`generators/build_brief.js` + `build_exec_doc.js` (house-style docx), `generators/lib/house_style.js`,
`schema/*.json`, `data/`. **Site generators** (in `contextive-site/scripts/`): `build-campaign.mjs`,
`build-api-demo.mjs`, `build-og-image.mjs`. Run with `python -X utf8` / `node`.

## The website + ship loop
Per-campaign data-driven architecture: unified contract `src/data/campaign.ts`; converter
`scripts/build-campaign.mjs`; react-router routes `/campaigns/<nn>-<slug>`, **`/campaigns/:id/readout`**
(the opt-in dossier), `/how-it-works`, `/waitlist` + a Vercel SPA rewrite in `vercel.json`. **Reader-facing
layer (this session):** `src/lib/readSignal.ts` (plain-language chips from measured momentum),
`src/data/readerHooks.ts` (number-free hooks + hero captions + featured trio),
`src/components/TermLeaderboard.tsx`, `CampaignReadout.tsx`, redesigned `CampaignIndex.tsx` + `Hero.tsx`
(crash-proofed) + `WaitlistForm.tsx` (`apiWaitlist` mode) + `ErrorBoundary.tsx`. **All campaigns 01–10 are
JSON in `src/data/campaigns/`** (registered in `index.ts`, all `signalBasis: measured`); `index.ts` filters
01 + 02 out of `legacyCampaigns()`. **The legacy `terms.ts` path no longer backs any campaign** but is
STILL imported by Hero / Footer / Nav / HowItWorks / WaitlistForm / DossierCard — prune carefully. 08's
`08.json` carries a **hand-fixed `definingTension`** to re-apply if `build-campaign.mjs` is re-run.
**Security:** `vercel.json` CSP is now **ENFORCING**; `api/subscribe.ts` records to our list only (honeypot
+ per-IP throttle, no server-side Substack forward) and writes durably via `SUBSCRIBE_WEBHOOK_URL`.
**Loop:** edit repo → `npm run build` / preview → commit + push to `main` (push is **Victor's action /
gated** by default) → Vercel auto-builds → verify via the connector + contextive.info. `/update-site <nn>`
runs this for a campaign.

## Boot sequence (next session)
1. `CLAUDE.md` auto-loads this handoff + the `contextive-campaign` skill; project memory auto-recalls
   (`campaign-ui-redesign`, `resilient-signal-pipeline`, `c10-power-and-legacy-modernization`,
   `api-and-positioning`, etc.).
2. Read **Resume here**. **If resuming the API / selling workstream, open
   `contextive-toolkit/CONTEXTIVE_API_STATUS.md` first.** Otherwise: all 10 campaigns are LIVE + measured
   and the site is reader-facing, so the open work is **marketing launch + doc/graphics + polish** — pick up
   the open threads in order: **(1) marketing/ads launch + delete the 4 signup test rows; (2) C10 Courtney
   editorial pass + C10/C09 carousel graphics; (3) C08/C07 editorial passes + C08 carousel refresh; (4) fix
   the C07 brief docx firewall; (5) post-launch security follow-ups (Vercel KV rate-limit, react-router
   bump); (6) prune stale terms.ts / TICKER data CAREFULLY (still imported by Hero/Footer/Nav/etc.).**
3. The pipeline + generators run directly from the `08 Misc` toolkit copy (`python -X utf8`); the coverage
   channel is **`--source webngrams`** (BigQuery — costs money; **check billing is attached to
   `contextive-signal`** and byte-cap first); the API scaffold runs from `contextive-api/`. Use each
   campaign's own `--ref-date`.
4. New campaign: **`/campaign <nn> <topic>`** drives the whole agent assembly line. Individual commands
   still work standalone: `/new-brief` → review → `/update-site` (gated) → `/new-instructions`
   (warm/neutral) → `/new-graphics` → publish → `/handoff`.
5. Apply the brand rules + the pre-publication review before declaring anything done. When in doubt: measure
   before asserting, one instrument per percentile, paraphrase the contestation paragraph, keep the firewall
   verbatim, no named person in a critical sentence, pending beats fabricated.
