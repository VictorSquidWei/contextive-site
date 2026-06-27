// Generates public/cards/c<nn>-<slug>.png — the shareable "Velocity Card", Contextive's
// signature primitive: one measured term as a 1080x1080 social card. Monochrome, typographic,
// every number from the measured campaign data, firewall baked in. Velocity, not verdict.
// Run: node scripts/build-velocity-cards.mjs   (needs devDependency `sharp`)
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CAMPAIGN_DIR = join(__dirname, '..', 'src', 'data', 'campaigns');
const OUT_DIR = join(__dirname, '..', 'public', 'cards');
mkdirSync(OUT_DIR, { recursive: true });

const ink = '#111111';
const mute = '#555555';
const faint = '#9A9A97';
const hair = '#D9D9D5';
const paper = '#F5F5F3';
const display = 'Space Grotesk, Arial, Helvetica, sans-serif';
const mono = 'JetBrains Mono, Consolas, monospace';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmtPct = (v) => v === null || v === undefined ? 'n/a' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(Math.round(v)) + '%';
const fmtSent = (v) => v === null || v === undefined ? 'n/a' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
const dateOnly = (s) => (s || '').slice(0, 10);
const upper = (s) => String(s ?? '').toUpperCase();

// Term size: fit on one line within the 920px content width (conservative for bold fallback fonts).
function termSize(t) {
  const f = Math.floor(920 / (t.length * 0.60));
  return Math.max(46, Math.min(132, f));
}

// Directional momentum glyph: ascends if 90d move is positive, descends if negative. Direction +
// rough magnitude only — the hard numbers on the card are the measured truth.
function sparkline(d90, x0, y0, w, h) {
  const dir = (d90 ?? 0) >= 0 ? 1 : -1;
  const mag = Math.min(1, Math.abs(d90 ?? 0) / 120);
  const n = 11;
  const wob = [0, .05, -.03, .07, -.02, .06, -.04, .08, -.01, .06, 0];
  const pts = [];
  for (let i = 0; i < n; i++) {
    const fx = i / (n - 1);
    const x = x0 + fx * w;
    const trend = dir * mag * fx;
    const y = y0 + h / 2 - (trend * (h / 2)) - wob[i] * (h / 2) * 0.45 * mag;
    pts.push([x, y]);
  }
  const poly = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const [sx, sy] = pts[0];
  const [ex, ey] = pts[pts.length - 1];
  return `
    <line x1="${x0}" y1="${y0 + h / 2}" x2="${x0 + w}" y2="${y0 + h / 2}" stroke="${hair}" stroke-width="1"/>
    <polyline points="${poly}" fill="none" stroke="${ink}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="3.5" fill="${faint}"/>
    <rect x="${(ex - 7).toFixed(1)}" y="${(ey - 7).toFixed(1)}" width="14" height="14" fill="${ink}" transform="rotate(45 ${ex.toFixed(1)} ${ey.toFixed(1)})"/>`;
}

function metaCell(x, label, value) {
  return `
    <text x="${x}" y="838" font-family="${mono}" font-size="18" letter-spacing="2" fill="${faint}">${esc(label)}</text>
    <text x="${x}" y="880" font-family="${display}" font-weight="600" font-size="36" fill="${ink}">${esc(value)}</text>`;
}

