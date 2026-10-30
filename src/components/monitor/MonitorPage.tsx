// Monitor — a full-page dashboard of the tracked words: which are moving, and (once
// the gdelt-geo instrument has run) where the articles using them name places.
//
// Two instruments, never mixed:
//   * velocity (gdelt-coverage): the measured campaign data and its plainRead() labels;
//   * gdelt-geo: places named in articles that use the word (./geo.ts). Pending until
//     a measured run lands; the map then draws only measured places.
// Freshness is honest: "Measured as of {date}" until FreshnessBadge's LIVE_MODE is
// flipped, which only happens once the daily refresh loop is verified live.

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ALL_CAMPAIGNS } from '../../data/campaigns';
import { FIREWALL, campaignPath, type Campaign, type CampaignTerm } from '../../data/campaign';
import { plainRead, humanPct, type PlainRead, type Trend } from '../../lib/readSignal';
import { LIVE_MODE } from '../FreshnessBadge';
import { WorldMap, type MapLayers } from './WorldMap';
import { GEO, geoFor, fmtDate, fmtRange } from './geo';

interface Row {
  key: string;
  c: Campaign;
  t: CampaignTerm;
  read: PlainRead;
  /** 90-day momentum, falling back to 30-day: the same figure plainRead() labels. */
  delta: number | null;
  span: '90-day' | '30-day' | null;
}

const CAMPAIGNS = ALL_CAMPAIGNS.filter((c) => c.signalBasis === 'measured');

const ROWS: Row[] = CAMPAIGNS.flatMap((c) =>
  c.terms.map((t) => {
    const d = t.measurement.deltas;
    const delta = d?.d90 ?? d?.d30 ?? null;
    return {
      key: `${c.number}|${t.term.trim().toLowerCase()}`,
      c,
      t,
      read: plainRead(t),
      delta,
      span: d?.d90 != null ? '90-day' : d?.d30 != null ? '30-day' : null,
    } as Row;
  })
);

const TRENDS: { key: Trend | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'surging', label: 'Surging' },
  { key: 'rising', label: 'Rising' },
  { key: 'steady', label: 'Steady' },
  { key: 'cooling', label: 'Cooling' },
  { key: 'fading', label: 'Fading' },
];

const byMove = (a: Row, b: Row) =>
  Math.abs(b.delta ?? 0) - Math.abs(a.delta ?? 0) || a.t.term.localeCompare(b.t.term);

const readoutHref = (r: Row) =>
  `/campaigns/${r.c.id}/readout#${(r.t.ref || r.t.term).replace(/[^a-zA-Z0-9-]/g, '-')}`;

