// Shared Velocity Card renderer — ONE source of truth for the card design, imported by both
// the static generator (scripts/build-velocity-cards.mjs, Node) and the in-browser Card Studio
// (src/components/CardStudio.tsx, Vite). Plain ESM JS so both runtimes can import it.
//
// velocityCardSVG(data, theme, opts) -> a 1080x1080 SVG string. Monochrome/typographic; every
// number comes from `data` (measured, never invented); the firewall is baked into the footer.
//
// THEMES are curated, brand-safe background options: neutral lights, warms, and darks only — no
// red/blue partisan palette (brand non-negotiable #5). Each theme carries its own contrast colors.

export const THEMES = [
  { id: 'paper',    label: 'Paper',    bg: '#F5F5F3', fg: '#111111', mute: '#555555', faint: '#9A9A97', hair: '#D9D9D5' },
  { id: 'white',    label: 'White',    bg: '#FFFFFF', fg: '#111111', mute: '#555555', faint: '#8E8E8A', hair: '#E3E3DF' },
  { id: 'sand',     label: 'Sand',     bg: '#ECE5D8', fg: '#1A150E', mute: '#5E5443', faint: '#9A8E76', hair: '#D8CDB7' },
  { id: 'fog',      label: 'Fog',      bg: '#E3E6E8', fg: '#14181B', mute: '#52595E', faint: '#929B9F', hair: '#CBD0D3' },
  { id: 'graphite', label: 'Graphite', bg: '#3A3A38', fg: '#F4F4F1', mute: '#C0C0BA', faint: '#8E8E88', hair: '#565652' },
  { id: 'ink',      label: 'Ink',      bg: '#111111', fg: '#F5F5F3', mute: '#B5B5B0', faint: '#7C7C77', hair: '#343430' },
];
export const DEFAULT_THEME = THEMES[0];

const display = 'Space Grotesk, Arial, Helvetica, sans-serif';
const mono = 'JetBrains Mono, Consolas, monospace';

