# Contextive — Claude Code Handoff (v3)

**Owner:** Victor · **Live site:** contextive.info · **Repo:** `github.com/VictorSquidWei/contextive-site` (currently **public**)

Standing orientation for a fresh session. Read the **Resume here** block first (current state as of
2026-06-21); everything below it is durable context. Keep the non-negotiables and the firewall
verbatim.

---

## Resume here — current state (2026-06-21)

The website revamp **and** the Claude Code config pack are **shipped and live**.

- **Site (live on contextive.info):** data-driven per-campaign architecture. Unified contract
  `src/data/campaign.ts`; converter `scripts/build-campaign.mjs` (`campaign.json` + `cards.json` →
  `src/data/campaigns/<nn>.json`); react-router `/campaigns/<nn>-<slug>` + a Vercel SPA rewrite in
  `vercel.json`; simplified homepage (Hero + campaign index + CTA); `SignalCard` renders
  measured / pending / editorial. Campaigns 01–02 are reconciled from the legacy
  `src/data/terms.ts` via `src/data/legacy.ts`; 03/04/05 are JSON in `src/data/campaigns/`. Email
  capture (`api/subscribe.ts`) records to our own list (webhook/KV hook + log) **and** opens
  Substack prefilled, always confirms; footer says "Seattle, United States."
- **All five campaigns are live**, but measured coverage is **partial** (see GDELT note): **C03 6/17,
  C04 5/17, C05 9/17** measured; the rest render **"measurement pending."** Top up with spaced
  pipeline re-runs (a few terms land per run).
- **Measurement divergence (flag every time):** live GDELT reverses several brief figures — the
  hand-built briefs over-stated momentum on ~half the terms (e.g. C03 "seed oils" brief
  +617%/surging vs measured −40%/fading; C04 "America First" +75% vs −14%). The site/briefs must
  show **measured** numbers, never the brief's.
- **Repo/deploy:** production deploy on Vercel is `READY`; contextive.info serves it. **The repo is
  PUBLIC** — Victor's explicit call (he needs the config/commands live). Consequence: the config
  docs (this handoff, the skill, incl. the C04 audit text) are visible on GitHub, though not served
  by the site. **WARNING: setting the repo PRIVATE blocks the Vercel deploy** (Vercel loses git
  access → deploy state `BLOCKED`). If you ever go private, re-grant Vercel's GitHub App access to
  the repo, then redeploy.
- **Config installed:** `CLAUDE.md` (repo root) + slash commands `/handoff /new-brief
  /new-instructions /new-graphics /update-site` + the `contextive-campaign` skill, in
  `contextive-site/.claude/`. The **Claude Design** media pipeline ("contextive design system") is
  baked into `/new-instructions` + `/new-graphics`: exec docs hand Courtney per-card prompts
  pre-filled from `cards.json`.
- **Open threads:** (1) finish measurement — re-verify the pending terms across 03/04/05 (C05's
  vibecession & greedflation are currently carried from documented figures, not re-verified live).
  (2) **Regenerate the C05 brief `.docx`** — blocked because the toolkit's generators aren't on the
  shell-executable disk (see Environment); inputs `campaign05_campaign.json` + enriched
  `campaign05_terms.json` are authored and ready. (3) Standing weekly cadence for the next campaign.

## How to work in this repo (read this)
- **Open Claude Code with `contextive-site` as the folder.** That's the git repo, where `CLAUDE.md`
  + `.claude/` (commands + skill) live natively and are version-controlled. If you open one level up
  (`…\contextive-source\contextive-source`), a stopgap mirror of the commands + a `CLAUDE.md` is
  there too, but `contextive-site` is canonical.
- Slash commands register at **session start** — they won't appear if added mid-session.

