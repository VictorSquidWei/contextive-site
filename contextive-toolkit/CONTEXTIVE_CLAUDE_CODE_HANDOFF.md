# Contextive — Claude Code Handoff (v6)

**Owner:** Victor · **Live site:** contextive.info · **Repo:** `github.com/VictorSquidWei/contextive-site` (currently **public**)

Standing orientation for a fresh session. Read the **Resume here** block first; everything below it
is durable context. Keep the non-negotiables and the firewall verbatim.

> Note on dating: session clocks have drifted from the stamped dates before (a prior session's clock
> read 2026-06-24 vs docs stamped 2026-06-22). Treat **commit hashes** as the source of truth, not
> dates.

---

## Resume here — current state

**This session stood up the agent assembly line and ran Campaign 07 ("The Language of Money")
end to end through it — the FIRST campaign driven by the sub-agent line, and it works.** The brief,
warm Courtney exec doc, carousel spec, and the C07 site page were all produced; the C07 site page is
built and `npm run build` passes but is **UNCOMMITTED / NOT pushed** — Victor chose to review locally
first. The API + selling workstream remains **PAUSED** (unchanged from v5, folded in below).

### Campaign 07 — "The Language of Money" — **built this session, site push held by Victor**
Ran the full agent line (measure → brief → ⛔Victor review + tone → fan out [Courtney ‖ graphics ‖
site] → ⛔push gate). Tone is **WARM** (Victor's call).
- **Spine: "Debasement trade: velocity vs verdict"** — subtitle *"the bet against the dollar is
  quietly being abandoned."* The measured story: the whole escape-the-dollar vocabulary is cooling
  at once; the loudest word, **"debasement trade"** (velocity 100, **+374%/30d but −73%/90d**), is
  loud only because the press narrates its unwind — loud because it's dying (the C06 "obliterated"
  shape repeating).
- **Measured 8/17** (GDELT, ref-date **2026-06-25**): debasement trade v100 (−73%/90d) · hard money
  v86 (**+88.6%/90d**, clean) · fiscal dominance v71 · sound money v57 (−16%/90d) · store of value
  v43 (−42%/90d) · digital gold v29 (−43%/90d) · inflation hedge v14 · magic internet money v0
  (dormant). **PENDING 9:** death of the dollar, money printing, **stablecoin, tokenization**,
  de-dollarization, digital dollar, fiat, ponzi, Bitcoin standard.
- **Measurement-integrity lesson (the rule working as designed):** "hard money" first measured a
  **+277%/90d** runaway and was *briefly made the spine* ("the creed survives"). A verification pass
  (signal-measurer, with a tightened query excluding hard-money *lending*, campaign-finance
  "hard/soft money", and bare gold-price noise) showed the surge was off-domain noise — the clean
  reading is **+88.6%/90d** (modest, real). The spine was re-centered onto the verified
  velocity-vs-verdict story; the card now carries the tightened query. Disambiguate noisy tokens,
  verify, report the corrected number. Helpers in `scratchpad/`: `merge_c07.py`, `fix_hardmoney_c07.py`.
- **GDELT stonewalled hard** — 2 top-up attempts; **stablecoin/tokenization** (the would-be
  dollar-rails counter-pole) never measured. A spaced top-up for the 9 pending (priority:
  stablecoin, tokenization) is the open measurement task.
- **Artifacts** (in the `08 Misc` toolkit `data/` unless noted): `campaign07_terms.json`,
  `campaign07_terms.topup.json`, `campaign07_cards.json` (8 measured), `campaign07_campaign.json`,
  **`Contextive_Campaign_07_Brief.docx`**, `campaign07_exec_doc.json`,
  **`Contextive_Campaign_07_Week02_Courtney.docx`** (warm), `campaign07_hardmoney_verify.json`. The
  carousel/graphics spec (8-slide spec + per-card Claude Design prompts) was returned inline by
  campaign-graphics — Courtney runs it in Claude Design ("contextive design system"); **no held
  slides** (verification resolved).
- **Site:** `contextive-site/src/data/campaigns/07.json` regenerated + `src/data/campaigns/index.ts`
  (+2 lines); route **/campaigns/07-money**; `npm run build` passes. **UNCOMMITTED / NOT pushed** —
  Victor reviews locally first; the push (his action) + Vercel verify are pending. **Note:** the
  Vercel MCP connector was **disconnected this session**, so the deploy path is unverified from here
  — reconnect it before relying on `list_deployments`/`get_deployment`.

