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
const paper = '#F5F5F3';
const display = 'Space Grotesk, Arial, Helvetica, sans-serif';
const mono = 'JetBrains Mono, Consolas, monospace';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmtPct = (v) => v === null || v === undefined ? 'n/a' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(Math.round(v)) + '%';
const fmtSent = (v) => v === null || v === undefined ? 'n/a' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
const dateOnly = (s) => (s || '').slice(0, 10);
const upper = (s) => String(s ?? '').toUpperCase();

// Term font size by length so long phrases ("magic internet money") still fit.
function termSize(t) {
  const n = t.length;
  if (n <= 9) return 150;
  if (n <= 14) return 118;
  if (n <= 20) return 92;
  if (n <= 27) return 72;
  return 58;
}

// A directional momentum sparkline: ascends if the 90d move is positive, descends if negative.
// It is a momentum GLYPH (direction + rough magnitude), not a claim of daily values; the hard
// numbers on the card are the measured truth.
function sparkline(d90, x0, y0, w, h) {
  const dir = (d90 ?? 0) >= 0 ? 1 : -1;
  const mag = Math.min(1, Math.abs(d90 ?? 0) / 120); // steepness scales with the move, capped
  const n = 11;
  const wob = [0, .04, -.03, .06, -.02, .05, -.04, .07, -.01, .05, 0]; // gentle, deterministic
  const pts = [];
  for (let i = 0; i < n; i++) {
    const fx = i / (n - 1);
    const x = x0 + fx * w;
    // baseline trend from flat to dir*mag across the width, plus small wobble
    const trend = dir * mag * fx;
    const y = y0 + h / 2 - (trend * (h / 2)) - wob[i] * (h / 2) * 0.5 * mag;
    pts.push([x, y]);
  }
  const poly = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
  const [ex, ey] = pts[pts.length - 1];
  return `
    <line x1="${x0}" y1="${y0 + h / 2}" x2="${x0 + w}" y2="${y0 + h / 2}" stroke="${ink}" stroke-width="1" opacity="0.14"/>
    <polyline points="${poly}" fill="none" stroke="${ink}" stroke-width="3" opacity="0.7"/>
    <rect x="${(ex - 6).toFixed(1)}" y="${(ey - 6).toFixed(1)}" width="12" height="12" fill="${ink}" transform="rotate(45 ${ex.toFixed(1)} ${ey.toFixed(1)})"/>`;
}

function metaCell(x, label, value) {
  return `
    <text x="${x}" y="852" font-family="${mono}" font-size="19" letter-spacing="2" fill="${faint}">${esc(label)}</text>
    <text x="${x}" y="892" font-family="${display}" font-weight="600" font-size="38" fill="${ink}">${esc(value)}</text>`;
}

