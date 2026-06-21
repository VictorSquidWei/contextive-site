# Website integration — campaigns → site

How the campaign content (briefs you attach: 03, 04, 05) becomes the site, and how
this Claude Code instance operates the live site on Vercel.

## Repo & hosting

- **Repo:** `https://github.com/VictorSquidWei/contextive-site.git` (Vite + React + TS + Tailwind)
- **Host:** Vercel, Git-connected. **Push to `main` → auto-deploy.** Live at **contextive.info**.
- **Vercel connector:** fully set up in this Claude Code app. Use it to read projects /
  deployments / build logs and to verify a deploy landed. Team `team_QmqXaFOedaDKjV8Fix000nkc`,
  project `prj_vG2F3INghrWd8trVkfM0znEmYB7X` (`contextive-site-test`, Vite).
- **Git/commit:** Victor's Claude Code has personal plugins for commit + GitHub — use them for
  the commit/push step rather than hand-rolling git commands.
- **Verification gotcha:** the Vercel project record only enumerates `.vercel.app` aliases, so a
  custom domain missing from the API response does NOT mean it's unattached. Confirm in the
  browser / dashboard, not just the API.

## The revamp (Victor's plan)

1. **Simplify the homepage.** Pare the front door to the single strongest idea (the
   "Language is leverage" / velocity-not-verdict thesis + one access/subscribe action). Move the
   dense archive/ticker sprawl off the landing page.
2. **One sub-space per campaign.** Each campaign (03, 04, 05, …) gets its own route/section
   instead of a single flat archive grid. The homepage becomes a clean index into them.

## The core integration principle: one source of truth

Make each campaign page **data-driven from the same `cards.json` the pipeline produces.** That
is the web analogue of the brand's "measure, don't estimate" rule — the site and the briefs
should never diverge, because they read the same numbers.

Concretely, propose to Victor:

- A canonical per-campaign data file in the repo, e.g. `src/data/campaigns/05.json`, generated
  from / kept in sync with the toolkit's `cards.json` + `campaign.json`. Today the site keeps term
  data in `src/data/terms.ts` (campaigns 01–02). **Reconcile these into one shape** so a new
  campaign is "drop in the JSON, the page renders."
- A campaign page component that renders, per campaign: the three clusters, the term cards (term,
  domain tag, the seven signal fields, what-it-does, where-contested), and the defining tension —
  read from that JSON.
- A homepage that lists campaigns and routes into `/campaigns/<nn>-<slug>` (e.g.
  `/campaigns/05-economy`). Decide with Victor: file-based routing vs SPA, and whether pages are
  statically generated from JSON at build.

### Suggested converter (small, write it in the repo)

A tiny build step that turns the toolkit outputs into the site's per-campaign JSON keeps the two
worlds in sync without copy-paste:

```
campaign.json  +  cards.json   ──►   src/data/campaigns/<nn>.json   ──►  campaign page
   (toolkit)        (pipeline)            (site data contract)
```

Keep the brand constraints on the site exactly as in posts: monochrome/typographic, **no
red/blue palette, no candidate imagery, equal weight across clusters**, and the firewall framing
intact. The site states velocity, never verdict.

## Operating the site from Claude Code — the loop

1. Edit the repo files locally (components, the per-campaign JSON, the converter).
2. Run the dev server / build to confirm it renders.
3. Commit + push to `main` using the commit/GitHub plugins. **The push stays Victor's action**
   (his credentials); Claude Code prepares the diff and runs the plugin.
4. Vercel auto-builds. Use the Vercel connector to read the deployment + build logs and confirm
   it shipped; verify `contextive.info` in the browser.
5. If a build fails, pull the build logs via the connector and fix forward.

## When the briefs are attached

For each attached brief (03, 04, 05): extract its clusters, term cards, signal readings, and
defining tension into the site's per-campaign JSON shape, build the campaign page, and wire it
into the simplified homepage index. Campaign 05's 14 pending cards should show as "measurement
pending" on the page until the pipeline run completes — same honesty rule as the brief.
