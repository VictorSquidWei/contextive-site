# Contextive — Claude Code Handoff (v5)

**Owner:** Victor · **Live site:** contextive.info · **Repo:** `github.com/VictorSquidWei/contextive-site` (currently **public**)

Standing orientation for a fresh session. Read the **Resume here** block first; everything below it
is durable context. Keep the non-negotiables and the firewall verbatim.

> Note on dating: the session clock read **2026-06-24** while this session's commits/docs were
> stamped 2026-06-22 — treat the **commit hashes** below as the source of truth, not the dates.

---

## Resume here — current state

**This session built the API + selling workstream end to end on the site and stood up the API
service scaffold; it is now PAUSED awaiting two manual setup steps that need Victor's accounts.**
The prior session's campaign work (C06 + methodology page) is intact and folded in below.

### API & selling workstream — **resume from `contextive-toolkit/CONTEXTIVE_API_STATUS.md`**
That is the living tracker (Track A = API dev, Track B = go-to-market, with done/pending/deferred).
Companions, same folder, all **held local / untracked** pending Victor's public-vs-private call:
`CONTEXTIVE_API_PLAN.md` (the build plan) and `CONTEXTIVE_PRICING_DISCOVERY.md` (a Van-Westendorp
call script). **Shipped LIVE on contextive.info this session** (commits `892cf78` → `0c10cd7` →
`0430461` → `774bd70` → `661f343`, all Vercel **READY**):

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

### Campaigns (durable — from the prior session, still live)
- **All SIX campaigns are live.** C06 — "The Language of the Iran War" at `/campaigns/06-iran-war`,
  defining tension reframed to **"obliterated" vs "ceasefire"** (measured: the victory word
  collapsed — velocity 0, −63% 90d — while "ceasefire" is the runaway — velocity 100, +425%,
  spreading). Site shows **measured** numbers, never the brief's.
- Measured coverage is partial (GDELT): **C03 6/17, C04 5/17, C05 9/17, C06 9/17**; the rest render
  **"measurement pending."** Campaigns sit near their GDELT-measurable ceilings for their fixed
  windows; marginal gains come only from accumulating GDELT's *union* across many spaced runs.
  Merge bases seeded: `campaign04_cards.json` incl. `primary challenger`; `campaign05_cards.json`
  incl. `K-shaped` (**note C05 base used ref-date 06-21 vs the live 06-09; re-seed at 06-09 if
  resuming**). **C03 has not been re-run — do not assume a C03 result.**
- **Measurement divergence (flag every time):** live GDELT reverses several hand-built brief figures
  (e.g. C03 "seed oils" brief +617%/surging vs measured fading; C04 "America First" brief +75% vs
  measured negative). The site/briefs show measured, never the brief's.

### Open threads
1. The **two pending manual steps** above (durable signups; deploy the API).
2. **Public vs private** for the three local API docs (`CONTEXTIVE_API_PLAN.md`,
   `CONTEXTIVE_API_STATUS.md`, `CONTEXTIVE_PRICING_DISCOVERY.md`) — currently untracked/local.
3. **X handle** `@contextive_ai` — leave or rebrand to match the `.info` brand.
4. **This handoff was previously uncommitted-modified** in the working tree (a v3→v4 edit that never
   got committed); this v5 rewrite supersedes it — **commit it.**
5. **Measurement union-accumulation** — resume the slow grind for marginal new terms, or accept
   current coverage as the practical ceiling (Victor's call).
6. **C06 Week-02 publishing** is Courtney's to run on the warm exec doc; refresh carousel velocity
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
  `2026-05-04`, C04 `2026-05-25`, C05 `2026-06-09`, C06 `2026-06-21`. `velocity_index` is a
  within-set percentile (recomputes when the set changes; extremes stay 0/100). For top-ups, **merge
  best-of-both and never regress** a campaign's measured set (`scratchpad/merge_c06.py` pattern).
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
05 the economy (defining tension "soft landing" vs "vibecession") · **06 the Iran war** (28 Feb–17
Jun 2026 war + the 17 Jun ceasefire MOU; defining tension "obliterated" vs "ceasefire"). Per
campaign: research brief (17 cards / 3 clusters / 7 signal fields) → Week 01 "trailer" → Week 02
launch (2 Substack, 2 X threads, 1 carousel over 8 working days) → editorial passes → optional ads.
Brief releases a week ahead; the mid-Week-02 weekend is a hard reset.

## The signal layer + why we measure
The differentiator is the signal layer; credibility depends on the numbers being real. A C04 audit
found the hand-built numbers off in magnitude and timing; C06 is a fresh example — the measured
collapse of "obliterated" reshaped the whole campaign spine. Live measurement is the default. Seven
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
measured / pending / editorial. Campaigns 01–02 reconcile from legacy `src/data/terms.ts`; 03–06 are
JSON in `src/data/campaigns/`. Key newer components: `SignalExplorer.tsx`, `WaitlistForm.tsx`,
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
4. New campaign: `/new-brief <nn> <topic>` → review → `/update-site <nn>` (gated preview → Victor
   pushes) → `/new-instructions <nn>` (warm/neutral) → `/new-graphics <nn>` → publish → `/handoff`.
5. Apply the brand rules + the pre-publication review before declaring anything done. When in doubt:
   measure before asserting, paraphrase the contestation paragraph, keep the firewall verbatim,
   no named person in a critical sentence, pending beats fabricated.
