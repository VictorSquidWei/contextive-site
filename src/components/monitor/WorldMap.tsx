import { useEffect, useMemo, useRef, useState } from 'react';
import { WORLD_DOTS } from './worldDots';
import type { GeoPoint } from './geo';

// Dot-matrix world map in the Miller projection, drawn in grid-cell units (one land
// cell = one dot). Monochrome by construction: every mark is currentColor at some
// opacity, so it follows the ink/paper tokens in both themes. With no measured
// points it draws the land grid only, never a synthesized point.

const { lonMin, latMax, latMin, cols, rows, mask } = WORLD_DOTS;

const RAD = Math.PI / 180;
const miller = (lat: number) => 1.25 * Math.log(Math.tan(Math.PI / 4 + 0.4 * lat * RAD));
const Y_MAX = miller(latMax);
const Y_MIN = miller(latMin);

export const MAP_ASPECT = cols / rows;

function decodeMask(): Uint8Array {
  const bin = atob(mask);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}
const BITS = decodeMask();
const isLand = (c: number, r: number) => {
  if (c < 0 || r < 0 || c >= cols || r >= rows) return false;
  const i = r * cols + c;
  return (BITS[i >> 3] & (1 << (i & 7))) !== 0;
};

/** Every land dot as one path of zero-length subpaths (a round cap draws each dot). */
const LAND_PATH = (() => {
  let d = '';
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) if (isLand(c, r)) d += `M${c + 0.5} ${r + 0.5}h0`;
  return d;
})();

/** lon/lat → grid units (x right, y down), clamped to the cropped latitude range. */
export function project(lon: number, lat: number): [number, number] {
  const y = miller(Math.max(latMin, Math.min(latMax, lat)));
  return [((lon - lonMin) / 360) * cols, ((Y_MAX - y) / (Y_MAX - Y_MIN)) * rows];
}

// Density tiers: share of the word's located articles, spread over nearby land cells.
const GLOW_RADIUS = 4.5; // cells
const TIERS = [
  { min: 0.06, opacity: 0.34, width: 0.62 },
  { min: 0.22, opacity: 0.55, width: 0.7 },
  { min: 0.45, opacity: 0.78, width: 0.78 },
  { min: 0.72, opacity: 1, width: 0.86 },
];
export const LEGEND_OPACITIES = [0.2, ...TIERS.map((t) => t.opacity)];

function glowPaths(points: GeoPoint[]): string[] {
  const acc = new Float32Array(cols * rows);
  for (const p of points) {
    const [x, y] = project(p.lon!, p.lat!);
    const r0 = Math.max(0, Math.floor(y - GLOW_RADIUS));
    const r1 = Math.min(rows - 1, Math.ceil(y + GLOW_RADIUS));
    const c0 = Math.max(0, Math.floor(x - GLOW_RADIUS));
    const c1 = Math.min(cols - 1, Math.ceil(x + GLOW_RADIUS));
    for (let r = r0; r <= r1; r++)
      for (let c = c0; c <= c1; c++) {
        if (!isLand(c, r)) continue;
        const d = Math.hypot(c + 0.5 - x, r + 0.5 - y) / GLOW_RADIUS;
        if (d < 1) acc[r * cols + c] += p.share * (1 - d) * (1 - d);
      }
  }
  let max = 0;
  for (let i = 0; i < acc.length; i++) if (acc[i] > max) max = acc[i];
  const paths = TIERS.map(() => '');
  if (max <= 0) return paths;
  for (let i = 0; i < acc.length; i++) {
    if (acc[i] <= 0) continue;
    const v = Math.sqrt(acc[i] / max);
    let t = -1;
    for (let k = TIERS.length - 1; k >= 0; k--) if (v >= TIERS[k].min) { t = k; break; }
    if (t < 0) continue;
    const c = i % cols;
    const r = (i - c) / cols;
    paths[t] += `M${c + 0.5} ${r + 0.5}h0`;
  }
  return paths;
}

const LAT_LINES = [60, 30, 0, -30];
const LON_LINES = [-120, -60, 0, 60, 120];
const latLabel = (v: number) => (v === 0 ? '0°' : `${Math.abs(v)}°${v > 0 ? 'N' : 'S'}`);
const lonLabel = (v: number) => (v === 0 ? '0°' : `${Math.abs(v)}°${v > 0 ? 'E' : 'W'}`);
const shortName = (n: string) => n.split(',')[0].trim();