function Diamond({ filled = false, className = '' }: { filled?: boolean; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block w-1.5 h-1.5 rotate-45 shrink-0 border border-current ${filled ? 'bg-current' : ''} ${className}`}
    />
  );
}

function Chip({ read }: { read: PlainRead }) {
  return (
    <span
      className={`small-caps text-[9px] tracking-[0.2em] px-1.5 py-0.5 border whitespace-nowrap ${
        read.pending ? 'border-dashed border-ink/30 text-muted' : 'border-ink/25'
      }`}
    >
      {read.chip}
    </span>
  );
}

// ── Status bar ────────────────────────────────────────────────────────────────
function StatusBar({ scope }: { scope: Campaign | null }) {
  const dates = CAMPAIGNS.map((c) => c.refDate).filter(Boolean).sort() as string[];
  const inScope = scope ? ROWS.filter((r) => r.c === scope) : ROWS;
  const measured = inScope.filter((r) => !r.read.pending).length;
  const freshness = LIVE_MODE
    ? 'Live · updated daily'
    : scope
      ? `Measured as of ${fmtDate(scope.refDate)}`
      : `Measured ${fmtRange(dates[0], dates[dates.length - 1])}`;
  const mapState =
    GEO.status === 'measured' && GEO.window
      ? `Map ${fmtRange(GEO.window.start, GEO.window.end)}`
      : 'Map pending';

  return (
    <div className="border-b border-rule bg-canvas">
      <div className="px-4 lg:px-6 py-2.5 flex items-center gap-x-5 gap-y-1.5 flex-wrap small-caps text-[10px] text-muted">
        <span className="flex items-center gap-2 text-ink">
          <Diamond filled />
          <span className="font-display font-bold text-[13px] tracking-[0.18em]">Monitor</span>
        </span>
        <span className="flex items-center gap-1.5 text-ink">
          {LIVE_MODE && <Diamond filled className="motion-safe:animate-pulse" />}
          {freshness}
        </span>
        <span className="tabular-nums">
          {measured} measured · {inScope.length - measured} pending
        </span>
        <span className="hidden sm:inline">Velocity · gdelt-coverage</span>
        <span className="flex items-center gap-1.5">
          <Diamond filled={GEO.status === 'measured'} />
          {mapState} · gdelt-geo
        </span>
        <span className="hidden xl:inline ml-auto text-ink">Velocity, not verdict</span>
      </div>
    </div>
  );
}

// ── Words panel ───────────────────────────────────────────────────────────────
function WordsPanel({
  scope,
  setScope,
  trend,
  setTrend,
  selected,
  onSelect,
}: {
  scope: Campaign | null;
  setScope: (c: Campaign | null) => void;
  trend: Trend | 'all';
  setTrend: (t: Trend | 'all') => void;
  selected: string | null;
  onSelect: (r: Row) => void;
}) {
  const inScope = scope ? ROWS.filter((r) => r.c === scope) : ROWS;
  const measured = inScope.filter((r) => !r.read.pending).sort(byMove);
  const pending = inScope.filter((r) => r.read.pending);
  const shown = trend === 'all' ? measured : measured.filter((r) => r.read.trend === trend);
  const count = (k: Trend | 'all') =>
    k === 'all' ? measured.length : measured.filter((r) => r.read.trend === k).length;

  return (
    <div className="flex flex-col min-h-0 flex-1">
      <div className="px-4 lg:px-5 pt-4 pb-3 space-y-3 border-b border-rule">
        <div className="flex items-baseline justify-between gap-3">
          <h2 className="small-caps text-ink">Words moving</h2>
          <span className="small-caps text-[9px] text-muted tabular-nums">{shown.length} shown</span>
        </div>

        <label className="block">
          <span className="sr-only">Campaign</span>
          <select
            value={scope?.number ?? 'all'}
            onChange={(e) => setScope(CAMPAIGNS.find((c) => c.number === e.target.value) ?? null)}
            className="w-full bg-canvas border border-rule hover:border-ink/40 focus:border-ink px-3 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-ink rounded-none"
          >
            <option value="all">All {CAMPAIGNS.length} campaigns</option>
            {CAMPAIGNS.map((c) => (
              <option key={c.id} value={c.number}>
                C{c.number} · {c.shortTitle}
              </option>
            ))}
          </select>
        </label>

        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter by momentum label">
          {TRENDS.map((t) => {
            const n = count(t.key);
            const on = t.key === trend;
            return (
              <button
                key={t.key}
                type="button"
                aria-pressed={on}
                disabled={n === 0 && !on}
                onClick={() => setTrend(t.key)}
                className={`small-caps text-[9px] tracking-[0.18em] px-2 py-1 border transition-colors disabled:opacity-35 ${
                  on ? 'bg-ink text-paper border-ink' : 'border-rule text-muted hover:text-ink hover:border-ink/40'
                }`}
              >
                {t.label} <span className="tabular-nums opacity-70">{n}</span>
              </button>
            );
          })}
        </div>

        <p className="text-[11px] leading-snug text-muted">
          Sorted by the size of each word's measured move. Every figure carries the date it was measured.
        </p>
      </div>

      <ol className="flex-1 min-h-0 overflow-y-auto divide-y divide-rule">
        {shown.map((r, i) => {
          const on = r.key === selected;
          return (
            <li key={r.key}>
              <button
                type="button"
                onClick={() => onSelect(r)}
                aria-current={on ? 'true' : undefined}
                className={`w-full text-left pl-3 pr-4 lg:pr-5 py-3 flex items-start gap-3 border-l-2 transition-colors ${
                  on ? 'border-ink bg-ink/[0.045]' : 'border-transparent hover:bg-ink/[0.025]'
                }`}
              >
                <span className="font-mono text-[10px] text-muted w-5 pt-0.5 tabular-nums shrink-0">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 min-w-0 space-y-1">
                  <span className="flex items-center gap-2 flex-wrap">
                    <span className="font-display font-bold text-[15px] leading-tight uppercase tracking-tight break-words min-w-0">
                      {r.t.term}
                    </span>
                    <Chip read={r.read} />
                  </span>
                  <span className="block font-mono text-[10px] text-muted tracking-wide">
                    C{r.c.number} · {fmtDate(r.c.refDate)}
                  </span>
                </span>
                <span className="text-right shrink-0 leading-tight">
                  <span className="block font-mono text-sm font-medium tabular-nums">{humanPct(r.delta)}</span>
                  <span className="small-caps text-[8px] text-muted">{r.span}</span>
                </span>
              </button>
            </li>
          );
        })}
        {shown.length === 0 && (
          <li className="px-5 py-6 text-sm text-muted">No measured word carries this label here.</li>
        )}
        {pending.length > 0 && (
          <li>
            <details className="group px-4 lg:px-5 py-3">
              <summary className="cursor-pointer small-caps text-[10px] text-muted hover:text-ink list-none flex items-center gap-2">
                <span className="transition-transform group-open:rotate-90" aria-hidden>›</span>
                Pending · {pending.length} {pending.length === 1 ? 'word' : 'words'}
              </summary>
              <p className="mt-2 text-[11px] text-muted leading-snug">
                Too rare in the coverage to measure reliably, so they carry no number.
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {pending.map((r) => (
                  <li key={r.key} className="font-mono text-[10px] uppercase tracking-wide border border-dashed border-ink/25 px-1.5 py-0.5 text-muted">
                    {r.t.term}
                  </li>
                ))}
              </ul>
            </details>
          </li>
        )}
      </ol>
    </div>
  );
}

// ── Map panel ─────────────────────────────────────────────────────────────────
function LayerToggle({
  label,
  on,
  disabled,
  onClick,
}: {
  label: string;
  on: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on && !disabled}
      disabled={disabled}
      onClick={onClick}
      className="flex items-center gap-2 small-caps text-[9px] tracking-[0.18em] text-ink disabled:text-muted disabled:opacity-60 py-0.5"
    >
      <span
        aria-hidden
        className={`w-2.5 h-2.5 border border-current flex items-center justify-center ${on && !disabled ? '' : 'opacity-60'}`}
      >
        {on && !disabled && <span className="w-1 h-1 bg-current" />}
      </span>
      {label}
    </button>
  );
}

function MapPanel({ row }: { row: Row | undefined }) {
  const [layers, setLayers] = useState<MapLayers>({ grid: true, density: true, labels: true });
  const geo = row ? geoFor(row.c.number, row.t.term) : undefined;
  const points = geo?.places ?? null;
  const flip = (k: keyof MapLayers) => setLayers((l) => ({ ...l, [k]: !l[k] }));
  const measuredFile = GEO.status === 'measured';
  const win = geo?.window ?? GEO.window;

  const aria = points
    ? `World map of places named in articles that use "${row?.t.term}". Most named: ${points
        .slice(0, 3)
        .map((p) => p.name)
        .join('; ')}.`
    : 'World map. The places layer is pending, so no places are drawn.';

  // Why the map has no points, stated in one line above it (never a synthesized point).
  const pendingNote = !measuredFile
    ? 'The places layer has not been measured yet. Until that scan runs the map carries no points: we never draw a place we have not measured.'
    : row && !geo
      ? row.read.pending
        ? 'This word is too rare in the coverage to measure, so it has no map.'
        : 'Too few articles using this word named a place in this window to draw a map.'
      : null;

  return (
    <div className="flex flex-col">
      <div className="px-4 lg:px-5 py-2.5 border-b border-rule flex items-center gap-x-4 gap-y-1 flex-wrap">
        <span className="small-caps text-[10px] text-muted">Places named in articles that use</span>
        <span className="font-display font-bold uppercase tracking-tight text-sm leading-tight">
          {row ? `“${row.t.term}”` : '—'}
        </span>
        <span className="ml-auto font-mono text-[10px] text-muted tabular-nums">
          {measuredFile && win ? fmtRange(win.start, win.end) : 'window pending'}
        </span>
      </div>

      {pendingNote && (
        <p className="px-4 lg:px-5 py-2 border-b border-rule bg-canvas flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2 text-[12px] leading-snug text-muted">
          <span className="small-caps text-[9px] text-ink flex items-center gap-1.5 shrink-0 pt-px">
            <Diamond /> {measuredFile ? 'No map' : 'gdelt-geo · pending'}
          </span>
          <span>{pendingNote}</span>
        </p>
      )}

      {/* The map keeps its own aspect; the campaign panel takes the height below it. */}
      <div className="relative bg-paper overflow-hidden">
        <div className="relative w-full aspect-[240/94]">
          <WorldMap points={points} layers={layers} ariaLabel={aria} />
        </div>

        <div className="hidden lg:block absolute top-3 right-3 bg-canvas/90 border border-rule px-3 py-2 space-y-1">
          <div className="small-caps text-[9px] text-muted mb-1">Layers</div>
          <LayerToggle label="Grid" on={layers.grid} onClick={() => flip('grid')} />
          <LayerToggle label="Density" on={layers.density} disabled={!points} onClick={() => flip('density')} />
          <LayerToggle label="Labels" on={layers.labels} disabled={!points} onClick={() => flip('labels')} />
        </div>

        {points && (
        <div className="hidden lg:flex absolute bottom-3 left-3 bg-canvas/90 border border-rule px-3 py-2 items-center gap-3">
          <span className="small-caps text-[9px] text-muted">Fewer</span>
          <span className="flex items-center gap-1" aria-hidden>
            {[0.2, 0.34, 0.55, 0.78, 1].map((o) => (
              <span key={o} className="w-1.5 h-1.5 rounded-full bg-ink" style={{ opacity: o }} />
            ))}
          </span>
          <span className="small-caps text-[9px] text-muted">More articles</span>
        </div>
        )}
      </div>

      {/* Small screens: the layer controls sit under the map. */}
      <div className="lg:hidden border-t border-rule px-4 py-2.5 bg-canvas flex flex-wrap gap-x-5 gap-y-1">
        <span className="small-caps text-[9px] text-muted">Layers</span>
        <LayerToggle label="Grid" on={layers.grid} onClick={() => flip('grid')} />
        <LayerToggle label="Density" on={layers.density} disabled={!points} onClick={() => flip('density')} />
        <LayerToggle label="Labels" on={layers.labels} disabled={!points} onClick={() => flip('labels')} />
      </div>
    </div>
  );
}

// ── Campaign pulse ────────────────────────────────────────────────────────────
// How each campaign's measured words split across the five labels: a count of
// plainRead() outputs, so nothing here is new measurement.
const LABEL_SHADES: { key: Trend; label: string; opacity: number }[] = [
  { key: 'surging', label: 'Surging', opacity: 1 },
  { key: 'rising', label: 'Rising', opacity: 0.68 },
  { key: 'steady', label: 'Steady', opacity: 0.42 },
  { key: 'cooling', label: 'Cooling', opacity: 0.22 },
  { key: 'fading', label: 'Fading', opacity: 0.08 },
];

function LabelBar({ rows }: { rows: Row[] }) {
  const measured = rows.filter((r) => !r.read.pending);
  return (
    <span className="flex h-2 w-full border border-ink/20" aria-hidden>
      {LABEL_SHADES.map((s) => {
        const n = measured.filter((r) => r.read.trend === s.key).length;
        return n ? (
          <span
            key={s.key}
            className="h-full bg-ink border-r border-canvas last:border-r-0"
            style={{ width: `${(n / measured.length) * 100}%`, opacity: s.opacity }}
          />
        ) : null;
      })}
    </span>
  );
}

function CampaignPulse({
  scope,
  setScope,
}: {
  scope: Campaign | null;
  setScope: (c: Campaign | null) => void;
}) {
  return (
    <div className="p-4 lg:p-5 space-y-3">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="small-caps text-ink">Campaigns</h2>
        <span className="flex items-center gap-3 flex-wrap" aria-hidden>
          {LABEL_SHADES.map((s) => (
            <span key={s.key} className="flex items-center gap-1 small-caps text-[8px] text-muted">
              <span className="w-2 h-2 bg-ink border border-ink/30" style={{ opacity: Math.max(s.opacity, 0.08) }} />
              {s.label}
            </span>
          ))}
        </span>
      </div>
      <ul className="grid gap-px bg-rule border border-rule sm:grid-cols-2 2xl:grid-cols-3">
        {CAMPAIGNS.map((c) => {
          const rows = ROWS.filter((r) => r.c === c);
          const measured = rows.filter((r) => !r.read.pending);
          const top = [...measured].sort(byMove)[0];
          const on = scope === c;
          const split = LABEL_SHADES.map(
            (s) => `${measured.filter((r) => r.read.trend === s.key).length} ${s.label.toLowerCase()}`
          ).join(', ');
          return (
            <li key={c.id} className="bg-canvas">
              <button
                type="button"
                aria-pressed={on}
                aria-label={`${c.label}, ${c.shortTitle}: ${split}. Measured as of ${fmtDate(c.refDate)}.`}
                onClick={() => setScope(on ? null : c)}
                className={`w-full text-left px-3.5 py-3 space-y-2 transition-colors ${
                  on ? 'bg-ink/[0.06] outline outline-1 outline-ink -outline-offset-1' : 'hover:bg-ink/[0.025]'
                }`}
              >
                <span className="flex items-baseline justify-between gap-2 font-mono text-[10px] text-muted">
                  <span className="text-ink">C{c.number}</span>
                  <span className="tabular-nums">{fmtDate(c.refDate)}</span>
                </span>
                <span className="block font-display font-bold uppercase tracking-tight text-[13px] leading-tight truncate">
                  {c.shortTitle}
                </span>
                <LabelBar rows={rows} />
                <span className="flex items-baseline justify-between gap-2 font-mono text-[10px] text-muted">
                  <span className="truncate">
                    {top ? (
                      <>
                        <span className="uppercase text-ink">{top.t.term}</span> {humanPct(top.delta)}
                      </>
                    ) : (
                      'no measured move'
                    )}
                  </span>
                  <span className="tabular-nums shrink-0">
                    {measured.length}/{rows.length}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// ── Selected-word detail ──────────────────────────────────────────────────────
function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-canvas px-3 py-2.5">
      <div className="small-caps text-[9px] text-muted mb-1">{label}</div>
      <div className="font-mono text-base font-medium tabular-nums leading-none">{value}</div>
    </div>
  );
}

function DetailPanel({ row }: { row: Row | undefined }) {
  if (!row) {
    return <div className="p-5 text-sm text-muted">Select a word to see its reading.</div>;
  }
  const { c, t, read } = row;
  const m = t.measurement;
  const geo = geoFor(c.number, t.term);
  const peaks = [...(m.inflections ?? [])].sort((a, b) => b.date.localeCompare(a.date));
  const countries = geo?.countries?.slice(0, 8) ?? [];
  const top = countries[0]?.share || 1;

  return (
    <div className="p-4 lg:p-5 space-y-5">
      <div className="space-y-2">
        <div className="flex items-baseline justify-between gap-3 small-caps text-[10px] text-muted">
          <span className="shrink-0">Selected word</span>
          <Link
            to={campaignPath(c)}
            className="min-w-0 truncate text-right hover:text-ink underline-offset-4 hover:underline"
          >
            C{c.number} · {c.shortTitle}
          </Link>
        </div>
        <h2 className="font-display font-bold uppercase tracking-tight leading-[0.95] text-3xl break-words">
          {t.term}
        </h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Chip read={read} />
          <span className="text-sm text-muted">{read.blurb}</span>
        </div>
      </div>

      {read.pending ? (
        <p className="text-sm text-muted leading-relaxed border border-dashed border-ink/25 p-3">
          Measurement pending: this word appears too rarely in the coverage to measure reliably, so it
          carries no number.
        </p>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-px bg-rule border border-rule">
            <Stat label="30-day" value={humanPct(m.deltas?.d30)} />
            <Stat label="90-day" value={humanPct(m.deltas?.d90)} />
            <Stat label={`Rank in C${c.number}`} value={`${m.velocityIndex ?? '—'} / 100`} />
            <Stat label="Latest peak" value={peaks[0] ? fmtDate(peaks[0].date) ?? '—' : '—'} />
          </div>
          <p className="font-mono text-[10px] text-muted leading-relaxed">
            Measured as of {fmtDate(c.refDate)} · change in share of English-language news coverage ·
            rank is within this campaign's {c.terms.length} words
          </p>
        </div>
      )}

      {t.whatItDoes && <p className="text-sm leading-relaxed text-balance">{t.whatItDoes}</p>}

      <div className="space-y-2.5 border-t border-rule pt-4">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="small-caps text-ink">Where it is named</h3>
          <span className="small-caps text-[9px] text-muted">gdelt-geo</span>
        </div>
        <p className="text-[11px] text-muted leading-snug">Places named in articles that use this word.</p>
        {geo ? (
          <>
            <ol className="space-y-1.5">
              {countries.map((p) => (
                <li key={p.cc} className="grid grid-cols-[1fr_auto] gap-x-3 items-baseline">
                  <span className="text-sm truncate">{p.name}</span>
                  <span className="font-mono text-[11px] tabular-nums text-muted">
                    {(p.share * 100).toFixed(1)}%
                  </span>
                  <span className="col-span-2 block h-1 bg-ink/10" aria-hidden>
                    <span className="block h-1 bg-ink" style={{ width: `${(p.share / top) * 100}%` }} />
                  </span>
                </li>
              ))}
            </ol>
            <p className="font-mono text-[10px] text-muted leading-relaxed">
              {geo.located_articles.toLocaleString('en-US')} of {geo.articles.toLocaleString('en-US')} articles
              named a place · {fmtRange(geo.window.start, geo.window.end)}
              {GEO.retrieved_at ? ` · retrieved ${fmtDate(GEO.retrieved_at)}` : ''}
            </p>
          </>
        ) : (
          <p className="text-[13px] text-muted leading-relaxed border border-dashed border-ink/25 p-3">
            {GEO.status !== 'measured'
              ? 'Pending. The places layer has not been measured yet, so it shows nothing for this word.'
              : read.pending
                ? 'Pending, like the word itself.'
                : 'Too few articles using this word named a place in this window to show.'}
          </p>
        )}
      </div>

      <Link
        to={readoutHref(row)}
        className="inline-flex items-center gap-2 border border-ink px-4 py-2.5 small-caps hover:bg-ink hover:text-paper transition-colors"
      >
        Full reading <span aria-hidden>→</span>
      </Link>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MonitorPage() {
  const [params, setParams] = useSearchParams();
  const scope = CAMPAIGNS.find((c) => c.number === params.get('c')) ?? null;
  const [trend, setTrend] = useState<Trend | 'all'>('all');
  const mapRef = useRef<HTMLDivElement>(null);

  const defaultRow = useMemo(() => {
    const pool = (scope ? ROWS.filter((r) => r.c === scope) : ROWS).filter((r) => !r.read.pending);
    return [...pool].sort(byMove)[0];
  }, [scope]);
  const wanted = params.get('w');
  const row =
    ROWS.find((r) => r.key === `${scope?.number ?? params.get('wc')}|${wanted}` && !r.read.pending) ??
    defaultRow;

  useEffect(() => {
    const prev = document.title;
    document.title = 'Monitor — Contextive';
    return () => {
      document.title = prev;
    };
  }, []);

  const setScope = (c: Campaign | null) => {
    setTrend('all');
    setParams(c ? { c: c.number } : {}, { replace: true });
  };

  const onSelect = (r: Row) => {
    const next: Record<string, string> = { w: r.t.term.trim().toLowerCase() };
    if (scope) next.c = scope.number;
    else next.wc = r.c.number;
    setParams(next, { replace: true });
    if (window.matchMedia('(max-width: 1023px)').matches) {
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      mapRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    }
  };

  return (
    <main className="bg-paper text-ink">
      <section
        aria-label="Monitor"
        className="flex flex-col border-b border-rule lg:h-[calc(100svh-75px)] lg:min-h-[600px]"
      >
        <h1 className="sr-only">Contextive Monitor: the tracked words, how they are moving, and where they are named</h1>
        <StatusBar scope={scope} />
        <div className="flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-[300px_minmax(0,1fr)_340px] xl:grid-cols-[330px_minmax(0,1fr)_360px] lg:grid-rows-[auto_minmax(0,1fr)]">
          <div
            ref={mapRef}
            className="order-1 lg:col-start-2 lg:row-start-1 scroll-mt-20 border-b border-rule"
          >
            <MapPanel row={row} />
          </div>
          <aside
            aria-label="Selected word"
            className="order-2 lg:col-start-3 lg:row-start-1 lg:row-span-2 min-h-0 lg:overflow-y-auto bg-canvas border-b lg:border-b-0 lg:border-l border-rule"
          >
            <DetailPanel row={row} />
          </aside>
          <section
            aria-label="Campaigns"
            className="order-4 lg:col-start-2 lg:row-start-2 min-h-0 lg:overflow-y-auto"
          >
            <CampaignPulse scope={scope} setScope={setScope} />
          </section>
          <nav
            aria-label="Words"
            className="order-3 lg:col-start-1 lg:row-start-1 lg:row-span-2 min-h-0 max-h-[80svh] lg:max-h-none flex flex-col bg-canvas border-b lg:border-b-0 lg:border-r border-rule"
          >
            <WordsPanel
              scope={scope}
              setScope={setScope}
              trend={trend}
              setTrend={setTrend}
              selected={row?.key ?? null}
              onSelect={onSelect}
            />
          </nav>
        </div>
      </section>

      <section className="px-6 lg:px-12 py-12 lg:py-16">
        <div className="max-w-screen-xl mx-auto space-y-8">
          <div className="small-caps text-muted">How to read the Monitor</div>
          <div className="grid gap-px bg-rule border border-rule md:grid-cols-3">
            <div className="bg-canvas p-6 space-y-3">
              <div className="small-caps text-ink">01 · The labels</div>
              <p className="text-sm leading-relaxed text-muted">
                Surging, Rising, Steady, Cooling and Fading are fixed cut-offs on a word's measured 90-day
                change in news coverage (30-day where 90 is missing): ±25% and ±8%. No editor chooses them.
              </p>
            </div>
            <div className="bg-canvas p-6 space-y-3">
              <div className="small-caps text-ink">02 · The map</div>
              <p className="text-sm leading-relaxed text-muted">
                A separate instrument: the places GDELT finds named in English-language articles that use
                the word. A place named is not where an article was written or read, and the map never
                feeds the momentum labels or the rankings.
              </p>
            </div>
            <div className="bg-canvas p-6 space-y-3">
              <div className="small-caps text-ink">03 · The dates</div>
              <p className="text-sm leading-relaxed text-muted">
                Every figure carries the date it was measured, and each campaign has its own. A word too rare
                to measure reliably is marked pending and shows no number.
              </p>
            </div>
          </div>
          <div className="border-l-2 border-ink pl-4">
            <div className="small-caps text-ink/40 mb-1">Firewall</div>
            <p className="font-display text-base sm:text-lg leading-snug max-w-2xl">{FIREWALL}</p>
          </div>
          <Link
            to="/how-it-works"
            className="inline-flex items-center gap-1.5 small-caps text-ink underline underline-offset-4 hover:no-underline"
          >
            How Contextive measures <span aria-hidden>→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
