# Contextive Toolkit

Everything a Claude Code session needs to run Contextive end to end: measure a campaign's
vocabulary against live data, generate the Intelligence Brief and the Courtney execution doc in
the house style, and operate the website. Drop this folder into the Claude Code workspace.

**Read first, in order:**
1. `CONTEXTIVE_CLAUDE_CODE_HANDOFF.md` — orientation (brand, roles, campaigns, infra, current state)
2. `CONTEXTIVE_CAMPAIGN_SKILL.md` — the canonical process manual
3. this README — the runbook for the scripts

---

## What's in here

```
contextive-toolkit/
├── CONTEXTIVE_CLAUDE_CODE_HANDOFF.md   # orientation — read first
├── CONTEXTIVE_CAMPAIGN_SKILL.md        # process manual (source of truth for HOW)
├── README.md                           # this file — the runbook
├── pipeline/
│   └── signal_pipeline.py              # GDELT measurement engine (the data scraper)
├── collectors/
│   └── gdelt_collector.js              # browser fallback when a sandbox can't reach GDELT
├── generators/
│   ├── build_brief.js                  # campaign.json + cards.json → Intelligence Brief .docx
│   ├── build_exec_doc.js               # exec_doc.json → Courtney Week 02 .docx (warm/neutral)
│   └── lib/house_style.js              # shared docx house style (tokens + element helpers)
├── schema/
│   ├── term_cards.schema.json          # pipeline output contract
│   ├── campaign.schema.json            # brief editorial-input contract
│   └── exec_doc.schema.json            # Courtney-doc input contract
├── data/
│   ├── campaign05_terms.json           # the real 17-term Campaign 05 input (ready to run)
│   └── examples/                       # worked example + generated .docx for both generators
└── web/
    └── WEBSITE_INTEGRATION.md          # briefs → site revamp + Vercel operating loop
```

## Setup (once)

```bash
cd contextive-toolkit
npm install            # installs docx@9.6.1 (generators only; pipeline is stdlib-only Python)
python3 --version      # 3.9+; signal_pipeline.py has no pip dependencies
```

## End-to-end: run a campaign

**1 — Measure the vocabulary (the scraper).** On a machine that reaches GDELT (i.e. yours, in
Claude Code), the pipeline runs directly:

```bash
python3 pipeline/signal_pipeline.py --terms data/campaign05_terms.json --out data/campaign05_cards.json
```

It throttles itself (~1 req / 5.5s), retries with backoff, and **never fabricates** — a term it
can't measure is marked `pending`, not guessed. Every measured figure carries a retrieval
timestamp. Offline smoke test: `--demo`. Browser-collected data:
`--from-raw raw.json` (see `collectors/gdelt_collector.js`).

> If a measured number undercuts a planned narrative, that IS the story — surface it to Victor
> before it ships. Don't quietly keep a rounder estimate.

**2 — Author the campaign scaffold.** Write `campaign.json` (thesis, methodology, cluster blurbs,
cross-cluster tensions, content pillars, visual system, next steps) per `schema/campaign.schema.json`.
The prose is authored; the numbers come from step 1.

**3 — Generate the brief:**

```bash
node generators/build_brief.js campaign.json data/campaign05_cards.json Contextive_Campaign_05_Brief.docx
python3 /path/to/docx/scripts/office/validate.py Contextive_Campaign_05_Brief.docx
```

(Run `node generators/build_brief.js` with no args to build the bundled example and confirm the
generator works.)

**4 — Author Courtney's Week 02 doc.** Write `exec_doc.json` per `schema/exec_doc.schema.json`.
Set `tone` to `warm` or `neutral` — **confirm with Victor per campaign; it's his call.** Warm
renders the asides + signoff (宝宝, personal notes); neutral omits them. The warmth lives in the
authored text, not the generator. Steps number continuously across the whole week; attach a
prompt to a step and the prompt box is labelled with that step's number (so labels can't fall out
of sync).

```bash
node generators/build_exec_doc.js exec_doc.json Contextive_Campaign_05_Week02_Courtney.docx
python3 /path/to/docx/scripts/office/validate.py Contextive_Campaign_05_Week02_Courtney.docx
```

**5 — Update the website.** See `web/WEBSITE_INTEGRATION.md`: turn the campaign into a per-campaign
sub-space driven by the same `cards.json`, wire it into the simplified homepage, commit + push
(your GitHub plugin), and Vercel auto-deploys. Verify with the Vercel connector + browser.

## The non-negotiables (never skip)

- **Measure, don't estimate.** Pending beats fabricated.
- **Firewall, verbatim:** "We track how the words have been used and how fast they are winning,
  not whether the underlying politics is correct."
- **No named person in a critical sentence.** Equal weight across clusters. No partisan palette.
- **Pre-publication review** on every ship day (PASS/FLAG/BLOCK); any BLOCK is a hard stop.

## Notes / known issues

- Fonts (Space Grotesk / Inter / JetBrains Mono) are referenced by name; install them locally for
  exact rendering, otherwise the doc still validates and opens fine with fallbacks.
- After any restructuring of an exec doc's steps, re-render and eyeball the prompt-box "STEP N"
  labels — the attached-prompt design keeps them synced, but a manual edit can still break it.
- `generators/build_brief.js` and `build_exec_doc.js` both run standalone with no args to
  regenerate the bundled examples in `data/examples/` — a quick way to confirm the toolkit works
  after `npm install`.
