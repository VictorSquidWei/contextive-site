// Generates public/og-image.png — the social share card (1200x630).
// On-brand: monochrome, editorial, the stacked-bar mark + the signature line.
// Run: node scripts/build-og-image.mjs   (needs devDependency `sharp`)
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'og-image.png');

const ink = '#111111';
const mute = '#555555';
const paper = '#F5F5F3';
const display = 'Space Grotesk, Arial, Helvetica, sans-serif';
const mono = 'JetBrains Mono, Consolas, monospace';

// Ascending "velocity" sparkline (a data-like moment, not data) — lower right.
const spark = [
  [past(0), 500], [past(1), 494], [past(2), 506], [past(3), 482], [past(4), 488],
  [past(5), 466], [past(6), 474], [past(7), 446], [past(8), 452], [past(9), 420], [past(10), 392],
];
function past(i) { return 812 + i * 30; }
const sparkPts = spark.map(([x, y]) => `${x},${y}`).join(' ');
const [endX, endY] = spark[spark.length - 1];

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="${paper}"/>
  <rect x="40" y="40" width="1120" height="550" fill="none" stroke="${ink}" stroke-width="1.5"/>

  <!-- stacked-bar mark -->
  <rect x="80" y="96"  width="116" height="7" fill="${ink}"/>
  <rect x="80" y="113" width="74"  height="7" fill="${ink}"/>
  <rect x="80" y="130" width="116" height="7" fill="${ink}"/>
  <text x="224" y="128" font-family="${mono}" font-size="22" letter-spacing="6" fill="${mute}">LANGUAGE INTELLIGENCE</text>

  <!-- wordmark -->
  <text x="76" y="340" font-family="${display}" font-weight="700" font-size="132" letter-spacing="1" fill="${ink}">CONTEXTIVE</text>

  <!-- signature line + descriptor -->
  <text x="80" y="418" font-family="${display}" font-weight="500" font-size="46" fill="${ink}">Velocity, not verdict.</text>
  <text x="80" y="462" font-family="${display}" font-weight="400" font-size="26" fill="${mute}">How public language gains momentum and shifts meaning.</text>

  <!-- domains -->
  <text x="80" y="548" font-family="${mono}" font-size="20" letter-spacing="4" fill="${mute}">POLITICS · THE ECONOMY · AI · CULTURE</text>

  <!-- velocity sparkline -->
  <line x1="812" y1="520" x2="1112" y2="520" stroke="${ink}" stroke-width="1" opacity="0.18"/>
  <polyline points="${sparkPts}" fill="none" stroke="${ink}" stroke-width="2.5" opacity="0.55"/>
  <rect x="${endX - 6}" y="${endY - 6}" width="12" height="12" fill="${ink}" transform="rotate(45 ${endX} ${endY})"/>
</svg>`;

await sharp(Buffer.from(svg)).png().toFile(OUT);
console.log('wrote', OUT);
