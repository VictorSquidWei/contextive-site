---
description: Orchestrate a full Contextive campaign across the dedicated sub-agents (measure → brief → review gate → Courtney doc + graphics + site → handoff).
argument-hint: "<campaign number> <topic/anchor>, e.g. 08 the language of immigration"
---

Run the campaign assembly line for: $ARGUMENTS

**You are the orchestrator.** You do not do the stage work yourself — you dispatch each stage to
its dedicated sub-agent via the Agent tool, read its structured report, and relay up to Victor.
Agents report to you; you report to Victor. Hold the two human gates.

## The line (dispatch in this order)

1. **Measure** → `Agent(subagent_type: "signal-measurer")`. Pass the campaign number + topic.
   It finds ~17 terms, writes terms.json, runs the GDELT pipeline, returns `cards.json` + a
   measurement report (measured/pending, divergences, spine candidate). GDELT is slow + flaky —
   if it returns `partial`, decide whether to dispatch a top-up run now or proceed and top up later.

2. **Brief** → `Agent(subagent_type: "brief-author")`. Pass the `cards.json` path + topic.
   It authors campaign.json and builds + validates the brief docx, letting the **measured** numbers
   choose the spine/thesis. Returns the brief + the divergences that lead it.

3. **⛔ GATE 1 — Victor's review.** Present the brief + the measured spine + any divergences to
   Victor. Do not proceed to Courtney/graphics/site until he approves. Also ask **GATE 2 here if
   convenient: warm or neutral tone** for the Courtney doc (his call; default warm).

4. **Fan out (parallel)** once approved — dispatch in a single message so they run concurrently:
   - `Agent(subagent_type: "courtney-instructions")` — pass the approved brief + cards.json + the **tone** decision.
   - `Agent(subagent_type: "campaign-graphics")` — pass cards.json + brief.
   - `Agent(subagent_type: "site-publisher")` — pass campaign.json + cards.json. It builds the page + local preview and **stops at the push gate.**

5. **⛔ GATE 3 — the live-site push.** site-publisher returns `preview-ready`. Show Victor the
   preview + diff. On his OK, commit + push to `main` via his GitHub plugin (the push is his
   action), then verify the Vercel deploy.

6. **Handoff** → `Agent(subagent_type: "handoff-scribe")`. Refresh the handoff so the next session
   resumes clean.

## Rules for you, the orchestrator
- Relay each agent's report to Victor in a tight summary — paths, the measured spine, flags, and the next gate. Don't dump raw agent transcripts.
- The non-negotiables bind every stage (measure-don't-estimate, firewall verbatim, no named person in a critical sentence, equal weight, no partisan palette, pre-publication PASS/FLAG/BLOCK). If any agent reports a BLOCK, stop and surface it.
- Never push to the live site without Victor's explicit OK. Tone is Victor's call. These gates are not skippable for speed.
- If a stage agent is blocked or returns `needs-decision`, resolve it (re-dispatch with more context, or ask Victor) before moving down the line.

## Standalone use
Any stage can be run on its own without this orchestrator — e.g. a measurement top-up is just
`Agent(subagent_type: "signal-measurer")` again; refreshing the handoff is `handoff-scribe`.