// Label metrics in px (9px mono small caps, 0.18em tracking, 4px padding each side).
const LABEL_CHAR_PX = 7;
const LABEL_PAD_PX = 10;
const LABEL_GAP_PX = 10;
const LABEL_H_PX = 22; // the rendered label is ~18px tall; the rest keeps labels apart

// Markers whose centres land closer than this on screen merge into one. GDELT often
// names a city, its country and the country's centroid within a few pixels of each
// other (Gaza, Israel, Jerusalem, Hebron in one Middle East pile), and stacked
// diamonds with labels on both sides read as one place with two names.
const CLUSTER_PX = 14;
const MAX_MARKERS = 12;
const LABEL_NAMES = 1;

const markerSize = (share: number, maxShare: number) => 0.7 + 1.6 * Math.sqrt(share / maxShare);

interface Cluster {
  /** The most-named place here; it sets the marker's position and size. */
  p: GeoPoint;
  /** Every place merged into this marker, most-named first (p included). */
  members: GeoPoint[];
  x: number;
  y: number;
}

/** Up to `max` markers, most-named place first; a place within CLUSTER_PX of a marker
    joins it instead of drawing its own. `cellPx` converts px into grid cells. */
function clusterMarkers(points: GeoPoint[], max: number, cellPx: number): Cluster[] {
  const r = CLUSTER_PX / cellPx;
  const out: Cluster[] = [];
  for (const p of points) {
    const [x, y] = project(p.lon!, p.lat!);
    const near = out.find((c) => Math.hypot(c.x - x, c.y - y) < r);
    if (near) near.members.push(p);
    else if (out.length < max) out.push({ p, members: [p], x, y });
  }
  return out;
}

/** The distinct short names at a marker, most-named first. */
const clusterNames = (c: Cluster) => [...new Set(c.members.map((m) => shortName(m.name)))];
/** The top places are hotspots: ranked, pulsing, and labelled with their own share. */
const HOTSPOTS = 3;
const rankTag = (i: number) => String(i + 1).padStart(2, '0');
/** Hotspots carry their rank only. Shares live in the word card, which counts by
    country; a marker counts one geocoded place, so the two can differ for the same name. */
const labelText = (c: Cluster, i: number) => {
  const names = clusterNames(c).slice(0, LABEL_NAMES).join(' · ');
  return i < HOTSPOTS ? `${rankTag(i)} ${names}` : names;
};

/** Place up to `max` labels, each right of its marker, else left, else not at all, so
    no two overlap and none covers a comparable marker. `cellPx` converts px into cells. */
function placeLabels(clusters: Cluster[], max: number, cellPx: number, maxShare: number) {
  const placed: { x0: number; x1: number; y: number; c: Cluster; flip: boolean; i: number }[] = [];
  const gap = LABEL_GAP_PX / cellPx;
  const h = LABEL_H_PX / cellPx;
  const boxes = clusters.map((c) => ({ c, r: markerSize(c.p.share, maxShare) * Math.SQRT2 }));
  for (const [i, c] of clusters.entries()) {
    if (placed.length >= max) break;
    const { x, y } = c;
    const w = (labelText(c, i).length * LABEL_CHAR_PX + LABEL_PAD_PX) / cellPx;
    // East of ~110°E labels go left (they would run off the map); in the west quarter
    // they only go right, so none slides under the word rail that floats there.
    const fx = x / cols;
    // A hotspot (top three) may also try its other side, and may run over smaller
    // markers, so every ranked place gets its label.
    const hot = i < HOTSPOTS;
    const sides = fx > 0.8 ? [true, ...(hot ? [false] : [])] : fx < 0.25 ? [false, ...(hot ? [true] : [])] : [false, true];
    let done = false;
    // A hotspot that collides at its own height tries just above, then just below.
    for (const dy of hot ? [0, -h, h] : [0]) {
      if (done) break;
      const ly = y + dy;
      for (const flip of sides) {
        const x0 = flip ? x - gap - w : x + gap;
        const x1 = x0 + w;
        if (x0 < 0 || x1 > cols || ly < h / 2 || ly > rows - h / 2) continue;
        if (placed.some((q) => Math.abs(q.y - ly) < h && x0 < q.x1 && q.x0 < x1)) continue;
        // A label may run over a markedly smaller marker (under 70% of its own place's
        // share), never over one near its own size.
        const covers = boxes.some(
          (b) =>
            b.c !== c &&
            b.c.p.share >= c.p.share * 0.7 &&
            x0 < b.c.x + b.r && b.c.x - b.r < x1 && Math.abs(b.c.y - ly) < h / 2 + b.r
        );
        if (covers && !hot) continue;
        placed.push({ x0, x1, y: ly, c, flip, i });
        done = true;
        break;
      }
    }
  }
  return placed;
}
function pct(v: number) {
  return `${(v * 100).toFixed(v >= 0.1 ? 0 : 1)}%`;
}

