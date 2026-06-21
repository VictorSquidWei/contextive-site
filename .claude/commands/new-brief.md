---
description: Generate a new Contextive campaign Intelligence Brief end to end (find words → measure → build).
argument-hint: "<campaign number> <topic/anchor>, e.g. 06 the language of housing"
---

Produce a new campaign brief for: $ARGUMENTS

Follow the process manual (the campaign skill) and the README runbook. Sequence:

1. **Find the words.** Use editorial judgment + the browser-research playbook (navigate directly to
   named outlets; quoted-phrase queries) to surface candidate vocabulary across the three clusters
   (lived-experience, institutional, political/attribution). Aim for ~17 terms.
2. **Validate + measure.** Write a `terms.json` (shape: `contextive-toolkit/data/campaign05_terms.json`)
   with tuned GDELT queries, then run:
   `python3 contextive-toolkit/pipeline/signal_pipeline.py --terms terms.json --out cards.json`
   Cut or mark pending any term that doesn't measure as live. Numbers come from the pipeline, never
   by hand.
3. **Author the scaffold.** Write `campaign.json` (thesis, methodology, cluster blurbs, cross-cluster
   tensions, content pillars, visual system, next steps) per `schema/campaign.schema.json`. Each
   term's contestation paragraph is the brand's position — write it so a post can paraphrase from it.
4. **Build + validate:**
   `node contextive-toolkit/generators/build_brief.js campaign.json cards.json out.docx`
   then validate the docx.
5. **Flag divergences.** If any measured number diverges sharply from what the topic implied, surface
   it to me before finalizing — that's signal.

Keep the firewall verbatim, no named person in a critical sentence, equal weight across clusters.
Present the brief when done.
