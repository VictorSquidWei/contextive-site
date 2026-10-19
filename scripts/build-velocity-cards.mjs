// Generates public/cards/c<nn>-<slug>.png — the shareable "Velocity Card", one measured term as
// a 1080x1080 social card. The card design lives in src/lib/velocityCard.js (shared with the
// in-browser Card Studio) so the static PNG and the customizable card never drift.
// Run: node scripts/build-velocity-cards.mjs   (needs devDependency `sharp`)
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { velocityCardSVG, DEFAULT_THEME } from '../src/lib/velocityCard.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CAMPAIGN_DIR = join(__dirname, '..', 'src', 'data', 'campaigns');
const OUT_DIR = join(__dirname, '..', 'public', 'cards');
mkdirSync(OUT_DIR, { recursive: true });

// Only a real ISO date counts. The seed carries retrieved_at: 'from-raw' (the pipeline's
// SOURCE MODE, not a timestamp) and that string is truthy, so a bare `||` fallback never
// fired and every card rendered 'MEASURED from-raw'. Reject anything that is not YYYY-MM-DD
// so the caller falls through to the campaign's refDate, which is the real measurement date.
const dateOnly = (s) => {
  const d = (s || '').slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : '';
};

function toData(term, camp) {
  const m = term.measurement || {};
  const d = m.deltas || {};
  return {
    term: term.term,
    domainTag: term.domainTag || '',
    velocityIndex: m.velocityIndex ?? 0,
    adoptionStage: m.adoptionStage || '',
    d30: d.d30, d90: d.d90, yoy: d.yoy,
    sentiment: m.sentiment,
    inflection: (m.inflections && m.inflections[0]) ? dateOnly(m.inflections[0].date) : 'n/a',
    coOccurrence: term.coOccurrence || [],
    campaignNumber: camp.number,
    campaignShort: camp.shortTitle || camp.title,
    firewall: camp.firewall || '',
    asOf: dateOnly(m.retrievedAt) || camp.refDate || '',
  };
}

const files = readdirSync(CAMPAIGN_DIR).filter(f => /^\d\d\.json$/.test(f)).sort();
const manifest = [];
let count = 0;
for (const f of files) {
  const camp = JSON.parse(readFileSync(join(CAMPAIGN_DIR, f), 'utf-8'));
  const measured = (camp.terms || []).filter(t => t.measurement?.status === 'measured');
  for (const t of measured) {
    const slug = t.term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const name = `c${camp.number}-${slug}.png`;
    const svg = velocityCardSVG(toData(t, camp), DEFAULT_THEME);
    await sharp(Buffer.from(svg)).png().toFile(join(OUT_DIR, name));
    manifest.push({ file: `cards/${name}`, campaign: camp.number, term: t.term, slug, velocityIndex: t.measurement.velocityIndex });
    count++;
  }
}
writeFileSync(join(OUT_DIR, 'index.json'), JSON.stringify(manifest, null, 2));
console.log(`wrote ${count} velocity cards to public/cards/ (+ index.json)`);