## Environment gotchas (these bite)
- Python is **`python`** (3.14), not `python3`. Node v22.
- **The toolkit's CODE (`pipeline/`, `generators/`) is NOT on the shell-executable disk here** — the
  repo's `contextive-toolkit/` holds only the *docs* (vendored so `CLAUDE.md` @imports resolve). A
  full toolkit copy *with code* lives at `E:\Contextive\08 Misc\files\contextive-toolkit\contextive-toolkit\`,
  and the original `data/` at `E:\Contextive\files\contextive-toolkit\contextive-toolkit\data\`. To
  RUN the pipeline or the docx generators, **materialize them to a shell-accessible path first**
  (a working copy of `signal_pipeline.py` is in the session scratchpad). This is why brief/exec-doc
  generation needs a setup step.
- **GDELT rate-limits hard** (~1 req/5s + a punishing extended cooldown). The pipeline self-throttles;
  even so expect ~5–7 measured terms per run, the rest `pending`. Never fire manual GDELT curls right
  before a run (it trips the cooldown that cascades through the run). Measure as-of a campaign's
  moment with `--ref-date`; `velocity_index` is a within-set percentile (recompute when you merge runs).
- **Vercel:** team `team_QmqXaFOedaDKjV8Fix000nkc`, project `prj_vG2F3INghrWd8trVkfM0znEmYB7X`
  (`contextive-site-test`, Vite). Push to `main` → auto-deploy (when public / Vercel has access).
  Verify via the connector + browser. The project API only enumerates `.vercel.app` aliases;
  contextive.info IS attached (confirm in browser, not just the API).

## What Contextive is
A **language-intelligence brand** tracking how vocabulary gains momentum and shifts meaning —
**velocity, not verdict** — published as "intelligence brief" campaigns across Substack, X,
Instagram. **Firewall (verbatim, never improvise):** "We track how the words have been used and how
fast they are winning, not whether the underlying politics is correct."

## Roles + media pipeline
- **Victor** — research, strategy, infra, pipeline; signs off on every brief + Courtney doc.
- **Courtney** — publishing, visual/Instagram, scheduling; drafts with ChatGPT (你的好朋友). She now
  builds **all** social/visual content in **Claude Design** with the shared **"contextive design
  system"** (monochrome, monospace, dossier-card vocabulary) — no Canva, no hand-built cards. Card
  numbers come from the measured `cards.json`. Courtney-doc tone is Victor's call per campaign
  (default warm: 宝宝, asides).

## Non-negotiables (outrank everything but safety)
1. **Measure, don't estimate.** Numbers from `signal_pipeline.py`; unmeasurable = pending, never
   guessed. A measured number that kills a narrative IS the story — flag it before shipping.
2. **Firewall, verbatim** (above).
3. **No named person in a critical sentence** — quote patterns of speech, never an individual.
4. **Equal weight across the three clusters**; paraphrase each term's contestation paragraph.
5. **No visual partisanship:** monochrome/typographic, no candidate imagery, no red/blue palette.
6. **Pre-publication review on every ship day** → PASS/FLAG/BLOCK (partisan tilt, named-person,
   voice leak, numerical accuracy, headline misread). Any BLOCK is a hard stop; never cut for time.
7. Tone of Courtney docs is Victor's per-campaign call.

## Campaign lineage
01 geopolitics · 02 AI & work · 03 bodies & food (MAHA/GLP-1) · 04 primaries (May 19 2026) ·
**05 the economy** (June 2026 inflation re-acceleration; defining tension "soft landing" vs
"vibecession"). Per campaign: research brief (17 cards / 3 clusters / 7 signal fields) → Week 01
"trailer" → Week 02 launch (2 Substack, 2 X threads, 1 carousel over 8 working days) → editorial
passes → optional ads. Brief releases a week ahead; the mid-Week-02 weekend is a hard reset.

## The signal layer + why we measure
The differentiator is the signal layer; credibility depends on the numbers being real. A C04 audit
found the hand-built numbers were off in magnitude and timing ("MAGA Warrior" ~+1,714% YoY not
~+600%; "principled" flat not +164%). Live measurement is the default now. Seven fields: platforms,
corpus density (GDELT coverage-intensity proxy, labelled), velocity index 0–100 (within-set
percentile), inflection points (dated z-peaks), sentiment −5..+5, co-occurrence, adoption stage.

## The toolkit
`pipeline/signal_pipeline.py` (GDELT measurement; `--terms`/`--demo`/`--from-raw`, `--ref-date`),
`generators/build_brief.js` + `build_exec_doc.js` (house-style docx), `generators/lib/house_style.js`,
`schema/*.json` (contracts), `data/` (term sets + examples). **Plus** the site converter
`contextive-site/scripts/build-campaign.mjs`. Reminder: the *code* must be materialized to a
shell-accessible path to run here.

## The website + ship loop
New per-campaign architecture (see Resume here). Loop: edit repo → build/preview → commit + push
to `main` (push is Victor's action via his GitHub plugin) → Vercel auto-builds → verify via the
connector + contextive.info. The slash command `/update-site <nn>` runs this for a campaign.

## Boot sequence (next session)
1. `CLAUDE.md` auto-loads this handoff + the `contextive-campaign` skill; project memory auto-recalls.
2. Read **Resume here**. Confirm what's measured vs pending and what's live.
3. To run the pipeline/generators, materialize the toolkit code to a shell path first.
4. New campaign: `/new-brief <nn> <topic>` → review → `/update-site <nn>` (gated preview → Victor
   pushes) → `/new-instructions <nn>` (warm/neutral) → `/new-graphics <nn>` → publish → `/handoff`.
5. Apply brand rules + the pre-publication review before declaring anything done. When in doubt:
   measure before asserting, paraphrase the contestation paragraph, keep the firewall verbatim,
   no named person in a critical sentence, pending beats fabricated.
