---
description: Build or refresh a campaign's website page from its data, preview, then deploy (gated).
argument-hint: "<campaign number> — e.g. 05"
---

Update the website for campaign: $ARGUMENTS

1. Produce/refresh the per-campaign site data from `campaign.json` + `cards.json` into the site's
   data contract (`src/data/campaigns/<nn>.json`); pending terms render as "measurement pending".
2. Build/refresh the campaign page and its homepage index entry. Hold all brand visual rules
   (monochrome, no partisan palette, equal weight). Read the `frontend-design` skill before
   reshaping UI.
3. Run the dev build locally and **show me a preview. ⛔ Do not push without my OK.**
4. On my OK: commit + push to `main` via my GitHub plugin (the push is my action — prepare the diff
   and drive the plugin). Let Vercel auto-build.
5. Verify the deploy via the Vercel connector + by loading contextive.info, and report the result.
   If the build fails, pull the build logs through the connector and fix forward.
