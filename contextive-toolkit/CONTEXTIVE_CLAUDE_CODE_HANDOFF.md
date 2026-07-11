# Contextive — Claude Code Handoff (v9)

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

**This session ended the signal layer's single point of failure: the measurement is no longer hostage
to the throttled GDELT DOC API. We built a resilient multi-source pipeline and migrated the coverage
measure to GDELT Web News NGrams 3.0 on BigQuery — a non-throttled, full-text (article-body-derived)
channel — then re-baselined C07 + C08 off DOC onto it and launched a new C09, so C07, C08 and C09 are
now all LIVE and measured 17/17.** All three shipped in commit **`0d512f1`** (Vercel deploy
`dpl_CE2zXu2n8onLj1iNiwu9hg5X9fQs` **READY**, aliased to contextive.info — orchestrator-verified). The
campaign lineage is now **01–09**. The old 4-hourly DOC auto-retry is **obsolete** (C07/C08 are
0-pending; it early-exits). The API + selling workstream is still **PAUSED** (folded in below).

> **BigQuery costs real money now (billing is ENABLED on Victor's `contextive-signal` project).** Web
> NGrams scans are billed on-demand at ~$6.25/TiB and are **window-bound, not term-bound** — a 180-day
> scan is ≈7.4 TiB ≈ ~$44 regardless of how many terms ride it (a 400-day scan is ≈15.9 TiB ≈ ~$99;
> figures orchestrator-reported, not re-measured this session). So **180 days is the standard window
> going forward** (extend only when a yoy read is worth the cost), and **every scan is a deliberate,
> byte-capped, cost-logged run** — combine campaigns/terms into ONE scan, and the mandatory dry-run
> byte cap must clear before any billed query. GCP key: `C:\Users\WEI\.contextive\contextive-gcp-key.json`.

### The resilient multi-source pipeline — **built + in production** (the headline)
DOC 2.0 stayed throttled (persistent HTTP 429, confirmed across four network exits in the prior
session — not our IP), so the fix was to stop depending on it. `signal_pipeline.py` (toolkit copy at
`08 Misc/.../pipeline/`) now takes **`--source {doc,bigquery,gkg-raw,wikipedia,webngrams}`** and adds:
- **`build_from_webngrams` + `build_from_bigquery`** — the coverage measure now reads **GDELT Web News
  NGrams 3.0** (`gdelt-bq.gdeltv2.webngrams`), a **full-text / body-text** channel, non-throttled. This
  is the standing replacement for the DOC single point of failure.
- **An in-code instrument firewall** — `_assign_velocity_index` (pipeline), the API's
  `_assign_velocity_percentile` (`store.py`), and `merge_never_regress` each **refuse to rank across
  instruments** (raise `ValueError`): a percentile set holds exactly ONE instrument. News **coverage**
  (`gdelt-coverage`) and reader **attention** (`wikipedia-attention`) are never mixed into one velocity.
- **Provenance on every reading** — `source` / `source_channel` / `instrument` / `methodology_version`
  (measured cards now stamp `gdelt-webngrams` / `gdelt-coverage` / `gdelt-webngrams-fulltext-v1`);
  legacy cards normalize to `gdelt-doc` / `gdelt-coverage` / `1.0`. Schema `term_cards.schema.json`
  gained the provenance fields + a `measurement.attention` sibling block.
- **A mandatory dry-run byte cap** before any billed BigQuery query, and a **calibration harness**
  (`--calibrate-from`) to check an alt channel against a DOC series.
- **A Wikipedia-pageviews attention lens** (`build_from_wikipedia`, instrument `wikipedia-attention`,
  its own `attention_velocity_index`, emitted only into `measurement.attention`) — a **separate
  labeled signal** (reader attention, not coverage), **never** folded into GDELT velocity.
- **contextive-api `store.py`** now percentiles **per-instrument** (pytest **7/7** — orchestrator-reported).

**Calibration result (orchestrator-reported, not re-run this session):** **GKG (title/theme) FAILED
0/8 — it lacks body text — so it is NOT used.** **Web NGrams (full-text) PASSED (5/8 formal; debasement
trade + hard money directionally confirmed after query-hardening).** **41 `_WEBNGRAMS_OVERRIDES`**
(variants / context / exclusions) restore recall + precision — notably **hard money re-scoped again**
(the recurring C07 off-domain-noise lesson). The `_WEBNGRAMS_OVERRIDES` machinery + the instrument
firewall + the byte cap are verified present in code this session; the calibration pass/fail counts and
the BigQuery byte/cost figures are runtime facts taken from the orchestrator's report.

### Campaign 09 — "The Language of the Real" — **LIVE, measured 17/17, end to end**
**NEW campaign, launched already measured** (the AI-authenticity / "slop" vocabulary war). Live at
`/campaigns/09-real` (slug `real`, `signalBasis: measured`). Web NGrams full-text, **180-day window,
ref 2026-07-10**.
- **Spine (measured, CONFIRMED — not a hypothesis): "slop vs synthetic: velocity vs verdict"** —
  the loudest word is not the winning one. The epithet that owns the mood is plateauing (**AI slop v50**,
  −0.7%/90d; **clanker v0**, −66%/90d) while the vocabulary that *does something* with the flood gains:
  **AI-assisted v94** (+26%/90d), and the human-proof machinery — **workslop v100** (+56%/30d, the
  fastest mover), **proof of personhood v81** (+17%), **made by humans** (+29%). The C06-"obliterated" /
  C07-"debasement trade" shape again, now measured on the AI-authenticity terrain. The divergence leads.
- **17 terms / 3 clusters (A5 / B6 / C6)** — **A** "what do we call the flood?" (slop pole) · **B**
  "how do we prove what's real?" (provenance + law) · **C** "is synthetic the new normal?" (the
  normalizing pro-synthetic counter-pole, at **equal weight** — analyzed at full weight *because* it is
  the pole measuring as faster-gaining, so "winning" never reads as endorsement). yoy reads **n/a**
  (180d window). Two high-frequency tokens were scope-verified (the hard-money discipline): authenticity
  came in mid-pack (v69), AI-generated with declining deltas (v88) — neither the runaway a broken query
  would produce.
- **Shipped:** site page **/campaigns/09-real** (`0d512f1`); brief
  `Contextive_Campaign_09_Brief.docx`. Toolkit artifacts in the `08 Misc` `data/`: `campaign09_terms.json`,
  `campaign09_cards.json` (all measured, webngrams), `campaign09_campaign.json`. Site data:
  `src/data/campaigns/09.json` + registered in `index.ts`. **Open steps:** the **warm Courtney Week-02
  doc is IN PROGRESS — not yet built** (no `campaign09_exec_doc.json` / Courtney docx exists yet); and
  Victor's editorial pass before Courtney publishes. Carousel/graphics not yet built.

### Campaign 08 — "The Language of Abundance" — **LIVE, now measured 17/17 (was all-pending)**
Was launched all-pending (DOC down); this session it was **re-measured on Web NGrams full-text (180d,
ref 2026-06-29)** and is now **17/17 measured** on the live site (`signalBasis: measured`). **The
provisional spine is CONFIRMED, not flipped:** the build-more banner is **cooling** while the scarcity
counter-vocabulary **gains** — measured "loudest ≠ winning."
- **Measured shape:** **abundance agenda v38** (−26.8%/90d — cooling), **build baby build −36%/90d**,
  **drill baby drill v0** on the build side; scarcity/counter-pole gaining (**degrowth v88**, **supply
  skepticism v94**, limits to growth, polycrisis — the higher of these are orchestrator-reported;
  abundance-agenda-cooling and YIMBY-climbing verified in the cards this session). **YIMBY v81**
  (+9.6%/90d) is the lone build-side climber. yoy **n/a** (180d).
- **Shipped/updated:** site page **/campaigns/08-abundance** refreshed to measured (`0d512f1`); brief
  `Contextive_Campaign_08_Brief.docx`; warm **`Contextive_Campaign_08_Week02_Courtney.docx`** (WARM;
  Courtney launch window **Jul 13–17**). Toolkit `campaign08_cards.json` now webngrams-measured (DOC
  version saved as `campaign08_cards.pre-webngrams-backup.json`). **Note:** `08.json` still carries the
  **hand-fixed `definingTension`** (a="Abundance", b="scarcity: velocity vs verdict") — **re-apply if
  `build-campaign.mjs` is re-run.** **Open step:** Victor's editorial pass on the warm C08 Week-02 doc
  before Courtney's Jul 13–17 launch — and, now that numbers landed, **the number-bearing carousel
  slides (esp. the pivot) should reflect the confirmed spine.** (A doc/graphics step, no new site push.)

### Campaign 07 — "The Language of Money" — **LIVE, re-baselined to full-text, measured 17/17**
Was 8/17 DOC-measured with 9 pending; this session **re-baselined onto Web NGrams full-text (400d, ref
2026-06-25)** and is now **17/17 measured** on the live site.
- **Spine HOLDS: "debasement trade: velocity vs verdict"** — the loudest word is loud because it's
  dying. **debasement trade v100** (**+622.7%/30d but −74.0%/90d**), verified in the cards.
- **hard money honestly corrected AGAIN: DOC +88.6%/90d → full-text +44.7%/90d** (v94; +33.4%/30d,
  yoy +146.2%) — the same off-domain-noise discipline (re-scoped query), now on the full-text channel.
- **The dollar-rails counter-pole is now measured** (was the priority pending): **stablecoin**,
  **tokenization** (+86% yoy — orchestrator-reported), **digital dollar** (+54%/90d — orchestrator-reported).
- **Shipped:** site page **/campaigns/07-money** refreshed to full-text 17/17 (`0d512f1`); brief
  `Contextive_Campaign_07_Brief.docx`; warm **`Contextive_Campaign_07_Week02_Courtney.docx`** + 8-slide
  carousel spec (cleared pre-pub PASS). Toolkit `campaign07_cards.json` now webngrams-measured (DOC
  version saved as `campaign07_cards.pre-webngrams-backup.json`). C07 also powers the Signal Explorer +
  `/signal`. **Open step:** Victor's editorial pass before Courtney publishes (Jun 29–Jul 3 window as
  authored). **FLAG (below):** the C07 *brief docx* still uses a money-domain firewall variant.