function card(term, camp) {
  const m = term.measurement;
  const vel = m.velocityIndex ?? 0;
  const barX = 80, barW = 920, barFill = Math.max(6, Math.round(barW * vel / 100));
  const inflect = (m.inflections && m.inflections[0]) ? dateOnly(m.inflections[0].date) : 'n/a';
  let co = (term.coOccurrence || []).slice(0, 5).join('  ·  ');
  if (co.length > 58) co = (term.coOccurrence || []).slice(0, 4).join('  ·  ');
  const asOf = dateOnly(m.retrievedAt) || camp.refDate || '';
  const ts = termSize(term.term);

  return `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1080" fill="${paper}"/>
  <rect x="36" y="36" width="1008" height="1008" fill="none" stroke="${ink}" stroke-width="1.5"/>

  <!-- header -->
  <rect x="80" y="86"  width="60" height="6" fill="${ink}"/>
  <rect x="80" y="98"  width="38" height="6" fill="${ink}"/>
  <rect x="80" y="110" width="60" height="6" fill="${ink}"/>
  <text x="160" y="112" font-family="${mono}" font-size="20" letter-spacing="5" fill="${mute}">CONTEXTIVE</text>
  <text x="1000" y="112" text-anchor="end" font-family="${mono}" font-size="17" letter-spacing="3" fill="${faint}">C${esc(camp.number)} · ${esc(upper(camp.shortTitle || camp.title))}</text>
  <line x1="80" y1="138" x2="1000" y2="138" stroke="${ink}" stroke-width="1" opacity="0.16"/>

  <!-- term + domain -->
  <text x="80" y="276" font-family="${display}" font-weight="700" font-size="${ts}" letter-spacing="0.5" fill="${ink}">${esc(term.term)}</text>
  <text x="82" y="320" font-family="${mono}" font-size="19" letter-spacing="3" fill="${mute}">${esc(term.domainTag || '')}</text>

  <!-- velocity hero -->
  <text x="80" y="406" font-family="${mono}" font-size="19" letter-spacing="4" fill="${faint}">VELOCITY INDEX</text>
  <text x="1000" y="500" text-anchor="end" font-family="${display}" font-weight="600" font-size="38" letter-spacing="1" fill="${ink}">${esc(upper(m.adoptionStage || ''))}</text>
  <text x="76" y="530" font-family="${display}" font-weight="700" font-size="128" letter-spacing="0" fill="${ink}">${vel}<tspan font-family="${display}" font-weight="500" font-size="46" fill="${faint}"> /100</tspan></text>
  <rect x="${barX}" y="566" width="${barW}" height="16" rx="8" fill="${hair}"/>
  <rect x="${barX}" y="566" width="${barFill}" height="16" rx="8" fill="${ink}"/>

  <!-- momentum -->
  <text x="80" y="652" font-family="${mono}" font-size="19" letter-spacing="4" fill="${faint}">MOMENTUM · 90 DAY</text>
  ${sparkline(m.deltas?.d90, 80, 668, 520, 86)}
  <text x="1000" y="748" text-anchor="end" font-family="${display}" font-weight="700" font-size="84" fill="${ink}">${esc(fmtPct(m.deltas?.d90))}</text>

  <line x1="80" y1="792" x2="1000" y2="792" stroke="${ink}" stroke-width="1" opacity="0.16"/>
  <!-- metadata grid -->
  ${metaCell(80, '30-DAY', fmtPct(m.deltas?.d30))}
  ${metaCell(310, 'YOY', fmtPct(m.deltas?.yoy))}
  ${metaCell(540, 'SENTIMENT', fmtSent(m.sentiment))}
  ${metaCell(770, 'INFLECTION', inflect)}

  <!-- co-occurrence -->
  <text x="80" y="938" font-family="${mono}" font-size="18" letter-spacing="2" fill="${faint}">WITH</text>
  <text x="168" y="938" font-family="${mono}" font-size="19" fill="${mute}">${esc(co)}</text>

  <line x1="80" y1="966" x2="1000" y2="966" stroke="${ink}" stroke-width="1" opacity="0.16"/>
  <!-- footer -->
  <text x="80" y="994" font-family="${mono}" font-size="13" fill="${faint}">${esc(camp.firewall || '')}</text>
  <text x="80" y="1022" font-family="${display}" font-weight="600" font-size="19" fill="${ink}">Velocity, not verdict.</text>
  <text x="1000" y="1022" text-anchor="end" font-family="${mono}" font-size="16" letter-spacing="2" fill="${faint}">MEASURED ${esc(asOf)}</text>
</svg>`;
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
    await sharp(Buffer.from(card(t, camp))).png().toFile(join(OUT_DIR, name));
    manifest.push({ file: `cards/${name}`, campaign: camp.number, term: t.term, slug, velocityIndex: t.measurement.velocityIndex });
    count++;
  }
}
writeFileSync(join(OUT_DIR, 'index.json'), JSON.stringify(manifest, null, 2));
console.log(`wrote ${count} velocity cards to public/cards/ (+ index.json)`);
