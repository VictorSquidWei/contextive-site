# Contextive — Claude Code Handoff (v2)

**Purpose:** bring this Claude Code session up to full operating capacity on Contextive — the
campaigns, the data pipeline, the document generators, and the live website. The project is
moving here from web chat because this is where it can actually *run*: the pipeline reaches GDELT,
git/Vercel auth is local, and the files persist.

This folder (`contextive-toolkit/`) is self-contained. Read order:
`CONTEXTIVE_CLAUDE_CODE_HANDOFF.md` (this) → `CONTEXTIVE_CAMPAIGN_SKILL.md` (process manual) →
`README.md` (runbook) → `web/WEBSITE_INTEGRATION.md` (site).

**Owner:** Victor · **Live site:** contextive.info · **Repo:** `https://github.com/VictorSquidWei/contextive-site.git`

---

## Session update — 2026-06-21 (site revamp shipped, config installed)

Treat this as current; the sections below are the original orientation.
- **Website revamp shipped + live.** The site is now data-driven per-campaign: a unified contract
  (`src/data/campaign.ts`), a converter (`scripts/build-campaign.mjs`: `campaign.json` + `cards.json`
  → `src/data/campaigns/<nn>.json`), react-router routes `/campaigns/<nn>-<slug>` + a Vercel SPA
  rewrite, a simplified homepage index, and an upgraded `SignalCard` (measured / pending / editorial).
  Campaigns 01–02 are reconciled from the legacy `src/data/terms.ts` via `src/data/legacy.ts`. All
  five campaigns are live on contextive.info.
- **03/04/05 built + measured.** C03 (Bodies & Food) and C04 (Primaries — firewalled, no named
  person on the public page) authored from the briefs and live-measured; C05 (Economy) at **9/17
  measured, 8 pending**. Coverage is partial because **GDELT rate-limits this client hard
  (~5–7 terms/run)**; the rest render "measurement pending" and fill via spaced top-up runs.
- **Divergence flagged.** Live GDELT reverses several brief figures (the briefs over-stated
  momentum on ~half the terms) — e.g. C03 "seed oils" brief +617%/surging vs measured −40%/fading;
  C04 "America First" brief +75% vs −14%. The site shows **measured** numbers, never the brief's.
- **Email capture rebuilt.** `api/subscribe.ts` records to our own list (webhook/KV hook + log) and
  forwards to Substack; the form opens Substack prefilled and always confirms. Footer → Seattle.
- **Config pack installed** (this `CLAUDE.md` + `/handoff` `/new-brief` `/new-instructions`
  `/new-graphics` `/update-site` + the `contextive-campaign` skill), with the Claude Design media
  pipeline baked into `/new-instructions` + `/new-graphics`. **The repo was set to PRIVATE** before
  committing the config (it carries internal material). Commands live in `contextive-site/.claude/`
  — open Claude Code with `contextive-site` as the folder to see them.
- **Environment quirk:** the toolkit's *code* (pipeline/, generators/) is not on the shell-executable
  disk here — only `data/`. The pipeline runs from a materialized copy in the session scratchpad;
  the docx generators would need the same. Use `python` (not `python3`) on this Windows box.
- **Open threads:** finish C05 measurement (re-verify vibecession/greedflation + the 8 pending),
  top up C03/C04 pending, and regenerate the C05 brief docx once the generators are materialized.

## 0. This session's operating capacity (what's wired up)

- **Run the pipeline for real.** `pipeline/signal_pipeline.py` reaches GDELT from this machine —
  no browser workaround. `python3 pipeline/signal_pipeline.py --terms data/campaign05_terms.json
  --out data/campaign05_cards.json`. (The web sandbox couldn't reach GDELT; that's the main reason
  the project moved here.)
- **Operate the website.** The **Vercel connector is fully set up** in this Claude Code app: read
  projects/deployments/build logs and verify deploys. Team `team_QmqXaFOedaDKjV8Fix000nkc`,
  project `prj_vG2F3INghrWd8trVkfM0znEmYB7X` (`contextive-site-test`, Vite).
- **Commit + ship.** Victor's Claude Code has **personal plugins for commit + GitHub** — use them
  for the commit/push step. The repo is Git-connected to Vercel, so **push to `main` →
  auto-deploy.** The push is Victor's action (his credentials); Claude Code prepares the diff and
  drives the plugin, then verifies via the Vercel connector + browser.