function card(term, camp) {
  const m = term.measurement;
  const vel = m.velocityIndex ?? 0;
  const barW = 920, barX = 80, barFill = Math.max(2, Math.round(barW * vel / 100));
  const inflate = (m.inflections && m.inflections[0]) ? dateOnly(m.inflections[0].date) : 'n/a';
  const co = (term.coOccurrence || []).slice(0, 5).join('  ·  ');
  const asOf = dateOnly(m.retrievedAt) || camp.refDate || '';
  const ts = termSize(term.term);

  return `<svg width="1080" height="1080" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
  <rect width="1080" height="1080" fill="${paper}"/>
  <rect x="40" y="40" width="1000" height="1000" fill="none" stroke="${ink}" stroke-width="1.5"/>

  <!-- header: mark + brand (left), campaign tag (right) -->
  <rect x="80" y="92"  width="64" height="6" fill="${ink}"/>
  <rect x="80" y="104" width="40" height="6" fill="${ink}"/>
  <rect x="80" y="116" width="64" height="6" fill="${ink}"/>
  <text x="164" y="118" font-family="${mono}" font-size="20" letter-spacing="5" fill="${mute}">CONTEXTIVE</text>
  <text x="1000" y="118" text-anchor="end" font-family="${mono}" font-size="18" letter-spacing="3" fill="${faint}">C${esc(camp.number)} · ${esc(upper(camp.shortTitle || camp.title))}</text>
  <line x1="80" y1="150" x2="1000" y2="150" stroke="${ink}" stroke-width="1" opacity="0.18"/>

  <!-- the term -->
  <text x="80" y="290" font-family="${display}" font-weight="700" font-size="${ts}" letter-spacing="0.5" fill="${ink}">${esc(term.term)}</text>
  <text x="82" y="338" font-family="${mono}" font-size="20" letter-spacing="3" fill="${mute}">${esc(term.domainTag || '')}</text>

  <!-- velocity index + bar -->
  <text x="80" y="430" font-family="${mono}" font-size="20" letter-spacing="4" fill="${faint}">VELOCITY INDEX</text>
  <text x="80" y="540" font-family="${display}" font-weight="700" font-size="150" fill="${ink}">${vel}<tspan font-size="56" fill="${mute}"> /100</tspan></text>
  <text x="1000" y="540" text-anchor="end" font-family="${display}" font-weight="600" font-size="40" fill="${ink}">${esc(upper(m.adoptionStage || ''))}</text>
  <rect x="${barX}" y="576" width="${barW}" height="14" fill="${ink}" opacity="0.12"/>
  <rect x="${barX}" y="576" width="${barFill}" height="14" fill="${ink}"/>

  <!-- momentum -->
  <text x="80" y="670" font-family="${mono}" font-size="20" letter-spacing="4" fill="${faint}">MOMENTUM · 90-DAY</text>
  ${sparkline(m.deltas?.d90, 80, 690, 560, 96)}
  <text x="1000" y="760" text-anchor="end" font-family="${display}" font-weight="700" font-size="92" fill="${ink}">${esc(fmtPct(m.deltas?.d90))}</text>

  <line x1="80" y1="812" x2="1000" y2="812" stroke="${ink}" stroke-width="1" opacity="0.18"/>
  <!-- metadata grid -->
  ${metaCell(80, '30-DAY', fmtPct(m.deltas?.d30))}
  ${metaCell(320, 'YOY', fmtPct(m.deltas?.yoy))}
  ${metaCell(560, 'SENTIMENT', fmtSent(m.sentiment))}
  ${metaCell(800, 'INFLECTION', inflate)}

  <!-- co-occurrence -->
  <text x="80" y="952" font-family="${mono}" font-size="19" letter-spacing="2" fill="${faint}">WITH</text>
  <text x="170" y="952" font-family="${mono}" font-size="20" fill="${mute}">${esc(co)}</text>

  <line x1="80" y1="978" x2="1000" y2="978" stroke="${ink}" stroke-width="1" opacity="0.18"/>
  <!-- footer: firewall + signature + as-of -->
  <text x="80" y="1006" font-family="${mono}" font-size="15" fill="${faint}">${esc(camp.firewall || '')}</text>
  <text x="80" y="1030" font-family="${display}" font-weight="600" font-size="20" fill="${ink}">Velocity, not verdict.</text>
  <text x="1000" y="1030" text-anchor="end" font-family="${mono}" font-size="17" letter-spacing="2" fill="${faint}">MEASURED ${esc(asOf)}</text>
</svg>`;
}

// --- run over every measured term in every campaign ---
const files = readdirSync(CAMPAIGN_DIR).filter(f => /^\d\d\.json$/.test(f)).sort();
const manifest = [];
let count = 0;
for (const f of files) {
  const camp = JSON.parse(readFileSync(join(CAMPAIGN_DIR, f), 'utf-8'));
  const measured = (camp.terms || []).filter(t => t.measurement?.status === 'measured');
  for (const t of measured) {
    const slug = t.term.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const name = `c${camp.number}-${slug}.png`;
    const svg = card(t, camp);
    await sharp(Buffer.from(svg)).png().toFile(join(OUT_DIR, name));
    manifest.push({ file: `cards/${name}`, campaign: camp.number, term: t.term, velocityIndex: t.measurement.velocityIndex });
    count++;
  }
}
writeFileSync(join(OUT_DIR, 'index.json'), JSON.stringify(manifest, null, 2));
console.log(`wrote ${count} velocity cards to public/cards/ (+ index.json)`);