### API & selling workstream — **PAUSED; resume from `contextive-toolkit/CONTEXTIVE_API_STATUS.md`**
That is the living tracker (Track A = API dev, Track B = go-to-market, with done/pending/deferred).
Companions, same folder, all **held local / untracked** pending Victor's public-vs-private call:
`CONTEXTIVE_API_PLAN.md` (the build plan) and `CONTEXTIVE_PRICING_DISCOVERY.md` (a Van-Westendorp
call script). **Shipped LIVE on contextive.info in the prior (API) session** (commits `892cf78` →
`0c10cd7` → `0430461` → `774bd70` → `661f343`, all Vercel **READY**):

- **Positioning realigned off the finance over-claim** to the honest neutral product — "velocity,
  not verdict," across politics, the economy, AI, and culture (an external audit had read the old
  "institutional / words that move markets" copy as a fintech terminal; that copy over-promised a
  product we don't have). Hero, Footer, and all `index.html` metadata rewritten.
- **SEO / disambiguation:** accurate `<title>`/description + `<link rel=canonical>` + JSON-LD
  (Organization + WebSite + `sameAs`) to separate us from the other "Contextive"s — the
  domain-driven-design dev tool at **contextive.tech** (+ its VS Code extension) and the
  Microsoft-365 workspace at **contextive.com**. OG share card `public/og-image.png` (generator
  `scripts/build-og-image.mjs`, `npm run build:og`).
- **`/waitlist` — the API product page,** redesigned around an interactive **Signal Explorer**
  (`src/components/SignalExplorer.tsx`): click a measured term → the card animates to its real
  reading (velocity bar, momentum sparkline, deltas, tone, co-occurrence, inflection); toggle
  **Compare** for the `compare()` head-to-head (obliterated vs ceasefire). Real measured data only,
  via `scripts/build-api-demo.mjs` → `src/data/apiDemo.ts` (28 terms, 8 featured). Flow: hero →
  explorer → who-it's-for → "what's a tracked term" → pricing → firewall + CTA. "API" nav link;
  animated API teaser on the homepage (`ApiTeaser.tsx`).