- **Generate documents.** `generators/build_brief.js` and `generators/build_exec_doc.js` produce
  the house-style brief and Courtney doc; both validate. `npm install` once (docx@9.6.1).

So this instance can: measure a campaign → generate its brief and Courtney doc → build/update the
site → ship it. Everything below is the context for doing that well.

---

## 1. What Contextive is

A **language-intelligence brand**. It tracks how specific vocabulary gains momentum, shifts
meaning, and wins cultural arguments — often before the evidence matures. Framing: an intelligence
archive about **velocity, not verdict**. Campaigns publish across **Substack, X, Instagram**.

**Positioning + firewall (verbatim, don't improvise):**
> "We track how the words have been used and how fast they are winning, not whether the underlying
> politics is correct."

Presence: site **contextive.info**; Substack `open.substack.com/pub/contextive`; X
`x.com/contextive_ai`; Instagram `www.instagram.com/contextive.ai`. (Earlier planning said
`contextive.ai`; the live domain is **`.info`**.)

## 2. Roles

- **Victor** — owner: research briefs, strategy, infra, pipeline. Signs off on every brief and
  Courtney doc. Requests a post-completion audit after major deliverables.
- **Courtney** — execution: publishing, visual/Instagram, scheduling, engagement. Drafts with
  ChatGPT (你的好朋友). Moving from Canva → Claude Design for social assets. Stronger on visual than
  technical writing.

**Tone of Courtney docs:** warm by default (宝宝, asides, end-of-day notes); neutral when Victor
asks. C04 was neutral; **C05 reverted to warm** per his explicit request — treat tone as his
per-campaign call. The `tone` field in `exec_doc.json` toggles it.

## 3. Non-negotiable brand rules

Outrank everything except safety; tighten on political/medical topics.

- Voice: minimal, analytical, evenhanded — analyst tracking a vocabulary war, never an op-ed.
- Charged terms get scare quotes on first use, analyst-tracked after.
- **No named person in a critical sentence.** Quote patterns of speech, never a person.
- **Equal weight** across clusters; each term's contestation paragraph *is* the position —
  paraphrase from it.
- Visual partisanship forbidden: no candidate photos, no party logos, no red/blue palette;
  monochrome typographic cards.
- **Pre-publication review** on every ship day → PASS/FLAG/BLOCK per category (partisan tilt,
  named-person, voice leak, numerical accuracy, headline misread). Any BLOCK is a hard stop;
  never cut for time. (The exec-doc generator renders this block automatically on `is_ship_day`.)

## 4. Campaign lineage

| # | Topic | Anchor |
|---|---|---|
| 01 | Geopolitics vocabulary | reciprocal, ceasefire, de-risking, proxy war… |
| 02 | AI & Work vocabulary | agentic, promptwashing, AI slop, vibe coding… |
| 03 | The Language of Bodies and Food | MAHA / GLP-1 / health |
| 04 | The Language of Primaries | May 19, 2026 US primaries |
| 05 | The Language of the Economy | June 2026 inflation re-acceleration — **in progress** |

**Per campaign:** research brief (17 cards / 3 clusters, 7 signal fields each) → Week 01 "trailer"
→ Week 02 launch (2 Substack, 2 X threads, 1 carousel over 8 working days) → editorial passes →
optional ads. Brief releases one week ahead; the mid-Week-02 weekend is a hard reset.

**Victor is attaching the Campaign 03, 04, 05 briefs to this session** so it can build their
content into the website (see §8).

## 5. Signal layer — measure, don't estimate

The differentiator is the signal layer, and credibility depends on the numbers being real. A C04
audit found the hand-built numbers were off in magnitude *and* timing ("MAGA Warrior" measured
~+1,714% YoY, not ~+600%, peaking early March not primary night; "endorsement machine" +767% on
tiny volume; "principled" flat, not the +164% a whole post was built on). **Victor accepted that
live measurement is the default.** Pending beats fabricated; if a measured number kills a planned
narrative, that's the story — flag it before shipping.

Seven fields, sourced: platforms (editorial + GDELT domains) · corpus density (GDELT
coverage-intensity proxy, *labelled as a proxy*) · velocity 0–100 (within-set percentile of
30d-mean ÷ 90d-baseline) · inflection points (z-score peaks, dated) · sentiment −5..+5 (clamped
GDELT tone) · co-occurrence (GDELT context / editorial) · adoption stage (rule-based classifier).
`pipeline/signal_pipeline.py` computes all of these.

## 6. Current state — Campaign 05 ("The Language of the Economy")

**Anchor:** June 2026 inflation back to 3.8% (three-year high) on an energy/tariff shock; markets
at records while ~⅔ of households cut back; midterms looming; Powell → Warsh. The data-vs-vibes
gap is the cycle. **Defining tension:** "soft landing" vs "vibecession."

**Clusters (17 terms):** A lived-experience/populist (vibecession, greedflation, shrinkflation,
junk fees, price gouging, affordability) · B institutional/macro (soft landing, disinflation,
higher for longer, K-shaped, real wages, last-mile) · C political-blame (tariff tax, "[admin]flation",
cost-of-living crisis, late-stage capitalism, "are you better off").

**Measured so far:** vibecession (+617% YoY, velocity 92, spreading) · soft landing (−37% YoY,
velocity 60, contested) · greedflation (−86% YoY, velocity 44, declining). **14 terms pending** —
`data/campaign05_terms.json` is ready; **first task: run the pipeline to complete them, then
regenerate the brief.** The Week 02 doc is built (8 days Jun 24–Jul 3; 2 Substack, 2 X threads, 1
carousel; warm tone; long-distance-adjusted; tracking table for 13 deliverables).

## 7. The toolkit (this folder)

Built and tested. See `README.md` for the runbook and `CONTEXTIVE_CAMPAIGN_SKILL.md` for the docx
house style (Space Grotesk/Inter/JetBrains Mono; ink `111111`/`1A1A1A`, mute `555555`, cream
`F5F5F3`; US Letter; dividers = paragraph borders not tables; prompt/callout boxes = `cantSplit`
rows; metadata grids = borderless tables; no `\n`, no unicode bullets). Both generators run
standalone with no args to rebuild the bundled examples — a quick post-`npm install` smoke test.

> This resolves the old carried-over action item ("add `pipeline/`, `generators/`, `schema/`"):
> the code now exists here. Commit it into the repo (or wherever Victor keeps the toolkit) so it
> persists.

## 8. Website — operate it, and build the attached briefs in

Stack: Vite + React + TS + Tailwind; `api/subscribe.ts` serverless fn → Substack; term data in
`src/data/terms.ts` (campaigns 01–02 at build time); CSS-variable theming with `ThemeToggle`.
Current live homepage is already a minimal redesign ("Language is leverage", access-ID aesthetic,
dossier card, "Institutional clarity", "THE SYSTEM" three pillars, footer).

**Victor's revamp:** (1) simplify the homepage to one strong idea + one action; (2) give **each
campaign its own sub-space** instead of a flat archive grid; the homepage becomes a clean index.

**The integration principle (full detail in `web/WEBSITE_INTEGRATION.md`):** make each campaign
page **data-driven from the same `cards.json` the pipeline produces** — the web version of
"measure, don't estimate," so site and briefs never diverge. Reconcile `src/data/terms.ts` with
the pipeline's card shape into one contract; add a small converter
(`campaign.json` + `cards.json` → `src/data/campaigns/<nn>.json`); render per-campaign pages at
`/campaigns/<nn>-<slug>`. Keep the monochrome/no-partisan-palette/equal-weight rules on the site.

**For the attached 03/04/05 briefs:** extract each brief's clusters, term cards, signal readings,
and defining tension into the per-campaign JSON shape, build the page, wire it into the simplified
homepage. C05's 14 pending cards render as "measurement pending" until the pipeline run completes.

**The ship loop:** edit repo → build/preview → commit + push via the GitHub plugin (push stays
Victor's) → Vercel auto-builds → verify via the Vercel connector + browser. On a failed build,
pull logs through the connector and fix forward. Read the `frontend-design` skill before reshaping UI.

## 9. Boot sequence

1. Read this → the skill → README → web guide.
2. `npm install`; smoke-test the generators (`node generators/build_brief.js`, `node generators/build_exec_doc.js`).
3. **Campaign:** run `signal_pipeline.py` on `campaign05_terms.json` → complete cards →
   regenerate the brief. Flag any narrative-killing number to Victor.
4. **Website:** open the repo, map components to the live site, confirm the simplified-homepage +
   per-campaign-subspace plan and the unified data contract with Victor, build the attached
   briefs in, push to deploy.
5. Apply the brand rules + pre-publication review before declaring anything done.

**When in doubt:** measure before asserting; paraphrase the contestation paragraph; keep the
firewall verbatim; no named person in a critical sentence; pending beats fabricated.