const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmtPct = (v) => v === null || v === undefined ? 'n/a' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(Math.round(v)) + '%';
const fmtSent = (v) => v === null || v === undefined ? 'n/a' : (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
const upper = (s) => String(s ?? '').toUpperCase();

function termSize(t) {
  const f = Math.floor(920 / ((t || '').length * 0.60));
  return Math.max(46, Math.min(132, f));
}

function sparkline(d90, c, x0, y0, w, h) {
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
    <line x1="${x0}" y1="${y0 + h / 2}" x2="${x0 + w}" y2="${y0 + h / 2}" stroke="${c.hair}" stroke-width="1"/>
    <polyline points="${poly}" fill="none" stroke="${c.fg}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="3.5" fill="${c.faint}"/>
    <rect x="${(ex - 7).toFixed(1)}" y="${(ey - 7).toFixed(1)}" width="14" height="14" fill="${c.fg}" transform="rotate(45 ${ex.toFixed(1)} ${ey.toFixed(1)})"/>`;
}

function metaCell(c, x, label, value) {
  return `
    <text x="${x}" y="838" font-family="${mono}" font-size="18" letter-spacing="2" fill="${c.faint}">${esc(label)}</text>
    <text x="${x}" y="880" font-family="${display}" font-weight="600" font-size="36" fill="${c.fg}">${esc(value)}</text>`;
}

/**
 * data: { term, domainTag, velocityIndex, adoptionStage, d30, d90, yoy, sentiment,
 *         inflection, coOccurrence[], campaignNumber, campaignShort, firewall, asOf }
 * theme: one of THEMES (or any {bg,fg,mute,faint,hair}); defaults to Paper.
 * opts: { width, height, style } for the <svg> tag (preview vs raster export).
 */
export function velocityCardSVG(data, theme = DEFAULT_THEME, opts = {}) {
  const c = theme || DEFAULT_THEME;
  const w = opts.width ?? 1080, h = opts.height ?? 1080;
  const styleAttr = opts.style ? ` style="${opts.style}"` : '';
  const vel = data.velocityIndex ?? 0;
  const velLabel = data.velocityIndex == null ? '—' : String(data.velocityIndex);
  const barX = 80, barW = 920, barFill = Math.max(6, Math.round(barW * vel / 100));
  let co = (data.coOccurrence || []).slice(0, 5).join('  ·  ');
  if (co.length > 58) co = (data.coOccurrence || []).slice(0, 4).join('  ·  ');
  const ts = termSize(data.term);
  const camp = `C${esc(data.campaignNumber)} · ${esc(upper(data.campaignShort || ''))}`;
  const asOfRight = data.asOf ? `MEASURED ${esc(data.asOf)}` : 'CONTEXTIVE.INFO';
  const div = (y) => `<line x1="80" y1="${y}" x2="1000" y2="${y}" stroke="${c.fg}" stroke-width="1" opacity="0.16"/>`;

  return `<svg width="${w}" height="${h}" viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg"${styleAttr}>
  <rect width="1080" height="1080" fill="${c.bg}"/>
  <rect x="36" y="36" width="1008" height="1008" fill="none" stroke="${c.fg}" stroke-width="1.5"/>

  <rect x="80" y="86"  width="60" height="6" fill="${c.fg}"/>
  <rect x="80" y="98"  width="38" height="6" fill="${c.fg}"/>
  <rect x="80" y="110" width="60" height="6" fill="${c.fg}"/>
  <text x="160" y="112" font-family="${mono}" font-size="20" letter-spacing="5" fill="${c.mute}">CONTEXTIVE</text>
  <text x="1000" y="112" text-anchor="end" font-family="${mono}" font-size="17" letter-spacing="3" fill="${c.faint}">${camp}</text>
  ${div(138)}

  <text x="80" y="276" font-family="${display}" font-weight="700" font-size="${ts}" letter-spacing="0.5" fill="${c.fg}">${esc(data.term)}</text>
  <text x="82" y="320" font-family="${mono}" font-size="19" letter-spacing="3" fill="${c.mute}">${esc(data.domainTag || '')}</text>

  <text x="80" y="406" font-family="${mono}" font-size="19" letter-spacing="4" fill="${c.faint}">VELOCITY INDEX</text>
  <text x="1000" y="500" text-anchor="end" font-family="${display}" font-weight="600" font-size="38" letter-spacing="1" fill="${c.fg}">${esc(upper(data.adoptionStage || ''))}</text>
  <text x="76" y="530" font-family="${display}" font-weight="700" font-size="128" fill="${c.fg}">${esc(velLabel)}<tspan font-family="${display}" font-weight="500" font-size="46" fill="${c.faint}"> /100</tspan></text>
  <rect x="${barX}" y="566" width="${barW}" height="16" rx="8" fill="${c.hair}"/>
  <rect x="${barX}" y="566" width="${barFill}" height="16" rx="8" fill="${c.fg}"/>

  <text x="80" y="652" font-family="${mono}" font-size="19" letter-spacing="4" fill="${c.faint}">MOMENTUM · 90 DAY</text>
  ${sparkline(data.d90, c, 80, 668, 520, 86)}
  <text x="1000" y="748" text-anchor="end" font-family="${display}" font-weight="700" font-size="84" fill="${c.fg}">${esc(fmtPct(data.d90))}</text>

  ${div(792)}
  ${metaCell(c, 80, '30-DAY', fmtPct(data.d30))}
  ${metaCell(c, 310, 'YOY', fmtPct(data.yoy))}
  ${metaCell(c, 540, 'SENTIMENT', fmtSent(data.sentiment))}
  ${metaCell(c, 770, 'INFLECTION', data.inflection || 'n/a')}

  <text x="80" y="938" font-family="${mono}" font-size="18" letter-spacing="2" fill="${c.faint}">WITH</text>
  <text x="168" y="938" font-family="${mono}" font-size="19" fill="${c.mute}">${esc(co)}</text>

  ${div(966)}
  <text x="80" y="994" font-family="${mono}" font-size="13" fill="${c.faint}">${esc(data.firewall || '')}</text>
  <text x="80" y="1022" font-family="${display}" font-weight="600" font-size="19" fill="${c.fg}">Velocity, not verdict.</text>
  <text x="1000" y="1022" text-anchor="end" font-family="${mono}" font-size="16" letter-spacing="2" fill="${c.faint}">${asOfRight}</text>
</svg>`;
}
