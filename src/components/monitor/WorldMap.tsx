import { useMemo, useState } from 'react';
import { WORLD_DOTS } from './worldDots';
import type { GeoPoint } from './geo';

// Dot-matrix world map, drawn in grid-cell units (one land cell = one dot) with plain
// equirectangular math. Monochrome by construction: every mark is currentColor at
// some opacity, so it follows the ink/paper tokens in both themes. With no measured
// points it draws the land grid only, never a synthesized point.

const { step, lonMin, latMax, cols, rows, mask } = WORLD_DOTS;

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

/** lon/lat → grid units (x right, y down). */
export function project(lon: number, lat: number): [number, number] {
  return [(lon - lonMin) / step, (latMax - lat) / step];
}

// Density tiers: share of the word's located articles, spread over nearby land cells.
const GLOW_RADIUS = 3.2; // cells (~4.8°)
const TIERS = [
  { min: 0.06, opacity: 0.34, width: 0.62 },
  { min: 0.22, opacity: 0.55, width: 0.7 },
  { min: 0.45, opacity: 0.78, width: 0.78 },
  { min: 0.72, opacity: 1, width: 0.86 },
];

function glowPaths(points: GeoPoint[]): string[] {
  const acc = new Float32Array(cols * rows);
  for (const p of points) {
    if (p.lat == null || p.lon == null) continue;
    const [x, y] = project(p.lon, p.lat);
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

export interface MapLayers {
  grid: boolean;
  density: boolean;
  labels: boolean;
}

export function WorldMap({
  points,
  layers,
  ariaLabel,
}: {
  /** Measured places for the selected word; null when the map is pending. */
  points: GeoPoint[] | null;
  layers: MapLayers;
  ariaLabel: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const located = useMemo(
    () => (points ?? []).filter((p) => p.lat != null && p.lon != null),
    [points]
  );
  const glow = useMemo(() => glowPaths(located), [located]);
  const markers = located.slice(0, 12);
  const maxShare = markers.reduce((m, p) => Math.max(m, p.share), 0) || 1;
  const hovered = hover != null ? markers[hover] : undefined;

  return (
    <div className="relative w-full h-full text-ink select-none">
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
          strokeOpacity={located.length && layers.density ? 0.15 : 0.3}
          strokeWidth={0.6}
          strokeLinecap="round"
          fill="none"
          className="motion-safe:transition-[stroke-opacity] motion-safe:duration-500"
        />

        {layers.density &&
          glow.map((d, k) =>
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

        {markers.map((p, i) => {
          const [x, y] = project(p.lon!, p.lat!);
          const s = 0.7 + 1.6 * Math.sqrt(p.share / maxShare);
          const on = hover === i;
          return (
            <g
              key={`${p.name}-${i}`}
              transform={`translate(${x} ${y}) rotate(45)`}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="cursor-default"
            >
              <rect x={-s} y={-s} width={s * 2} height={s * 2} fill="none" stroke="currentColor" strokeWidth={on ? 0.32 : 0.2} />
              <rect x={-0.42} y={-0.42} width={0.84} height={0.84} fill="currentColor" />
              {/* generous invisible hit area */}
              <rect x={-s - 1} y={-s - 1} width={s * 2 + 2} height={s * 2 + 2} fill="transparent" />
            </g>
          );
        })}
      </svg>

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
        markers.slice(0, 5).map((p, i) => {
          const [x, y] = project(p.lon!, p.lat!);
          // Labels east of ~110°E sit left of their marker so they stay on the map.
          const flip = x / cols > 0.8;
          return (
            <span
              key={`l-${p.name}-${i}`}
              aria-hidden
              className={`pointer-events-none absolute small-caps text-[9px] tracking-[0.18em] text-ink bg-paper/80 px-1 py-0.5 border-ink whitespace-nowrap ${
                flip ? 'border-r' : 'border-l'
              }`}
              style={{
                left: `calc(${(x / cols) * 100}% ${flip ? '-' : '+'} 10px)`,
                top: `${(y / rows) * 100}%`,
                transform: flip ? 'translate(-100%, -50%)' : 'translateY(-50%)',
              }}
            >
              {shortName(p.name)}
            </span>
          );
        })}

      {hovered && (
        <div
          role="status"
          className="pointer-events-none absolute z-10 bg-canvas border border-ink/25 dossier-shadow px-3 py-2 space-y-0.5 max-w-[220px]"
          style={{
            left: `${(project(hovered.lon!, hovered.lat!)[0] / cols) * 100}%`,
            top: `${(project(hovered.lon!, hovered.lat!)[1] / rows) * 100}%`,
            transform: 'translate(-50%, calc(-100% - 14px))',
          }}
        >
          <div className="font-display font-semibold text-sm leading-tight">{hovered.name}</div>
          <div className="font-mono text-[11px] text-muted tabular-nums">
            {hovered.articles.toLocaleString('en-US')} articles · {(hovered.share * 100).toFixed(1)}%
          </div>
        </div>
      )}
    </div>
  );
}

export const MAP_ASPECT = cols / rows;
