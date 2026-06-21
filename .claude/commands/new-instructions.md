---
description: Generate Courtney's Week 02 execution doc for a campaign in the house style.
argument-hint: "<campaign number> [week 01|week 02] — defaults to week 02"
---

Generate the Courtney execution doc for: $ARGUMENTS

First ask me one thing if it isn't already settled: **warm or neutral tone?** (My call per
campaign; default warm.) Then proceed.

1. Read the campaign brief so the deliverables and numbers are right; mirror the prior cycle's
   equivalent doc exactly (improve deliberately, don't drift the format).
2. Author `exec_doc.json` per `schema/exec_doc.schema.json`: read-this-first, week-at-a-glance,
   voice rules, the master tracking table, and per-day sections (pre-flight, continuously-numbered
   steps, copy-paste ChatGPT prompt boxes, time bands, done-when gates). Attach prompts to steps so
   the boxes auto-label with the step number. Ship days get the PASS/FLAG/BLOCK review block.
   - If tone is warm, write the asides + signoff in Courtney's register (宝宝, personal notes); the
     warmth lives in the authored text, the generator only renders it.
3. Build + validate:
   `node contextive-toolkit/generators/build_exec_doc.js exec_doc.json out.docx`
4. After any step restructuring, eyeball the prompt-box "STEP N" labels.

## Social graphics (Claude Design)

Courtney builds all social cards in **Claude Design** using the shared system **"contextive design
system"**. The exec doc must hand her ready-to-paste Claude Design prompts — one per carousel card —
each pre-filled with that term's measured numbers from `cards.json` (never hand-keyed). Render these
as the doc's prompt boxes (attach a prompt to a step so the box auto-labels with that step's number).

Carousel order (per the design system): **01** hook · **02** anchor (the campaign's anchor stat) ·
**03–05** term profiles (one per cluster) · **06** pivot (the climax diagram) · **07** thesis ·
**08** CTA.

Term-profile cards (03–05) use this exact field layout — it's the format Claude Design expects:

```
Create a new campaign card design for Instagram with the following information:
<TERM> — <CLASSIFICATION> / <SIGNAL TYPE>
VELOCITY INDEX <n>/100
COVERAGE INTENSITY <value> (×10⁴ of corpus)
30-DAY DELTA <±n%>
90-DAY DELTA <±n%>
YOY DELTA <±n%>
SENTIMENT (−5/+5) <value or n/a>
ADOPTION STAGE <STAGE>
INFLECTIONS: <date(s)>
Platforms spiking: <...>
Co-occurrence: <...>
Use the "contextive design system". Instagram 4:5 (1080×1350). Export per platform.
```

Worked example of a filled term-profile prompt (vibecession):

```
Create a new campaign card design for Instagram with the following information:
vibecession — LIVED-EXPERIENCE / SENTIMENT / SIGNAL
VELOCITY INDEX 92/100
COVERAGE INTENSITY 1.4 (×10⁴ of corpus)
30-DAY DELTA +275%
90-DAY DELTA -44%
YOY DELTA +617%
SENTIMENT (−5/+5) n/a
ADOPTION STAGE SPREADING
INFLECTIONS: 11/26/2024
Platforms spiking: X, TikTok, personal-finance Substacks, consumer reporting, Reddit (r/economy).
Co-occurrence: affordability, real economy, data vs vibes, consumer sentiment, soft landing, groceries.
Use the "contextive design system". Instagram 4:5 (1080×1350). Export per platform.
```

Other archetypes (01 hook, 02 anchor, 06 pivot, 07 thesis, 08 CTA) don't use the field layout —
instead describe the slide's copy and which measured number it features, and still tell her to use
the **"contextive design system"** and the target format (square 1080×1080 for the carousel master;
re-frame per platform).

Rules carried onto every card: every number from `cards.json`; strict monochrome; equal weight across
the three clusters; no named person; run the pre-publication checklist before posting.

Present the doc when done.