- **Live early-access pricing** (on the page): Free **$0** / Starter **$39** / Pro **$149** /
  Enterprise **custom (from $999)**; two-axis = tier quota + metered overage. Deliberately
  lower-end-to-learn (Victor's call); validate with the discovery script before treating as final.
- **Combined waitlist + Substack capture** — `WaitlistForm.tsx` records the email to our list
  (tagged by `source`) AND opens Substack in one action (Hero, FinalCTA, /waitlist). `api/subscribe`
  hardened: returns `stored` and logs a warning when no durable store is configured.
- **Mobile-overflow fix (lesson, see Environment):** the Explorer cards overflowed on real phones
  (loaded webfonts + the sparkline SVG's intrinsic width) though the preview looked fine; fixed by
  making every mobile grid column explicitly shrinkable (`grid-cols-1` ahead of the `sm:`/`lg:`
  variants) + `min-w-0` down the card chain so cards clamp and the SVG scales. Desktop unchanged.
- **API service scaffold — `contextive-api/`** (sibling of `contextive-site/`, **its OWN local git
  repo**, commits `4d22700` + `2a2434a`; **NOT on GitHub, NOT deployed**). FastAPI **Phase-1
  read-only** over a precomputed 28-term seed (`data/seed_terms.json`; regen `python -X utf8
  scripts/build_seed.py`). Endpoints `/v1/health`, `/v1/terms/{phrase}` (unknown → honest
  `pending`), `/v1/compare`. Resolves API_PLAN §3.2 (absolute reference-universe `velocity_percentile`
  + raw momentum deltas; dedupes "America First" across C04/C06). API-key gate, CORS, Procfile,
  **5 passing tests** (`pip install -r requirements.txt` then `python -m pytest`).

**Domain decision (Victor):** market as the word **"Contextive"** — no TLD suffix in branding. The
canonical site address stays **contextive.info** (the owned domain; required in canonical/og tags).
**`contextive.ai` is owned by a third party — never use it as our URL or brand.** Instagram
rebranded to **instagram.com/contextive.info** (live). X handle is still `@contextive_ai` (open
question — leave or rebrand).

**Two pending manual steps (need Victor's accounts — can't be automated here; no `gh` CLI on the box):**
1. **Durable signup capture** — until wired, signups sit only in ephemeral Vercel runtime logs.
   Create a Google Sheet, deploy `contextive-site/scripts/subscribe-sheet.gs` as a Web app, set
   `SUBSCRIBE_WEBHOOK_URL` in Vercel, redeploy. Steps: `contextive-site/scripts/SUBSCRIBE_SETUP.md`.
   *(Most urgent — the live waitlist is already taking signups.)*
2. **Deploy `contextive-api`** (push to a GitHub repo + host on Render/Railway/Fly), then set
   `VITE_CONTEXTIVE_API_URL` (+ optional `VITE_CONTEXTIVE_API_KEY`) on the **site's** Vercel project →
   the `/waitlist` sample/explorer becomes a live round-trip (the wiring is already shipped).

### Campaigns (durable)
- **SIX campaigns are live; C07 is built but not yet pushed (see C07 block above).** C06 — "The
  Language of the Iran War" at `/campaigns/06-iran-war`, defining tension reframed to **"obliterated"
  vs "ceasefire"** (measured: the victory word collapsed — velocity 0, −63% 90d — while "ceasefire"
  is the runaway — velocity 100, +425%, spreading). Site shows **measured** numbers, never the brief's.
- Measured coverage is partial (GDELT): **C03 6/17, C04 5/17, C05 9/17, C06 9/17, C07 8/17**; the rest render
  **"measurement pending."** Campaigns sit near their GDELT-measurable ceilings for their fixed
  windows; marginal gains come only from accumulating GDELT's *union* across many spaced runs.
  Merge bases seeded: `campaign04_cards.json` incl. `primary challenger`; `campaign05_cards.json`
  incl. `K-shaped` (**note C05 base used ref-date 06-21 vs the live 06-09; re-seed at 06-09 if
  resuming**). **C03 has not been re-run — do not assume a C03 result.**
- **Measurement divergence (flag every time):** live GDELT reverses several hand-built brief figures
  (e.g. C03 "seed oils" brief +617%/surging vs measured fading; C04 "America First" brief +75% vs
  measured negative). The site/briefs show measured, never the brief's.

### Open threads
1. **C07 site push** — `07.json` + `index.ts` are built and pass `npm run build` but are
   **uncommitted**; Victor reviews locally, then he pushes (his action) + Vercel verify. **Reconnect
   the Vercel MCP connector first** (it was disconnected this session).
2. **C07 measurement top-up** — 9 pending terms; **stablecoin + tokenization** are the priority (the
   dollar-rails counter-pole that never measured). GDELT was punishing this session; needs spaced runs.
3. **C07 carousel** — Courtney to run the warm 8-slide spec (returned inline by campaign-graphics) in
   Claude Design ("contextive design system"); card numbers from `campaign07_cards.json`.
4. The API workstream's **two pending manual steps** (durable signups; deploy the API) — unchanged,
   see `CONTEXTIVE_API_STATUS.md`.
5. **Public vs private** for the three local API docs (`CONTEXTIVE_API_PLAN.md`,
   `CONTEXTIVE_API_STATUS.md`, `CONTEXTIVE_PRICING_DISCOVERY.md`) — currently untracked/local.
6. **X handle** `@contextive_ai` — leave or rebrand to match the `.info` brand.
7. **Measurement union-accumulation** — resume the slow grind for marginal new terms across all
   campaigns, or accept current coverage as the practical ceiling (Victor's call).
8. **C06 Week-02 publishing** is Courtney's to run on the warm exec doc; refresh carousel velocity
   numbers from the current `cards.json` before she builds.

## How to work in this repo (read this)
- **Open the next session in `E:\Contextive\06 Website Code\contextive-source\contextive-source`
  (the parent) — the same folder this session used. Everything works from here:** `CLAUDE.md`, the
  `.claude/` slash commands + skills, the site under `contextive-site/`, the API scaffold under
  `contextive-api/`, the toolkit at `08 Misc`, git push, and the local preview all function.
  (`contextive-site/` is the canonical git repo where `.claude/` lives natively; the parent carries
  a working mirror — its `CLAUDE.md` now points to `CONTEXTIVE_API_STATUS.md`.)
- Slash commands register at **session start** — they won't appear if added mid-session.
- **Writing to the live site is gated on Victor by default** (prepare the diff → preview → he
  pushes). This session he granted explicit **"full authority"** to push directly and authorized
  the live pushes above; that grant is **per-session, not standing** — default back to gated unless
  he says so. The push runs under Victor's local git creds (commits show "Victor Wei").

## The agent assembly line (campaign cadence as sub-agents)
The campaign cadence runs as **dedicated sub-agents** in `.claude/agents/` (canonical in
`contextive-site/.claude/agents/`, mirrored to the parent `.claude/agents/`). Each owns one stage,
reads the canonical skill + its `/command` for process (no duplication, no drift), applies the
non-negotiables, and returns a **structured report** to the orchestrator (the main session).
**Agents report to the orchestrator; the orchestrator reports to Victor.** **Campaign 07 was the
first campaign run end to end through this line — it works** (both human gates held: the warm/neutral
tone call and the live-site push gate). The six (canonical `contextive-site/.claude/agents/`,
mirrored to the parent `.claude/agents/`; orchestrator command `.claude/commands/campaign.md`):
- **signal-measurer** — finds ~17 terms, writes terms.json, runs the GDELT pipeline, top-up merges (never regress). The "measure, don't estimate" engine. (Data half of `/new-brief`; also the standalone top-up worker.)
- **brief-author** — campaign.json scaffold + builds/validates the brief docx; lets the measured numbers choose the spine. (Prose half of `/new-brief`.)
- **courtney-instructions** — Week 02 exec doc + Claude Design prompts from measured cards. (`/new-instructions`; needs Victor's warm/neutral tone call.)
- **campaign-graphics** — carousel slide spec + per-card Claude Design prompts from measured cards. (`/new-graphics`.)
- **site-publisher** — builds the campaign page + local preview, prepares the diff, then **STOPS at the push gate** (the push is Victor's). (`/update-site`.)
- **handoff-scribe** — refreshes this handoff at campaign end. (`/handoff`.)

**Activate it:** `/campaign <nn> <topic>` — the orchestrator dispatches the line
(measure → brief → ⛔Victor review + tone → fan out [Courtney ‖ graphics ‖ site] → ⛔push gate →
handoff). Any stage runs standalone too (e.g. a top-up is just `signal-measurer` again). **The two
human gates — warm/neutral tone, and the live-site push — are never skippable for speed.** Agents
added mid-session register only at the **next** session start.

## Environment gotchas (these bite)
- Python is **`python`** (3.14), not `python3`. Node v22. **Run the pipeline as `python -X utf8 …`**
  — the box defaults to the GBK codec (Win11 China locale), so an *enriched* `terms.json` (em-dashes
  / curly quotes) dies with `UnicodeDecodeError` without it.
- **The toolkit code RUNS directly — no materialize step.** A full copy *with code + `node_modules`*
  lives at `E:\Contextive\08 Misc\files\contextive-toolkit\contextive-toolkit\`
  (`pipeline/signal_pipeline.py`, `generators/`, `schema/`). The repo's vendored
  `contextive-toolkit/` holds **docs only**. **Inputs:** C05/C06 term+campaign JSON are in the
  `08 Misc` `data/`; **C03/C04 live in the *original* `E:\Contextive\files\contextive-toolkit\contextive-toolkit\data\`** (NOT 08 Misc).
- **GDELT rate-limits hard** (~1 req/5s + a punishing cooldown); expect a handful of measured terms
  per run, the rest `pending`. Measure each campaign as-of its own moment with `--ref-date`: C03
  `2026-05-04`, C04 `2026-05-25`, C05 `2026-06-09`, C06 `2026-06-21`, C07 `2026-06-25`.
  `velocity_index` is a within-set percentile (recomputes when the set changes; extremes stay 0/100).
  For top-ups, **merge best-of-both and never regress** a campaign's measured set
  (`scratchpad/merge_c06.py` / `merge_c07.py` pattern). **Disambiguate noisy tokens and verify a
  surprising surge** before it becomes the spine — C07 "hard money" measured a false +277%/90d from
  off-domain noise (lending, campaign-finance, gold-price) and was corrected to +88.6%/90d with a
  tightened query (`scratchpad/fix_hardmoney_c07.py`).
- **`contextive-api/` deps:** `pip install -r requirements.txt` (fastapi, uvicorn, pydantic, pytest,
  httpx — `uvicorn` is not preinstalled). Tests: `python -m pytest`. Regenerate its seed from the
  site's campaign JSON with `python -X utf8 scripts/build_seed.py`.
- **Preview (Claude_Preview) — several traps hit this session:**
  - The pane sometimes reports a **collapsed width** (`window.innerWidth` ≈ 90–105px) right after a
    navigation — bogus. Use `preview_resize` with an explicit `width`/`preset` and **verify
    `window.innerWidth`** before trusting any overflow measurement.
  - **Fonts fall back** in the preview (the real Google webfonts often don't load), so text is
    narrower than on a real device — **mobile overflow can be invisible here.** Don't trust "no
    overflow" alone: make layouts robust (`grid-cols-1` + `min-w-0` so children shrink) and
    **stress-test** by injecting a wide element (`min-width:600px`) into a card and confirming
    `document.documentElement.scrollWidth` stays == viewport.
  - **Screenshots time out** on animated pages (scan-sweep, pulses) — verify via DOM / `getBBox`
    + `npm run build` instead. Freezing animations did not reliably help.
  - After **deleting a component** mid-session, Vite HMR logs stale "failed to reload" errors —
    `preview_stop` → `rm -rf node_modules/.vite` → `preview_start` to clear; production build is
    unaffected.
- **Vercel:** team `team_QmqXaFOedaDKjV8Fix000nkc`, project `prj_vG2F3INghrWd8trVkfM0znEmYB7X`
  (`contextive-site-test`, Vite). Push `main` → auto-deploy. Verify via the connector;
  `get_deployment` on the branch alias `contextive-site-test-git-main-contextive-ai.vercel.app`
  **lags** one build behind — to confirm the *latest* commit fast, use `list_deployments` with a
  `since` timestamp (returns just the new one). **Repo is PUBLIC** (Victor's call); **setting it
  PRIVATE blocks the deploy** (BLOCKED) until Vercel's GitHub App access is re-granted.

## What Contextive is
A **language-intelligence brand** tracking how vocabulary gains momentum and shifts meaning —
**velocity, not verdict** — published as "intelligence brief" campaigns across Substack, X,
Instagram, and (next) sold as a measured-signal **API**. **Firewall (verbatim, never improvise):**
"We track how the words have been used and how fast they are winning, not whether the underlying
politics is correct."

## Roles + media pipeline
- **Victor** — research, strategy, infra, pipeline; signs off on every brief + Courtney doc.
- **Courtney** — publishing, visual/Instagram, scheduling; drafts with ChatGPT (你的好朋友). She
  builds **all** social/visual content in **Claude Design** with the shared **"contextive design
  system"** (monochrome, monospace, dossier-card vocabulary) — no Canva, no hand-built cards. Card
  numbers come from the measured `cards.json`. Courtney-doc tone is Victor's call per campaign
  (default warm: 宝宝, asides).

## Non-negotiables (outrank everything but safety)
1. **Measure, don't estimate.** Numbers from `signal_pipeline.py`; unmeasurable = pending, never
   guessed. A measured number that kills a narrative IS the story — flag it before shipping. (This
   extends to the API: unknown terms return `pending`, and the site's demo data is real measured
   readings, never invented.)
2. **Firewall, verbatim** (above).
3. **No named person in a critical sentence** — quote patterns of speech, never an individual.
4. **Equal weight across the three clusters**; paraphrase each term's contestation paragraph.
5. **No visual partisanship:** monochrome/typographic, no candidate imagery, no red/blue palette.
6. **Pre-publication review on every ship day** → PASS/FLAG/BLOCK (partisan tilt, named-person,
   voice leak, numerical accuracy, headline misread). Any BLOCK is a hard stop; never cut for time.
7. Tone of Courtney docs is Victor's per-campaign call.

## Campaign lineage
01 geopolitics · 02 AI & work · 03 bodies & food (MAHA/GLP-1) · 04 primaries (May 19 2026) ·
05 the economy (defining tension "soft landing" vs "vibecession") · 06 the Iran war (28 Feb–17 Jun
2026 war + the 17 Jun ceasefire MOU; defining tension "obliterated" vs "ceasefire") · **07 the
language of money** (crypto/money vocabulary war — stablecoins, debasement trade, sound money,
tokenization; defining tension "debasement trade: velocity vs verdict"). Per
campaign: research brief (17 cards / 3 clusters / 7 signal fields) → Week 01 "trailer" → Week 02
launch (2 Substack, 2 X threads, 1 carousel over 8 working days) → editorial passes → optional ads.
Brief releases a week ahead; the mid-Week-02 weekend is a hard reset.

## The signal layer + why we measure
The differentiator is the signal layer; credibility depends on the numbers being real. A C04 audit
found the hand-built numbers off in magnitude and timing; C06 reshaped its spine around the measured
collapse of "obliterated"; **C07 is the latest example twice over** — the measured −73%/90d unwind of
"debasement trade" set the spine, and a false +277% surge on "hard money" was caught and corrected to
+88.6% by a verification pass with a tightened query *before* it could mislead. Live measurement is
the default. Seven
fields: platforms, corpus density (GDELT coverage-intensity proxy, labelled), velocity index 0–100
(within-set percentile), inflection points (dated z-peaks), sentiment −5..+5, co-occurrence,
adoption stage. **The API exposes the same fields**, but replaces the within-set index with an
absolute reference-universe `velocity_percentile` (API_PLAN §3.2) so readings are comparable across
the whole universe.

## The toolkit
`pipeline/signal_pipeline.py` (GDELT measurement; `--terms`/`--demo`/`--from-raw`, `--ref-date`),
`generators/build_brief.js` + `build_exec_doc.js` (house-style docx), `generators/lib/house_style.js`,
`schema/*.json`, `data/`. **Site generators** (in `contextive-site/scripts/`): `build-campaign.mjs`
(campaign.json + cards.json → `src/data/campaigns/<nn>.json`), `build-api-demo.mjs` (→ `apiDemo.ts`
for the Signal Explorer), `build-og-image.mjs` (→ the OG card). All run from the `08 Misc` copy /
the repo with `python -X utf8` / `node`. Top-up merge helper: `scratchpad/merge_c06.py`.

## The website + ship loop
Per-campaign data-driven architecture: unified contract `src/data/campaign.ts`; converter
`scripts/build-campaign.mjs`; react-router routes `/campaigns/<nn>-<slug>`, `/how-it-works`
(methodology), `/waitlist` (the API product page) + a Vercel SPA rewrite in `vercel.json`. Homepage =
Hero + campaign index + methodology teaser + **API teaser** + subscribe CTA. `SignalCard` renders
measured / pending / editorial. Campaigns 01–02 reconcile from legacy `src/data/terms.ts`; 03–07 are
JSON in `src/data/campaigns/` (07 built this session, **not yet committed/pushed**). Key newer components: `SignalExplorer.tsx`, `WaitlistForm.tsx`,
`ApiTeaser.tsx`, `Nav.tsx` (the "Campaigns" link scroll-jumps to `#campaigns`). **Loop:** edit repo
→ `npm run build` / preview → commit + push to `main` (push is **Victor's action / gated** by
default) → Vercel auto-builds → verify via the connector + contextive.info. `/update-site <nn>` runs
this for a campaign.

## Boot sequence (next session)
1. `CLAUDE.md` auto-loads this handoff + the `contextive-campaign` skill; project memory auto-recalls
   (the `api-and-positioning` memory points here and to `CONTEXTIVE_API_STATUS.md`).
2. Read **Resume here**. **If resuming the API / selling workstream, open
   `contextive-toolkit/CONTEXTIVE_API_STATUS.md` first** — it has the exact next steps. Otherwise
   confirm what's measured vs pending and pick up the campaign open threads.
3. The pipeline + generators run directly from the `08 Misc` toolkit copy (`python -X utf8`); the
   API scaffold runs from `contextive-api/` (`pip install -r requirements.txt`, `python -m pytest`).
   Use each campaign's own `--ref-date`.
4. New campaign: **`/campaign <nn> <topic>`** drives the whole agent assembly line (measure →
   brief → ⛔Victor review + tone → fan out [Courtney ‖ graphics ‖ site] → ⛔push gate → handoff;
   see "The agent assembly line" above). The individual commands still work standalone:
   `/new-brief` → review → `/update-site` (gated) → `/new-instructions` (warm/neutral) →
   `/new-graphics` → publish → `/handoff`.
5. Apply the brand rules + the pre-publication review before declaring anything done. When in doubt:
   measure before asserting, paraphrase the contestation paragraph, keep the firewall verbatim,
   no named person in a critical sentence, pending beats fabricated.