> **Firewall FLAG — fix the C07 brief docx.** The C07 **brief DOCX** uses a money-domain firewall
> variant ("…claim about money"); the **live site firewall is canonical** (converter-hardcoded,
> verified). Correct the C07 docx to the verbatim canonical "…underlying **politics** is correct" string
> for full non-negotiable-#2 compliance. (Orchestrator-reported; not re-opened from the binary this
> session.)

### The old DOC auto-retry — **OBSOLETE**
The Windows scheduled task **"Contextive C07 GDELT Retry"** (`retry_c07_measure.py`, every 4h) is now
**dead weight**: C07 + C08 are 0-pending, so it early-exits, and Web NGrams (not DOC) is the channel.
**It can be unregistered** (not confirmed done this session):
`Unregister-ScheduledTask -TaskName "Contextive C07 GDELT Retry" -Confirm:$false`. It never shipped to
the live site anyway (local data + log only).

### The product layer (shipped earlier; durable)
- **Velocity Card** — Contextive's signature shareable primitive: a 1080×1080 monochrome card per
  measured term (velocity + momentum sparkline + deltas + inflection + firewall). ONE shared renderer
  **`src/lib/velocityCard.js`** powers both the static generator (`scripts/build-velocity-cards.mjs`
  → `public/cards/c<nn>-<slug>.png`) and the browser, so they never drift. (Our answer to Ground
  News' "Bias Bar" — momentum, never a verdict.)
- **Card Studio** (`src/components/CardStudio.tsx`) — on `/waitlist`, customize a card's background
  (6 brand-safe presets + a custom color with luminance auto-contrast) with a live preview, then
  **Download / Share to X / Instagram / Copy link / Copy caption**. Client-side SVG→PNG export.
- **Per-term pages** — **`/signal/:slug`** (`SignalPage.tsx`): card + Studio + measured readout +
  per-term SEO meta (og:image = the term's card); unknown slug → honest "measurement pending".
  *Caveat:* meta is client-set, so full per-term social-unfurl needs build-time prerender (deferred).
- **Signal Explorer redesign** (`762c61d`) — Explore mode is a share-first **Stage** (shareable card
  hero + reading/customize/share rail + slim honest API strip).

### QA consolidation (durable) — site audited + hardened
4 parallel auditors (security · backend/build · frontend+a11y · live-responsiveness) swept 7 routes ×
6 widths + dark mode. **No blockers; build clean; no secrets in the client bundle.** Fixes shipped
(`ddb7185`, `9ab5af7`, `d779e2d`): **CSP (Report-Only — flip to enforcing after watching prod)** + HSTS
+ Permissions-Policy headers; `api/subscribe` CORS locked to contextive.info + 2 KB body cap;
velocityCard `esc()`/hex hardening; **WCAG-AA** contrast; global `:focus-visible`; reduced-motion
(Hero + scroll); WaitlistForm aria; sparkline aria-label; **6 dead components deleted**. **Deferred:**
per-IP rate-limit + captcha on subscribe (needs Vercel KV — Victor's account); flip CSP to enforcing;
542 KB code-split; `npm audit` (3 **dev-only** vulns, needs a vite major bump); deeper compare-mode tab ARIA.

### Competitor intelligence — Ground News (durable)
`competitor-analyst` teardown + ranked borrow list at `08 Misc` data/ **`Ground_News_Competitive_Teardown.md`**
(+ **`Creator_Demo_Playbook.md`**). Their moat = an industrial creator-sponsorship engine (~1,863
sponsored YouTube videos H1 2025). Our wedge = the firewall (they *adjudicate* bias/truth — we measure
velocity, structural immunity to "who decides?"). Top 3 moves: (1) creator-demo GTM around the Signal
Explorer in ONE niche (comms/PR + macro/finance, NOT saturated political YouTube), hook "the word is
winning before the verdict is in"; (2) the Velocity Card primitive (done); (3) deploy the API + per-term
SEO pages (signal pages done). **DO-NOT-COPY:** any bias/truth rating — it's the firewall line.

### API & selling workstream — **PAUSED; resume from `contextive-toolkit/CONTEXTIVE_API_STATUS.md`**
That is the living tracker (Track A = API dev, Track B = go-to-market, with done/pending/deferred).
Companions, same folder, all **held local / untracked** pending Victor's public-vs-private call:
`CONTEXTIVE_API_PLAN.md` (the build plan) and `CONTEXTIVE_PRICING_DISCOVERY.md` (a Van-Westendorp
call script). **Shipped LIVE on contextive.info in the prior (API) session** (commits `892cf78` →
`0c10cd7` → `0430461` → `774bd70` → `661f343`, all Vercel **READY**):

- **Positioning realigned off the finance over-claim** to the honest neutral product — "velocity,
  not verdict," across politics, the economy, AI, and culture. Hero, Footer, and all `index.html`
  metadata rewritten.
- **SEO / disambiguation:** accurate `<title>`/description + `<link rel=canonical>` + JSON-LD
  (Organization + WebSite + `sameAs`) to separate us from the other "Contextive"s — the
  domain-driven-design dev tool at **contextive.tech** (+ its VS Code extension) and the
  Microsoft-365 workspace at **contextive.com**. OG share card `public/og-image.png` (generator
  `scripts/build-og-image.mjs`, `npm run build:og`).
- **`/waitlist` — the API product page,** redesigned around an interactive **Signal Explorer**
  (`src/components/SignalExplorer.tsx`): click a measured term → the card animates to its real
  reading; toggle **Compare** for the `compare()` head-to-head. Real measured data only, via
  `scripts/build-api-demo.mjs` → `src/data/apiDemo.ts`. "API" nav link; animated API teaser on the
  homepage (`ApiTeaser.tsx`).
- **Live early-access pricing** (on the page): Free **$0** / Starter **$39** / Pro **$149** /
  Enterprise **custom (from $999)**; two-axis = tier quota + metered overage. Deliberately
  lower-end-to-learn (Victor's call); validate with the discovery script before treating as final.
- **Combined waitlist + Substack capture** — `WaitlistForm.tsx` records the email to our list
  (tagged by `source`) AND opens Substack in one action. `api/subscribe` hardened: returns `stored`
  and logs a warning when no durable store is configured.
- **Mobile-overflow fix (lesson, see Environment):** the Explorer cards overflowed on real phones
  though the preview looked fine; fixed by making every mobile grid column explicitly shrinkable
  (`grid-cols-1` ahead of the `sm:`/`lg:` variants) + `min-w-0` down the card chain.
- **API service scaffold — `contextive-api/`** (sibling of `contextive-site/`, **its OWN local git
  repo**; **NOT on GitHub, NOT deployed**). FastAPI **Phase-1 read-only** over a precomputed seed.
  Endpoints `/v1/health`, `/v1/terms/{phrase}` (unknown → honest `pending`), `/v1/compare`. **Now
  percentiles per-instrument** (this session's firewall work); **7 passing tests** (`pip install -r
  requirements.txt` then `python -m pytest`). Regenerate its seed with `python -X utf8 scripts/build_seed.py`.

**Domain decision (Victor):** market as the word **"Contextive"** — no TLD suffix in branding. The
canonical site address stays **contextive.info** (the owned domain; required in canonical/og tags).
**`contextive.ai` is owned by a third party — never use it as our URL or brand.** Instagram
rebranded to **instagram.com/contextive.info** (live). X handle is still `@contextive_ai` (open
question — leave or rebrand).

**Two pending manual steps (need Victor's accounts — can't be automated here; no `gh` CLI on the box):**
1. **Durable signup capture** — until wired, signups sit only in ephemeral Vercel runtime logs.
   Create a Google Sheet, deploy `contextive-site/scripts/subscribe-sheet.gs` as a Web app, set
   `SUBSCRIBE_WEBHOOK_URL` in Vercel, redeploy. Steps: `contextive-site/scripts/SUBSCRIBE_SETUP.md`.
   *(Most urgent — the live waitlist is already taking signups.)* Wiring re-verified in a prior session
   (`api/subscribe.ts` POSTs `{email,ts,source}` matching `subscribe-sheet.gs`) — Victor's account steps only.
2. **Deploy `contextive-api`** (push to a GitHub repo + host on Render/Railway/Fly), then set
   `VITE_CONTEXTIVE_API_URL` (+ optional `VITE_CONTEXTIVE_API_KEY`) on the **site's** Vercel project →
   the `/waitlist` sample/explorer becomes a live round-trip (the wiring is already shipped).

### Campaigns (durable)
- **NINE campaigns are live.** Full-text 17/17: **C09 `/campaigns/09-real`**, **C08 `/campaigns/08-abundance`**,
  **C07 `/campaigns/07-money`** (all re-based on / launched on Web NGrams this session). Earlier
  DOC-measured (partial): C06 — "The Language of the Iran War" at `/campaigns/06-iran-war`, defining
  tension **"obliterated" vs "ceasefire"** (measured: the victory word collapsed — velocity 0, −63%/90d
  — while "ceasefire" is the runaway — velocity 100, +425%). The site shows **measured** numbers,
  never the brief's.
- **Measured coverage:** **C07 17/17, C08 17/17, C09 17/17** (Web NGrams full-text). Still partial
  DOC-measured: **C03 6/17, C04 5/17, C05 9/17, C06 9/17** — the rest render **"measurement pending."**
  A future top-up can **re-baseline C03–C06 onto Web NGrams** (cost is window-bound — combine them into
  one scan). Merge bases seeded: `campaign04_cards.json` incl. `primary challenger`; `campaign05_cards.json`
  incl. `K-shaped` (**note C05 base used ref-date 06-21 vs the live 06-09; re-seed at 06-09 if
  resuming**). **C03 has not been re-run — do not assume a C03 result.**
- **Instrument note:** C07/C08/C09 are `gdelt-coverage` via the **webngrams** channel; C03–C06 are
  `gdelt-coverage` via the **doc** channel. Within-campaign velocity percentiles are valid; **absolute
  density is DOC-comparable only pending calibration** (labelled that way on every card). Never mix
  channels into one percentile set — the in-code firewall enforces this.
- **Measurement divergence (flag every time):** measured data reverses several hand-built brief figures
  (e.g. C03 "seed oils" brief +617%/surging vs measured fading; C04 "America First" brief +75% vs
  measured negative). The site/briefs show measured, never the brief's.

### Open threads
1. **C09 finish the cadence** — the newest campaign is measured + live, but the **warm Courtney Week-02
   doc is not yet built** (no `campaign09_exec_doc.json` yet), and the carousel/graphics aren't built.
   Build the warm exec doc + carousel from the measured `campaign09_cards.json`, then Victor's editorial
   pass before Courtney publishes. Lead every piece with the measured divergence (loudest ≠ winning).
2. **C08 publish** — Victor's **editorial pass** on the warm C08 Week-02 doc before Courtney's **Jul
   13–17** launch; and now that C08 is measured, **refresh the number-bearing carousel slides (esp. the
   pivot)** to the confirmed abundance-vs-scarcity spine before she builds.
3. **C07 publish + fix the brief docx firewall** — Victor's editorial pass on the warm Week-02 doc +
   8-slide carousel (Jun 29–Jul 3 window as authored); and **correct the C07 brief docx firewall
   variant to the canonical "…politics is correct" string** (FLAG above).
4. **BigQuery / Web NGrams operating discipline** — every scan is billed (~$6.25/TiB), window-bound
   (180d ≈ ~$44), byte-capped, cost-logged; combine campaigns/terms into one scan. **Complete the DOC
   calibration of the full-text coverage proxy** so absolute density is directly comparable across
   channels (harness: `--calibrate-from`). Optionally re-baseline C03–C06 onto Web NGrams in one scan.
5. **Unregister the obsolete DOC auto-retry** (`"Contextive C07 GDELT Retry"`) — C07/C08 are 0-pending;
   command in the "old DOC auto-retry" block.
6. **QA deferrals** — flip CSP **Report-Only → enforcing** after watching prod; per-IP rate-limit +
   captcha on `api/subscribe` (needs **Vercel KV** — Victor's account); 542 KB code-split; `npm audit`
   (3 dev-only, needs a vite major bump).
7. **Per-term social-unfurl** — `/signal/<term>` meta is client-set, so non-JS crawlers see the index
   defaults; add build-time prerender if shared `/signal` links must unfurl with the term's card.
8. **Creator-demo GTM** (Ground News Move #1) — Victor to greenlight outreach (**gated**); wire
   **durable signup capture** FIRST so the funnel actually captures.
9. The API workstream's **two pending manual steps** (durable signups; deploy the API) — see
   `CONTEXTIVE_API_STATUS.md`. Plus **public vs private** for the three local API docs.
10. **X handle** `@contextive_ai` — leave or rebrand to match the `.info` brand.
11. **Agent-Reach OSS — evaluated, NOT adopted** (recorded to memory). Cherry-pick the underlying tools
    (Exa / yt-dlp / Jina / gh) off-box later when trend-scouting starts — do not adopt the package.
12. **MediaCloud / GCP extras** — MediaCloud free key is an optional 2nd coverage corpus; Google Trends
    was **rejected** (non-reproducible + a different instrument).

## How to work in this repo (read this)
- **Open the next session in `E:\Contextive\06 Website Code\contextive-source\contextive-source`
  (the parent) — the same folder this session used. Everything works from here:** `CLAUDE.md`, the
  `.claude/` slash commands + skills, the site under `contextive-site/`, the API scaffold under
  `contextive-api/`, the toolkit at `08 Misc`, git push, and the local preview all function.
  (`contextive-site/` is the canonical git repo where `.claude/` lives natively; the parent carries
  a working mirror.)
- Slash commands register at **session start** — they won't appear if added mid-session.
- **Writing to the live site is gated on Victor by default** (prepare the diff → preview → he
  pushes). This session he again granted push authority and authorized the C07/C08/C09 push above;
  that grant is **per-session, not standing** — **default back to gated next session unless he says
  so.** The push runs under Victor's local git creds (commits show "Victor Wei").
- **BigQuery runs cost real money** (billing enabled). Do a dry-run byte estimate first, keep to the
  180d window unless yoy is worth it, and combine terms/campaigns into one scan. Never fire a billed
  query casually.

## The agent assembly line (campaign cadence as sub-agents)
The campaign cadence runs as **dedicated sub-agents** in `.claude/agents/` (canonical in
`contextive-site/.claude/agents/`, mirrored to the parent `.claude/agents/`). Each owns one stage,
reads the canonical skill + its `/command` for process (no duplication, no drift), applies the
non-negotiables, and returns a **structured report** to the orchestrator (the main session).
**Agents report to the orchestrator; the orchestrator reports to Victor.** **C07 was the first
campaign run end to end through this line, C08 the second, C09 the third — it works** (both human
gates held every time: the warm/neutral tone call and the live-site push gate). C08 proved the line
stays honest under a broken data source (all-pending rather than estimated); this session proved it can
**repair its own instrument** — a research + adversarial-audit workflow drove the api-engineer to build
the resilient full-text pipeline (all steps audited PASS) and then re-baseline three campaigns on it.
**13 agents** (canonical `contextive-site/.claude/agents/`, mirrored to the parent; orchestrator command
`.claude/commands/campaign.md`).

**Campaign line (6):**
- **signal-measurer** — finds ~17 terms, writes terms.json, runs the pipeline (now `--source webngrams`
  by default via BigQuery), top-up merges (never regress). The "measure, don't estimate" engine.
- **brief-author** — campaign.json scaffold + builds/validates the brief docx; lets the measured numbers choose the spine.
- **courtney-instructions** — Week 02 exec doc + Claude Design prompts from measured cards (needs Victor's warm/neutral tone call).
- **campaign-graphics** — carousel slide spec + per-card Claude Design prompts from measured cards.
- **site-publisher** — builds the campaign page + local preview, prepares the diff, then **STOPS at the push gate** (the push is Victor's).
- **handoff-scribe** — refreshes this handoff at campaign end.

**Company line (7):**
- **competitor-analyst** — rival teardown + ranked borrow list mapped to our brand/firewall (did Ground News).
- **trend-scout** — surfaces the next vocabulary war (candidate campaigns) to feed signal-measurer.
- **pre-pub-reviewer** — the PASS/FLAG/BLOCK gate on any deliverable against the six non-negotiables.
- **growth-analyst** — funnel / SEO / waitlist read + ranked growth moves (produced the creator playbook).
- **pricing-researcher** — runs the Van-Westendorp discovery → tier/price recommendation.
- **api-engineer** — owns the `contextive-api/` build **and the pipeline infra** (built the resilient multi-source pipeline this session); never deploys without Victor.
- **brand-copy-editor** — sweeping brand-voice copy passes (shorten, de-jargon, enforce style rules).

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
  `contextive-toolkit/` holds **docs only**. **Inputs:** C05–C09 term+campaign+cards JSON are in the
  `08 Misc` `data/` (C07/C08/C09 measured cards are webngrams; DOC versions saved as
  `campaign0X_cards.pre-webngrams-backup.json`); **C03/C04 live in the *original*
  `E:\Contextive\files\contextive-toolkit\contextive-toolkit\data\`** (NOT 08 Misc).
- **Measurement now runs on GDELT Web News NGrams 3.0 (full-text) via BigQuery — `--source webngrams`.**
  Requires Victor's GCP: key `C:\Users\WEI\.contextive\contextive-gcp-key.json`, project
  `contextive-signal`, BigQuery **billing ENABLED** (`pip install google-cloud-bigquery`). **It costs
  real money** (~$6.25/TiB, on-demand): a **dry-run byte cap is mandatory** before any billed query;
  cost is **window-bound not term-bound** (180d ≈ 7.4 TiB ≈ ~$44 = the standard; 400d ≈ 15.9 TiB ≈
  ~$99, use only when yoy is worth it) → **combine campaigns/terms into ONE scan.** Measure each
  campaign as-of its own moment with `--ref-date`: C03 `2026-05-04`, C04 `2026-05-25`, C05 `2026-06-09`,
  C06 `2026-06-21`, C07 `2026-06-25`, C08 `2026-06-29`, C09 `2026-07-10`.
- **GDELT DOC 2.0 (`--source doc`) is still throttled server-side** (persistent 429, confirmed across
  four exits in the prior session — not our IP). Do NOT repeat the IP-switching dance; the migration to
  Web NGrams is the fix. GKG (title/theme) does NOT work for this — it lacks body text (failed
  calibration 0/8). The Wikipedia lens (`--source wikipedia`) is a **separate instrument**
  (reader attention, `measurement.attention`), never mixed into GDELT velocity.
- `velocity_index` is a within-set percentile (recomputes when the set changes; extremes stay 0/100).
  For top-ups, **merge best-of-both and never regress** a campaign's measured set. **Disambiguate noisy
  tokens and verify a surprising surge** before it becomes the spine — the recurring lesson: C07 "hard
  money" read a false +277%/90d (DOC) from off-domain noise and was corrected to +88.6% (DOC), then to
  +44.7% on full-text; 41 `_WEBNGRAMS_OVERRIDES` (esp. hard money, again) restore recall/precision.
- **`contextive-api/` deps:** `pip install -r requirements.txt` (fastapi, uvicorn, pydantic, pytest,
  httpx). Tests: `python -m pytest` (7/7). Regenerate its seed with `python -X utf8 scripts/build_seed.py`.
- **Preview (Claude_Preview) — several traps hit before:**
  - The pane sometimes reports a **collapsed width** (`window.innerWidth` ≈ 90–105px) right after a
    navigation — bogus. Use `preview_resize` with an explicit `width`/`preset` and **verify
    `window.innerWidth`** before trusting any overflow measurement.
  - **Fonts fall back** in the preview, so text is narrower than on a real device — **mobile overflow
    can be invisible here.** Make layouts robust (`grid-cols-1` + `min-w-0`) and **stress-test** by
    injecting a wide element (`min-width:600px`) and confirming `document.documentElement.scrollWidth`
    stays == viewport.
  - **Screenshots time out** on animated pages — verify via DOM / `getBBox` + `npm run build` instead.
  - After **deleting a component** mid-session, Vite HMR logs stale "failed to reload" errors —
    `preview_stop` → `rm -rf node_modules/.vite` → `preview_start` to clear; production build unaffected.
- **Vercel:** team `team_QmqXaFOedaDKjV8Fix000nkc`, project `prj_vG2F3INghrWd8trVkfM0znEmYB7X`
  (`contextive-site-test`, Vite). Push `main` → auto-deploy. Verify via the connector;
  `get_deployment` on the branch alias `contextive-site-test-git-main-contextive-ai.vercel.app`
  **lags** one build behind — to confirm the *latest* commit fast, use `list_deployments` with a
  `since` timestamp. **Repo is PUBLIC** (Victor's call); **setting it PRIVATE blocks the deploy**
  (BLOCKED) until Vercel's GitHub App access is re-granted.

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
   guessed. A measured number that kills a narrative IS the story — flag it before shipping. **Qualitative
   reads are never measurements:** no count, engagement tally, or velocity claim from any web/social read
   may enter a signal field, `cards.json`, a Velocity Card, a `/signal` page, or the API — those carry
   measured values or stay `pending`. **One instrument per percentile:** never mix coverage
   (`gdelt-coverage`) and attention (`wikipedia-attention`) into one ranking (enforced in code).
2. **Firewall, verbatim** (above).
3. **No named person in a critical sentence** — quote patterns of speech, never an individual.
4. **Equal weight across the three clusters**; paraphrase each term's contestation paragraph.
5. **No visual partisanship:** monochrome/typographic, no candidate imagery, no red/blue palette.
6. **Pre-publication review on every ship day** → PASS/FLAG/BLOCK (partisan tilt, named-person,
   voice leak, numerical accuracy, headline misread). Any BLOCK is a hard stop; never cut for time.
7. Tone of Courtney docs is Victor's per-campaign call.

## Campaign lineage
01 geopolitics · 02 AI & work · 03 bodies & food (MAHA/GLP-1) · 04 primaries (May 19 2026) ·
05 the economy (defining tension "soft landing" vs "vibecession") · 06 the Iran war (defining tension
"obliterated" vs "ceasefire") · 07 the language of money (crypto/money vocabulary war; defining tension
"debasement trade: velocity vs verdict" — 17/17 full-text; the loudest word loud because dying) ·
08 the language of abundance (the abundance-agenda vocabulary war — YIMBY, zoning/permitting reform,
build/drill baby, vs a scarcity counter-pole of degrowth/limits to growth/supply skepticism/polycrisis;
defining tension "abundance vs scarcity: velocity vs verdict" — 17/17 full-text, spine CONFIRMED: the
build-more banner cooling while scarcity vocab gains, YIMBY the lone build-side climber) · **09 the
language of the real** (the AI-authenticity / "slop" vocabulary war — a pejorative slop pole, a
provenance-and-law machinery, and a normalizing pro-synthetic counter-pole; defining tension "slop vs
synthetic: velocity vs verdict" — 17/17 full-text: the epithet plateaus [AI slop v50, clanker v0] while
the applied vocabulary gains [AI-assisted v94, workslop v100, proof of personhood v81]). Per campaign:
research brief (17 cards / 3 clusters / 7 signal fields) → Week 01 "trailer" → Week 02 launch (2
Substack, 2 X threads, 1 carousel over 8 working days) → editorial passes → optional ads. Brief
releases a week ahead; the mid-Week-02 weekend is a hard reset.

## The signal layer + why we measure
The differentiator is the signal layer; credibility depends on the numbers being real. A C04 audit
found the hand-built numbers off in magnitude and timing; C06 reshaped its spine around the measured
collapse of "obliterated"; **C07 was the example twice over** (the measured −74%/90d unwind of
"debasement trade" set the spine, and a false surge on "hard money" was caught and corrected — first
DOC +277%→+88.6%, then full-text +44.7%). **C08 proved the discipline from the opposite direction** —
with DOC down it shipped **all-pending** rather than estimate, then measured cleanly once the channel
was fixed and **confirmed** its provisional spine. **This session the signal layer repaired its own
instrument:** DOC stayed throttled, so the coverage measure migrated to **GDELT Web News NGrams 3.0
(full-text) on BigQuery** — non-throttled, body-text-derived — and C07/C08/C09 all measured 17/17 on
it. A hard rule fell out of it: **one instrument per percentile** — news coverage (`gdelt-coverage`)
and reader attention (`wikipedia-attention`) are labelled and never mixed, enforced in code. Seven
fields: platforms, corpus density (a labelled full-text coverage proxy, DOC-comparable pending
calibration), velocity index 0–100 (within-set percentile), inflection points (dated z-peaks),
sentiment −5..+5, co-occurrence, adoption stage. **The API exposes the same fields**, but replaces the
within-set index with an absolute reference-universe `velocity_percentile` (API_PLAN §3.2), now
computed **per-instrument**.

## The toolkit
`pipeline/signal_pipeline.py` — GDELT measurement engine, now **multi-source**:
`--source {doc,bigquery,gkg-raw,wikipedia,webngrams}`, `--terms`/`--demo`/`--from-raw`, `--ref-date`,
`--calibrate-from`. **webngrams** (`build_from_webngrams` over `gdelt-bq.gdeltv2.webngrams`) is the
production coverage channel; **wikipedia** (`build_from_wikipedia`) is the separate attention lens; the
instrument firewall lives in `_assign_velocity_index` + `merge_never_regress`; 41 `_WEBNGRAMS_OVERRIDES`
tune noisy terms; a mandatory dry-run byte cap guards every billed query. `generators/build_brief.js`
+ `build_exec_doc.js` (house-style docx), `generators/lib/house_style.js`, `schema/*.json` (now with
provenance + `measurement.attention`), `data/`. **Site generators** (in `contextive-site/scripts/`):
`build-campaign.mjs` (campaign.json + cards.json → `src/data/campaigns/<nn>.json`), `build-api-demo.mjs`
(→ `apiDemo.ts`), `build-og-image.mjs` (→ the OG card). Run with `python -X utf8` / `node`. Top-up merge
helper: `scratchpad/merge_c06.py` (and `merge_c07.py`).

## The website + ship loop
Per-campaign data-driven architecture: unified contract `src/data/campaign.ts`; converter
`scripts/build-campaign.mjs`; react-router routes `/campaigns/<nn>-<slug>`, `/how-it-works`,
`/waitlist` (the API product page) + a Vercel SPA rewrite in `vercel.json`. Homepage = Hero + campaign
index + methodology teaser + **API teaser** + subscribe CTA. `SignalCard` renders measured / pending /
editorial. Campaigns 01–02 reconcile from legacy `src/data/terms.ts`; **03–09 are JSON in
`src/data/campaigns/`** (each registered in `index.ts`; 09 added this session; 07/08 refreshed to
full-text; 08's `08.json` carries a hand-fixed `definingTension` to re-apply if `build-campaign.mjs` is
re-run). Key components: `SignalExplorer.tsx`, `WaitlistForm.tsx`, `ApiTeaser.tsx`, `Nav.tsx`. **Loop:**
edit repo → `npm run build` / preview → commit + push to `main` (push is **Victor's action / gated** by
default) → Vercel auto-builds → verify via the connector + contextive.info. `/update-site <nn>` runs
this for a campaign.

## Boot sequence (next session)
1. `CLAUDE.md` auto-loads this handoff + the `contextive-campaign` skill; project memory auto-recalls
   (`resilient-signal-pipeline`, `campaign-08-abundance`, `api-and-positioning`, etc.).
2. Read **Resume here**. **If resuming the API / selling workstream, open
   `contextive-toolkit/CONTEXTIVE_API_STATUS.md` first.** Otherwise confirm what's measured vs pending
   and pick up the campaign open threads (C09 finish the cadence; C07/C08 publish + the C07 docx firewall fix).
3. The pipeline + generators run directly from the `08 Misc` toolkit copy (`python -X utf8`); the
   coverage channel is **`--source webngrams`** (BigQuery — costs money, byte-cap first); the API
   scaffold runs from `contextive-api/` (`pip install -r requirements.txt`, `python -m pytest`). Use
   each campaign's own `--ref-date`.
4. New campaign: **`/campaign <nn> <topic>`** drives the whole agent assembly line (measure →
   brief → ⛔Victor review + tone → fan out [Courtney ‖ graphics ‖ site] → ⛔push gate → handoff).
   Individual commands still work standalone: `/new-brief` → review → `/update-site` (gated) →
   `/new-instructions` (warm/neutral) → `/new-graphics` → publish → `/handoff`.
5. Apply the brand rules + the pre-publication review before declaring anything done. When in doubt:
   measure before asserting, one instrument per percentile, paraphrase the contestation paragraph, keep
   the firewall verbatim, no named person in a critical sentence, pending beats fabricated.