export interface MapLayers {
  grid: boolean;
  density: boolean;
  labels: boolean;
}

export function WorldMap({
  points,
  layers,
  ariaLabel,
  motionKey = '',
}: {
  /** Measured places for the selected word; null when the map is pending. */
  points: GeoPoint[] | null;
  layers: MapLayers;
  ariaLabel: string;
  /** Changes with the selected word, so the density, markers and labels replay their entrance. */
  motionKey?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const [cellPx, setCellPx] = useState(6);
  useEffect(() => {
    const el = boxRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(([e]) => setCellPx(Math.max(1, e.contentRect.width / cols)));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const located = useMemo(
    () => (points ?? []).filter((p) => p.lat != null && p.lon != null),
    [points]
  );
  const glow = useMemo(() => glowPaths(located), [located]);
  const markers = useMemo(() => clusterMarkers(located, MAX_MARKERS, cellPx), [located, cellPx]);
  const maxShare = markers.reduce((m, c) => Math.max(m, c.p.share), 0) || 1;
  const hovered = hover != null ? markers[hover] : undefined;

  return (
    <div ref={boxRef} className="relative w-full h-full text-ink select-none" onMouseLeave={() => setHover(null)}>
      <svg
        viewBox={`0 0 ${cols} ${rows}`}
        className="absolute inset-0 w-full h-full"
        role="img"
        aria-label={ariaLabel}
      >
        {layers.grid && (
          <g stroke="currentColor" strokeWidth={0.08} opacity={0.22} fill="none">
            {LAT_LINES.map((lat) => {
              const y = project(0, lat)[1];
              return (
                <line key={lat} x1={0} x2={cols} y1={y} y2={y} strokeDasharray={lat === 0 ? undefined : '0.5 0.7'} />
              );
            })}
            {LON_LINES.map((lon) => {
              const x = project(lon, 0)[0];
              return <line key={lon} x1={x} x2={x} y1={0} y2={rows} strokeDasharray="0.5 0.7" />;
            })}
          </g>
        )}

        <path
          d={LAND_PATH}
          stroke="currentColor"
          strokeOpacity={located.length && layers.density ? 0.16 : 0.3}
          strokeWidth={0.6}
          strokeLinecap="round"
          fill="none"
          className="mon-fade motion-safe:transition-[stroke-opacity] motion-safe:duration-500"
        />

        {layers.density && (
          <g key={`glow-${motionKey}`} className="mon-fade">
            {glow.map((d, k) =>
              d ? (
                <path
                  key={k}
                  d={d}
                  stroke="currentColor"
                  strokeOpacity={TIERS[k].opacity}
                  strokeWidth={TIERS[k].width}
                  strokeLinecap="round"
                  fill="none"
                />
              ) : null
            )}
          </g>
        )}

        {markers.map(({ p, x, y }, i) => {
          const s = markerSize(p.share, maxShare);
          const on = hover === i;
          const hot = i < HOTSPOTS;
          return (
            <g
              key={`${motionKey}-${p.name}-${i}`}
              transform={`translate(${x} ${y}) rotate(45)`}
              onMouseEnter={() => setHover(i)}
              onClick={() => setHover(on ? null : i)}
              className="cursor-default"
            >
              <g className="mon-pop" style={{ animationDelay: `${150 + i * 70}ms` }}>
                {hot && (
                  <rect
                    x={-s}
                    y={-s}
                    width={s * 2}
                    height={s * 2}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={0.16}
                    className="mon-pulse"
                    style={{ animationDelay: `${600 + i * 800}ms` }}
                  />
                )}
                <rect
                  x={-s}
                  y={-s}
                  width={s * 2}
                  height={s * 2}
                  fill={hot ? 'currentColor' : 'none'}
                  fillOpacity={hot ? 0.12 : 0}
                  stroke="currentColor"
                  strokeWidth={on || hot ? 0.34 : 0.2}
                />
                <rect x={-0.42} y={-0.42} width={0.84} height={0.84} fill="currentColor" />
              </g>
              {/* generous invisible hit area */}
              <rect x={-s - 1} y={-s - 1} width={s * 2 + 2} height={s * 2 + 2} fill="transparent" />
            </g>
          );
        })}
      </svg>

      {/* A slow, faint sweep across the map: decoration only, off under reduced motion. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="mon-scan absolute inset-y-0 left-0 w-[16%] bg-gradient-to-r from-transparent via-ink/[0.06] to-transparent" />
      </div>

      {/* Graticule labels: HTML so they stay a constant, readable size. */}
      {layers.grid && (
        <div aria-hidden className="pointer-events-none absolute inset-0 font-mono text-[9px] text-muted">
          {LAT_LINES.map((lat) => (
            <span
              key={lat}
              className="absolute left-1 -translate-y-1/2 tabular-nums"
              style={{ top: `${(project(0, lat)[1] / rows) * 100}%` }}
            >
              {latLabel(lat)}
            </span>
          ))}
          {LON_LINES.map((lon) => (
            <span
              key={lon}
              className="absolute bottom-0.5 -translate-x-1/2 tabular-nums"
              style={{ left: `${(project(lon, 0)[0] / cols) * 100}%` }}
            >
              {lonLabel(lon)}
            </span>
          ))}
        </div>
      )}

      {/* Labels for the most-named places. */}
      {layers.labels &&
        placeLabels(markers, 5, cellPx, maxShare).map(({ c, flip, i, y }) => {
          const { x } = c;
          // Rank 1 is inverted, ranks 2–3 are boxed, the rest stay plain.
          const tone =
            i === 0
              ? 'bg-ink text-paper font-bold'
              : i < HOTSPOTS
                ? 'bg-paper/90 text-ink font-semibold border border-ink/60'
                : `bg-paper/80 text-ink border-ink ${flip ? 'border-r' : 'border-l'}`;
          return (
            <span
              key={`l-${motionKey}-${c.p.name}-${i}`}
              aria-hidden
              className="pointer-events-none absolute"
              style={{
                left: `calc(${(x / cols) * 100}% ${flip ? '-' : '+'} 10px)`,
                top: `${(y / rows) * 100}%`,
                transform: flip ? 'translate(-100%, -50%)' : 'translateY(-50%)',
              }}
            >
              <span
                className={`mon-rise block small-caps text-[9px] tracking-[0.18em] px-1 py-0.5 whitespace-nowrap ${tone}`}
                style={{ animationDelay: `${350 + i * 90}ms` }}
              >
                {labelText(c, i)}
              </span>
            </span>
          );
        })}

      {hovered && (
        <div
          role="status"
          className="pointer-events-none absolute z-10 bg-canvas border border-ink/25 dossier-shadow px-3 py-2 space-y-0.5 max-w-[220px]"
          style={{
            left: `${(hovered.x / cols) * 100}%`,
            top: `${(hovered.y / rows) * 100}%`,
            transform: 'translate(-50%, calc(-100% - 14px))',
          }}
        >
          {hovered.members.slice(0, 4).map((m, k) => (
            <div key={`${m.name}-${k}`} className={k ? 'pt-1' : undefined}>
              <div className={`font-display leading-tight ${k ? 'text-xs' : 'font-semibold text-sm'}`}>{m.name}</div>
              <div className="font-mono text-[11px] text-muted tabular-nums">
                {m.articles.toLocaleString('en-US')} articles · {pct(m.share)}
              </div>
            </div>
          ))}
          {hovered.members.length > 4 && (
            <div className="font-mono text-[11px] text-muted pt-1">+{hovered.members.length - 4} more places here</div>
          )}
        </div>
      )}
    </div>
  );
}
