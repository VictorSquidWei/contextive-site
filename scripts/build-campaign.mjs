#!/usr/bin/env node
/**
 * build-campaign.mjs — toolkit -> site converter
 * ----------------------------------------------
 * Turns the Contextive toolkit's editorial scaffold (campaign.json) + the
 * pipeline's measured output (cards.json) into one per-campaign data file the
 * site renders directly: src/data/campaigns/<nn>.json (the unified Campaign
 * contract in src/data/campaign.ts).
 *
 * This is the web analogue of "measure, don't estimate": the page reads the same
 * numbers the pipeline produced, so the site and the briefs can never diverge.
 *
 * Usage:
 *   node scripts/build-campaign.mjs <campaign.json> <cards.json> [--slug economy] [--out path]
 *
 * Defaults: slug derived from title; out = src/data/campaigns/<number>.json
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// MUST match FIREWALL in src/data/campaign.ts (verbatim political firewall).
const FIREWALL =
  'We track how the words have been used and how fast they are winning, not whether the underlying politics is correct.';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITE_ROOT = resolve(__dirname, '..');

function parseArgs(argv) {
  const positional = [];
  const opts = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) opts[a.slice(2)] = argv[++i];
    else positional.push(a);
  }
  return { positional, opts };
}

function readJson(p) {
  return JSON.parse(readFileSync(p, 'utf-8'));
}

function deriveSlug(title) {
  let s = String(title || '').toLowerCase();
  const m = s.match(/the language of (the )?(.*)/);
  if (m) s = m[2];
  return s.trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function deriveShortTitle(title) {
  const m = String(title || '').match(/the language of (the )?(.*)/i);
  if (!m) return title;
  const rest = m[2].trim();
  return (m[1] ? 'The ' : '') + rest.charAt(0).toUpperCase() + rest.slice(1);
}

function stripMarks(s) {
  return String(s || '').replace(/[''""'']/g, '').trim();
}

/** Parse a tension title like "'soft landing' meets 'vibecession'" -> {a,b}. */
function parseTensionPair(title) {
  const m = String(title || '').match(/(.+?)\s+(?:vs\.?|meets)\s+(.+)/i);
  if (!m) return null;
  return { a: stripMarks(m[1]), b: stripMarks(m[2]) };
}

function deriverPeriod(refDate) {
  if (!refDate) return undefined;
  const d = new Date(refDate + 'T00:00:00Z');
  if (isNaN(d)) return undefined;
  return d.toLocaleString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}

function mapTerm(card, clusterCounters) {
  const cluster = card.cluster || undefined;
  const n = (clusterCounters[cluster] = (clusterCounters[cluster] || 0) + 1);
  const m = card.measurement || {};
  const cd = m.corpus_density;
  const measurement = {
    status: m.status || 'pending',
  };
  if (m.status === 'measured') {
    if (typeof m.velocity_index === 'number') measurement.velocityIndex = m.velocity_index;
    if (m.adoption_stage) measurement.adoptionStage = m.adoption_stage;
    if (m.deltas) {
      measurement.deltas = {
        d30: m.deltas.delta_30d_pct ?? null,
        d90: m.deltas.delta_90d_pct ?? null,
        yoy: m.deltas.yoy_pct ?? null,
      };
    }
    if (m.sentiment !== undefined) measurement.sentiment = m.sentiment;
    if (Array.isArray(m.inflection_points)) {
      measurement.inflections = m.inflection_points.map((p) => ({ date: p.date, z: p.z }));
    }
    if (cd) measurement.corpusDensity = { value: cd.value, note: cd.note, proxy: true };
    if (m.retrieved_at) measurement.retrievedAt = m.retrieved_at;
  } else if (m.reason) {
    measurement.reason = m.reason;
  }

  const term = {
    ref: card.ref || `C${card.__campaignNumber}-${cluster || 'X'}${n}`,
    term: card.term,
    cluster,
    domainTag: card.domain_tag ?? null,
    measurement,
  };
  if (Array.isArray(card.platforms_spiking) && card.platforms_spiking.length)
    term.platforms = card.platforms_spiking;
  if (Array.isArray(card.co_occurrence) && card.co_occurrence.length)
    term.coOccurrence = card.co_occurrence;
  if (card.what_it_does) term.whatItDoes = card.what_it_does;
  if (card.where_contested) term.whereContested = card.where_contested;
  if (Array.isArray(card.verbatims) && card.verbatims.length) {
    term.verbatims = card.verbatims.map((v) => ({
      quote: v.quote,
      attribution: v.attribution,
      sourceUrl: v.source_url,
    }));
  }
  return term;
}

function build(campaign, cards, opts) {
  const number = String(campaign.number).padStart(2, '0');
  const slug = opts.slug || deriveSlug(campaign.title);
  const clusterCounters = {};
  const terms = (cards.cards || []).map((c) =>
    mapTerm({ ...c, __campaignNumber: number }, clusterCounters)
  );

  const clusters = campaign.clusters
    ? Object.keys(campaign.clusters)
        .sort()
        .map((key) => ({
          key,
          name: campaign.clusters[key].name,
          blurb: campaign.clusters[key].blurb,
        }))
    : undefined;

  const tensions = Array.isArray(campaign.tensions)
    ? campaign.tensions.map((t) => {
        const pair = parseTensionPair(t.title);
        return { ...(pair || {}), title: t.title, body: t.body };
      })
    : undefined;

  let definingTension;
  if (tensions && tensions.length && tensions[0].a && tensions[0].b) {
    definingTension = { a: tensions[0].a, b: tensions[0].b, note: tensions[0].body };
  }

  const hasPending = terms.some((t) => t.measurement.status === 'pending');

  return {
    number,
    slug,
    id: `${number}-${slug}`,
    label: `CAMPAIGN ${number}`,
    title: campaign.title,
    shortTitle: opts.short || deriveShortTitle(campaign.title),
    period: opts.period || deriverPeriod(cards.ref_date) || '',
    status: hasPending ? 'in-progress' : 'published',
    signalBasis: 'measured',
    firewall: FIREWALL,
    summary: Array.isArray(campaign.thesis) ? campaign.thesis[0] : campaign.subtitle,
    anchor: campaign.anchor,
    thesis: campaign.thesis,
    definingTension,
    clusters,
    pillars: campaign.pillars,
    tensions,
    terms,
    generatedAt: cards.generated_at,
    refDate: cards.ref_date,
    source: cards.source,
  };
}

function main() {
  const { positional, opts } = parseArgs(process.argv.slice(2));
  if (positional.length < 2) {
    console.error('usage: node scripts/build-campaign.mjs <campaign.json> <cards.json> [--slug s] [--out path]');
    process.exit(1);
  }
  const campaign = readJson(positional[0]);
  const cards = readJson(positional[1]);
  const out = build(campaign, cards, opts);
  const outPath = opts.out
    ? resolve(process.cwd(), opts.out)
    : resolve(SITE_ROOT, 'src', 'data', 'campaigns', `${out.number}.json`);
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf-8');
  const measured = out.terms.filter((t) => t.measurement.status === 'measured').length;
  console.error(
    `Wrote ${outPath}: campaign ${out.id}, ${out.terms.length} terms ` +
      `(${measured} measured, ${out.terms.length - measured} pending).`
  );
}

main();
