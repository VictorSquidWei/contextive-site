// Monitor — the tracked words on a world map: which are moving, and where the
// articles using them name places. The map is the page; the essentials float over it.
//
// Two instruments, never mixed:
//   * velocity (gdelt-coverage): the measured campaign data and its plainRead() labels;
//   * gdelt-geo: places named in articles that use the word (./geo.ts). A word without a
//     measured map shows no points and no numbers for it.
// Freshness is honest: "Measured as of {date}" until FreshnessBadge's LIVE_MODE is
// flipped, which only happens once the daily refresh loop is verified live.

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ALL_CAMPAIGNS } from '../../data/campaigns';
import { FIREWALL, campaignPath, type Campaign, type CampaignTerm } from '../../data/campaign';
import { plainRead, humanPct, type PlainRead, type Trend } from '../../lib/readSignal';
import { LIVE_MODE } from '../FreshnessBadge';
import { WorldMap, MAP_ASPECT, LEGEND_OPACITIES, project, type MapLayers } from './WorldMap';
import { GEO, GEO_TERRITORIES_ROW, geoFor, fmtDate, fmtRange } from './geo';
import { WORLD_DOTS } from './worldDots';

interface Row {
  key: string;
  c: Campaign;
  t: CampaignTerm;
  read: PlainRead;
  /** 90-day momentum, falling back to 30-day: the same figure plainRead() labels. */
  delta: number | null;
  span: '90 days' | '30 days' | null;
}

const CAMPAIGNS = ALL_CAMPAIGNS.filter((c) => c.signalBasis === 'measured');

const ROWS: Row[] = CAMPAIGNS.flatMap((c) =>
  c.terms.map((t) => {
    const d = t.measurement.deltas;
    return {
      key: `${c.number}|${t.term.trim().toLowerCase()}`,
      c,
      t,
      read: plainRead(t),
      delta: d?.d90 ?? d?.d30 ?? null,
      span: d?.d90 != null ? '90 days' : d?.d30 != null ? '30 days' : null,
    } as Row;
  })
);

// "Most named" chips: the countries named in the most articles across every measured
// word's map this week. Data-driven, never an editorial list of places; a chip opens
// the word with the most articles naming that country.
const ROW_BY_KEY = new Map(ROWS.filter((r) => !r.read.pending).map((r) => [r.key, r] as const));
interface PlaceChip {
  cc: string;
  name: string;
  articles: number;
  /** The word with the most articles naming this country, and that count. */
  best: Row;
  top: number;
}
const PLACE_CHIPS: PlaceChip[] = (() => {
  if (GEO.status !== 'measured') return [];
  const tally = new Map<string, PlaceChip>();
  for (const [k, g] of Object.entries(GEO.terms)) {
    const row = ROW_BY_KEY.get(k);
    if (!row || g.status !== 'measured') continue;
    for (const p of g.countries ?? []) {
      if (!p.cc) continue;
      const t = tally.get(p.cc);
      if (!t) tally.set(p.cc, { cc: p.cc, name: p.name, articles: p.articles, best: row, top: p.articles });
      else {
        t.articles += p.articles;
        if (p.articles > t.top) Object.assign(t, { best: row, top: p.articles });
      }
    }
  }
  return [...tally.values()].sort((a, b) => b.articles - a.articles).slice(0, 6);
})();

type TrendKey = Trend | 'all';
const TRENDS: { key: TrendKey; label: string }[] = [
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

const geoWindow = GEO.status === 'measured' && GEO.window ? fmtRange(GEO.window.start, GEO.window.end) : null;
const pct = (v: number) => `${(v * 100).toFixed(v >= 0.1 ? 0 : 1)}%`;

function useScoped(scope: Campaign | null, trend: TrendKey) {
  return useMemo(() => {
    const inScope = scope ? ROWS.filter((r) => r.c === scope) : ROWS;
    const measured = inScope.filter((r) => !r.read.pending).sort(byMove);
    const pending = inScope.filter((r) => r.read.pending);
    const shown = trend === 'all' ? measured : measured.filter((r) => r.read.trend === trend);
    const count = (k: TrendKey) => (k === 'all' ? measured.length : measured.filter((r) => r.read.trend === k).length);
    return { inScope, measured, pending, shown, count };
  }, [scope, trend]);
}

// ── Small parts ───────────────────────────────────────────────────────────────
const LABEL = 'small-caps text-[9px] tracking-[0.2em] text-muted';
const PANEL = 'bg-canvas/95 border border-ink/15 backdrop-blur-sm';

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

function IconButton({ label, onClick, children }: { label: string; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="w-5 h-5 shrink-0 grid place-items-center font-mono text-xs text-muted hover:text-ink border border-transparent hover:border-ink/25"
    >
      {children}
    </button>
  );
}

// ── Status bar ────────────────────────────────────────────────────────────────
function StatusBar({ scope }: { scope: Campaign | null }) {
  const { measured } = useScoped(scope, 'all');
  const dates = CAMPAIGNS.map((c) => c.refDate).filter(Boolean).sort() as string[];
  const freshness = LIVE_MODE
    ? 'Live · updated daily'
    : scope
      ? `Measured as of ${fmtDate(scope.refDate)}`
      : `Campaigns ${fmtRange(dates[0], dates[dates.length - 1])}`;

  return (
    <div className="border-b border-rule bg-canvas px-4 xl:px-5 py-2 flex items-center gap-x-5 gap-y-1 flex-wrap small-caps text-[9px] tracking-[0.2em] text-muted">
      <span className="flex items-center gap-2 text-ink">
        <Diamond filled className="motion-safe:animate-pulse" />
        <span className="font-display font-bold text-[12px] tracking-[0.18em]">Monitor</span>
      </span>
      <span className="tabular-nums text-ink">{measured.length} words</span>
      <span className="flex items-center gap-1.5">{freshness}</span>
      <span>Map · {geoWindow ?? 'pending'}</span>
    </div>
  );
}

// ── "Most named" place chips ─────────────────────────────────────────────────
function PlaceChips({
  selectedKey,
  onPick,
  className = '',
}: {
  selectedKey: string | null;
  onPick: (r: Row) => void;
  className?: string;
}) {
  const [picked, setPicked] = useState<string | null>(null);
  if (!PLACE_CHIPS.length) return null;
  return (
    <div className={`flex items-center gap-1.5 flex-wrap ${className}`}>
      <span className={`${LABEL} mr-1`}>Most named · all words</span>
      {PLACE_CHIPS.map((p, i) => {
        // Several countries can open the same word; only the chip clicked shows as on.
        const on = picked === p.cc && p.best.key === selectedKey;
        return (
          <button
            key={p.cc}
            type="button"
            aria-pressed={on}
            onClick={() => {
              setPicked(p.cc);
              onPick(p.best);
            }}
            title={`Opens “${p.best.t.term}”, the word with the most articles naming ${p.name}`}
            className={`mon-rise small-caps text-[9px] tracking-[0.16em] px-2 py-1 border transition-colors ${
              on ? 'bg-ink text-paper border-ink' : 'border-ink/25 text-ink hover:border-ink'
            }`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            {p.name}
          </button>
        );
      })}
    </div>
  );
}

// ── Word filters + rows ───────────────────────────────────────────────────────
interface FilterProps {
  scope: Campaign | null;
  setScope: (c: Campaign | null) => void;
  trend: TrendKey;
  setTrend: (t: TrendKey) => void;
}

const SELECT =
  'w-full bg-canvas border border-rule hover:border-ink/40 focus:border-ink px-2.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-ink rounded-none';

function WordFilters({ scope, setScope, trend, setTrend, compact = false }: FilterProps & { compact?: boolean }) {
  const { count } = useScoped(scope, trend);
  const campaignSelect = (
    <label className="block">
      <span className="sr-only">Campaign</span>
      <select
        value={scope?.number ?? 'all'}
        onChange={(e) => setScope(CAMPAIGNS.find((c) => c.number === e.target.value) ?? null)}
        className={SELECT}
      >
        <option value="all">All {CAMPAIGNS.length} campaigns</option>
        {CAMPAIGNS.map((c) => (
          <option key={c.id} value={c.number}>
            C{c.number} · {c.shortTitle}
          </option>
        ))}
      </select>
    </label>
  );

  if (compact) {
    return (
      <div className="space-y-1.5">
        {campaignSelect}
        <label className="block">
          <span className="sr-only">Momentum label</span>
          <select value={trend} onChange={(e) => setTrend(e.target.value as TrendKey)} className={SELECT}>
            {TRENDS.map((t) => (
              <option key={t.key} value={t.key} disabled={count(t.key) === 0 && t.key !== trend}>
                {t.key === 'all' ? 'All labels' : t.label} · {count(t.key)}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
      <div className="sm:w-56 shrink-0">{campaignSelect}</div>
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
    </div>
  );
}

function WordRow({
  r,
  rank,
  selected,
  onSelect,
}: {
  r: Row;
  rank: number;
  selected: boolean;
  onSelect: (r: Row) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(r)}
      aria-current={selected ? 'true' : undefined}
      className={`w-full text-left pl-2 pr-3 py-2 flex items-start gap-2 border-l-2 transition-colors ${
        selected ? 'border-ink bg-ink/[0.05]' : 'border-transparent hover:bg-ink/[0.03]'
      }`}
    >
      <span className="font-mono text-[9px] text-muted w-4 pt-[3px] tabular-nums shrink-0">
        {String(rank).padStart(2, '0')}
      </span>
      <span className="flex-1 min-w-0">
        <span className="flex items-baseline justify-between gap-2">
          <span className="font-display font-bold text-[13px] leading-tight uppercase tracking-tight break-words min-w-0">
            {r.t.term}
          </span>
          <span className="font-mono text-[12px] font-medium tabular-nums shrink-0">{humanPct(r.delta)}</span>
        </span>
        <span className="block mt-0.5 small-caps text-[8px] tracking-[0.14em] text-muted truncate">
          {r.read.chip} · {r.span === '30 days' ? '30d' : '90d'} · C{r.c.number} · {fmtDate(r.c.refDate)}
        </span>
      </span>
    </button>
  );
}

// ── Floating word rail (desktop) ──────────────────────────────────────────────
function WordsRail({
  filters,
  selected,
  onSelect,
  onShowAll,
}: {
  filters: FilterProps;
  selected: string | null;
  onSelect: (r: Row) => void;
  onShowAll: () => void;
}) {
  const [open, setOpen] = useState(true);
  const { shown } = useScoped(filters.scope, filters.trend);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-expanded={false}
        className={`${PANEL} absolute left-3 top-3 px-3 py-2 small-caps text-[9px] tracking-[0.2em] text-ink hover:border-ink/40`}
      >
        Words moving ›
      </button>
    );
  }
  return (
    <div className={`${PANEL} absolute left-3 top-3 w-[196px] 2xl:w-[212px] max-h-[calc(100%-24px)] flex flex-col`}>
      <div className="px-3 pt-2.5 pb-2 space-y-2 border-b border-rule">
        <div className="flex items-center justify-between gap-2">
          <h2 className="small-caps text-[9px] tracking-[0.2em] text-ink">Words moving</h2>
          <IconButton label="Collapse the word list" onClick={() => setOpen(false)}>
            −
          </IconButton>
        </div>
        <WordFilters {...filters} compact />
      </div>
      <ol
        key={`${filters.scope?.number ?? 'all'}-${filters.trend}`}
        className="flex-1 min-h-0 overflow-y-auto divide-y divide-rule"
      >
        {shown.slice(0, 8).map((r, i) => (
          <li key={r.key} className="mon-rise" style={{ animationDelay: `${i * 45}ms` }}>
            <WordRow r={r} rank={i + 1} selected={r.key === selected} onSelect={onSelect} />
          </li>
        ))}
        {shown.length === 0 && <li className="px-3 py-3 text-[11px] text-muted">No measured word here.</li>}
      </ol>
      <button
        type="button"
        onClick={onShowAll}
        className="border-t border-rule px-3 py-2 text-left small-caps text-[9px] tracking-[0.2em] text-muted hover:text-ink"
      >
        All {shown.length} words ↓
      </button>
    </div>
  );
}

// ── Selected-word card ────────────────────────────────────────────────────────
// Kept short on purpose: over the map it sits on Siberia and should end above
// East Asia, so it lists 5 countries, uses inline bars, and keeps the reading and
// the link on one line each.
function SelectedCard({
  row,
  onCollapse,
  maxCountries = 5,
}: {
  row: Row | undefined;
  onCollapse?: () => void;
  maxCountries?: number;
}) {
  if (!row) return <p className="p-4 text-sm text-muted">Select a word to see its reading.</p>;
  const { c, t, read } = row;
  const geo = geoFor(c.number, t.term);
  const countries = (geo?.countries ?? []).slice(0, maxCountries);
  const top = countries[0]?.share || 1;

  return (
    <div key={row.key} className="mon-fade px-3.5 py-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <Link to={campaignPath(c)} className={`${LABEL} hover:text-ink truncate min-w-0`}>
          C{c.number} · {c.shortTitle}
        </Link>
        <span className="flex items-center gap-2 shrink-0">
          <Link to={readoutHref(row)} className={`${LABEL} text-ink hover:underline underline-offset-4`}>
            Reading →
          </Link>
          {onCollapse && (
            <IconButton label="Collapse the word card" onClick={onCollapse}>
              −
            </IconButton>
          )}
        </span>
      </div>

      <div className="space-y-1.5">
        <h2 className="font-display font-bold uppercase tracking-tight leading-[0.95] text-[22px] break-words">{t.term}</h2>
        <div className="flex items-center gap-2 flex-wrap">
          <Chip read={read} />
          <span className="font-mono text-[12px] font-medium tabular-nums">{humanPct(row.delta)}</span>
          <span className="font-mono text-[9.5px] text-muted">
            in {row.span} to {fmtDate(c.refDate)}
          </span>
        </div>
      </div>

      <div className="border-t border-rule pt-2 space-y-1.5">
        <div className={LABEL}>Most named{geo ? ` · ${fmtRange(geo.window.start, geo.window.end)}` : ''}</div>
        {geo ? (
          <>
            <ol className="space-y-1">
              {countries.map((p, i) => (
                <li key={p.cc ?? p.name} className="grid grid-cols-[minmax(0,1fr)_52px_34px] gap-x-2 items-center">
                  <span
                    className={`leading-tight truncate ${i === 0 ? 'font-display font-bold text-[14px]' : 'text-[11.5px]'}`}
                  >
                    {p.name}
                  </span>
                  <span className={`block bg-ink/10 ${i === 0 ? 'h-[5px]' : 'h-[3px]'}`} aria-hidden>
                    <span
                      className="mon-grow block h-full bg-ink"
                      style={{ width: `${(p.share / top) * 100}%`, animationDelay: `${120 + i * 70}ms` }}
                    />
                  </span>
                  <span
                    className={`font-mono tabular-nums text-right ${i === 0 ? 'text-[12px] text-ink font-medium' : 'text-[10px] text-muted'}`}
                  >
                    {pct(p.share)}
                  </span>
                </li>
              ))}
            </ol>
            <p className="font-mono text-[9.5px] text-muted leading-snug">
              Share of {geo.located_articles.toLocaleString('en-US')} articles that named a place. One article
              can name several, so shares add past 100%.
            </p>
            {!GEO_TERRITORIES_ROW && countries.some((p) => p.cc === 'IS') && (
              <p className="text-[10.5px] text-muted leading-snug">Israel&rsquo;s row includes some Gaza mentions (GDELT coding).</p>
            )}
          </>
        ) : (
          <p className="text-[11px] text-muted leading-snug border border-dashed border-ink/25 px-2.5 py-2">
            {GEO.status !== 'measured' ? 'Map pending.' : `Map pending: too few located articles in ${geoWindow}.`}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Map chips: layers + legend ────────────────────────────────────────────────
function LayerToggle({ label, on, disabled, onClick }: { label: string; on: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on && !disabled}
      disabled={disabled}
      onClick={onClick}
      className="flex items-center gap-1.5 small-caps text-[9px] tracking-[0.18em] text-ink disabled:text-muted disabled:opacity-60"
    >
      <span aria-hidden className="w-2.5 h-2.5 border border-current grid place-items-center">
        {on && !disabled && <span className="w-1 h-1 bg-current" />}
      </span>
      {label}
    </button>
  );
}

function MapChips({
  layers,
  flip,
  hasPoints,
  legendOnly = false,
  className = '',
}: {
  layers: MapLayers;
  flip: (k: keyof MapLayers) => void;
  hasPoints: boolean;
  legendOnly?: boolean;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-x-4 gap-y-1.5 flex-wrap ${className}`}>
      {!legendOnly && (
        <>
          <LayerToggle label="Grid" on={layers.grid} onClick={() => flip('grid')} />
          <LayerToggle label="Density" on={layers.density} disabled={!hasPoints} onClick={() => flip('density')} />
          <LayerToggle label="Labels" on={layers.labels} disabled={!hasPoints} onClick={() => flip('labels')} />
        </>
      )}
      {hasPoints && (
        <span className="flex items-center gap-1.5" aria-label="Darker dots: more articles name a place nearby">
          <span className={LABEL}>Fewer</span>
          <span className="flex items-center gap-[3px]" aria-hidden>
            {LEGEND_OPACITIES.map((o) => (
              <span key={o} className="w-1.5 h-1.5 rounded-full bg-ink" style={{ opacity: o }} />
            ))}
          </span>
          <span className={LABEL}>More</span>
        </span>
      )}
      {hasPoints && <span className={LABEL}>01–03 · most named for this word</span>}
    </div>
  );
}

// ── Campaign strip ────────────────────────────────────────────────────────────
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
    <span className="flex h-1.5 w-full border border-ink/20" aria-hidden>
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

function CampaignStrip({ scope, setScope }: { scope: Campaign | null; setScope: (c: Campaign | null) => void }) {
  return (
    <div className="space-y-3">
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
      <ul className="grid gap-px bg-rule border border-rule grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        {CAMPAIGNS.map((c) => {
          const rows = ROWS.filter((r) => r.c === c);
          const measured = rows.filter((r) => !r.read.pending);
          const topMove = [...measured].sort(byMove)[0];
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
                className={`w-full text-left px-3 py-2.5 space-y-1.5 transition-colors ${
                  on ? 'bg-ink/[0.06] outline outline-1 outline-ink -outline-offset-1' : 'hover:bg-ink/[0.025]'
                }`}
              >
                <span className="flex items-baseline justify-between gap-2 font-mono text-[9px] text-muted">
                  <span className="text-ink">C{c.number}</span>
                  <span className="tabular-nums">{fmtDate(c.refDate)}</span>
                </span>
                <span className="block font-display font-bold uppercase tracking-tight text-[12px] leading-tight truncate">
                  {c.shortTitle}
                </span>
                <LabelBar rows={rows} />
                <span className="flex items-baseline justify-between gap-2 font-mono text-[9px] text-muted">
                  <span className="truncate">
                    {topMove ? (
                      <>
                        <span className="uppercase text-ink">{topMove.t.term}</span> {humanPct(topMove.delta)}
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
        {/* 11 tiles: one blank cell squares off the 2-, 3- and 6-column grids. */}
        {CAMPAIGNS.length % 2 === 1 && <li aria-hidden className="bg-canvas" />}
      </ul>
    </div>
  );
}

// ── All words (below the map) ─────────────────────────────────────────────────
const PREVIEW = 24;

function AllWords({
  filters,
  selected,
  onSelect,
}: {
  filters: FilterProps;
  selected: string | null;
  onSelect: (r: Row) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const { shown, pending } = useScoped(filters.scope, filters.trend);
  const visible = expanded ? shown : shown.slice(0, PREVIEW);
  const filtered = filters.scope || filters.trend !== 'all';

  return (
    <div className="space-y-3">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="small-caps text-ink">
          Words moving <span className="text-muted tabular-nums">· {shown.length}</span>
        </h2>
        {/* On desktop the filters live in the rail over the map; this echoes them. */}
        {filtered && (
          <span className="hidden xl:flex items-center gap-3 small-caps text-[9px] text-muted">
            {filters.scope ? `C${filters.scope.number} · ${filters.scope.shortTitle}` : 'All campaigns'}
            {filters.trend !== 'all' && ` · ${filters.trend}`}
            <button
              type="button"
              onClick={() => {
                filters.setScope(null);
                filters.setTrend('all');
              }}
              className="text-ink underline underline-offset-4 hover:no-underline"
            >
              Clear
            </button>
          </span>
        )}
      </div>
      <div className="xl:hidden">
        <WordFilters {...filters} />
      </div>
      <p className="text-[11px] text-muted">Biggest measured moves first, each with its date.</p>
      <ol className="grid gap-px bg-rule border border-rule sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visible.map((r, i) => (
          <li key={r.key} className="bg-canvas">
            <WordRow r={r} rank={i + 1} selected={r.key === selected} onSelect={onSelect} />
          </li>
        ))}
        {shown.length === 0 && <li className="bg-canvas px-4 py-4 text-sm text-muted">No measured word carries this label here.</li>}
      </ol>
      <div className="flex items-center gap-6 flex-wrap">
        {shown.length > PREVIEW && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            aria-expanded={expanded}
            className="small-caps text-[10px] text-ink underline underline-offset-4 hover:no-underline"
          >
            {expanded ? 'Show fewer' : `Show all ${shown.length}`}
          </button>
        )}
        {pending.length > 0 && (
          <details className="group">
            <summary className="cursor-pointer small-caps text-[10px] text-muted hover:text-ink list-none inline-flex items-center gap-2">
              <span className="transition-transform group-open:rotate-90" aria-hidden>›</span>
              {pending.length} pending: too rare to measure, so no number
            </summary>
            <ul className="mt-2 flex flex-wrap gap-1.5">
              {pending.map((r) => (
                <li key={r.key} className="font-mono text-[10px] uppercase tracking-wide border border-dashed border-ink/25 px-1.5 py-0.5 text-muted">
                  {r.t.term}
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function MonitorPage() {
  const [params, setParams] = useSearchParams();
  const scope = CAMPAIGNS.find((c) => c.number === params.get('c')) ?? null;
  const [trend, setTrend] = useState<TrendKey>('all');
  const [layers, setLayers] = useState<MapLayers>({ grid: true, density: true, labels: true });
  const [cardOpen, setCardOpen] = useState(true);
  const [canPan, setCanPan] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLElement>(null);

  const defaultRow = useMemo(() => {
    const pool = (scope ? ROWS.filter((r) => r.c === scope) : ROWS).filter((r) => !r.read.pending);
    return [...pool].sort(byMove)[0];
  }, [scope]);
  const wanted = params.get('w');
  const row =
    ROWS.find((r) => r.key === `${scope?.number ?? params.get('wc')}|${wanted}` && !r.read.pending) ?? defaultRow;
  const geo = row ? geoFor(row.c.number, row.t.term) : undefined;
  const points = geo?.places ?? null;

  useEffect(() => {
    const prev = document.title;
    document.title = 'Monitor — Contextive';
    return () => {
      document.title = prev;
    };
  }, []);

  // Narrow screens: the map is wider than the screen and pans sideways. Centre it
  // on the selected word's most-named place (or on 20°E when there is none).
  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const fit = () => {
      const overflow = el.scrollWidth > el.clientWidth + 2;
      setCanPan(overflow);
      if (!overflow) return;
      const p = points?.find((q) => q.lat != null && q.lon != null);
      const fx = project(p?.lon ?? 20, 0)[0] / WORLD_DOTS.cols;
      el.scrollLeft = Math.max(0, fx * el.scrollWidth - el.clientWidth / 2);
    };
    fit();
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [points]);

  const reduceMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scrollTo = (el: HTMLElement | null) =>
    el?.scrollIntoView({ behavior: reduceMotion() ? 'auto' : 'smooth', block: 'start' });

  const setScope = (c: Campaign | null) => {
    setTrend('all');
    setParams(c ? { c: c.number } : {}, { replace: true });
  };
  const select = (r: Row, reveal: boolean) => {
    const next: Record<string, string> = { w: r.t.term.trim().toLowerCase() };
    if (scope) next.c = scope.number;
    else next.wc = r.c.number;
    setParams(next, { replace: true });
    setCardOpen(true);
    if (reveal) scrollTo(heroRef.current);
  };
  const filters: FilterProps = { scope, setScope, trend, setTrend };
  const flip = (k: keyof MapLayers) => setLayers((l) => ({ ...l, [k]: !l[k] }));
  const isNarrow = () => window.matchMedia('(max-width: 1279px)').matches;

  const aria = points
    ? `World map of places named in articles that use "${row?.t.term}" (${geoWindow}). Most named: ${points
        .slice(0, 3)
        .map((p) => p.name)
        .join('; ')}.`
    : 'World map. No places are drawn for this word.';
  const caption = row ? (
    <>
      <span className="font-display font-bold uppercase tracking-tight text-[13px] text-ink">“{row.t.term}”</span>{' '}
      <span className={LABEL}>· places in its coverage ·</span>{' '}
      <span className="font-mono text-[10px] text-muted tabular-nums">{geo ? fmtRange(geo.window.start, geo.window.end) : 'no map'}</span>
    </>
  ) : null;

  return (
    <main className="bg-paper text-ink">
      <h1 className="sr-only">Contextive Monitor: the tracked words, how they are moving, and where they are named</h1>
      <StatusBar scope={scope} />

      {/* ── The map ── */}
      <section ref={heroRef} aria-label="Map" className="relative border-b border-rule scroll-mt-20">
        <div className="xl:hidden px-4 py-2 border-b border-rule bg-canvas leading-snug space-y-2">
          <div>{caption}</div>
          <PlaceChips selectedKey={row?.key ?? null} onPick={(r) => select(r, false)} />
        </div>

        <div
          ref={scrollerRef}
          style={{ '--map-aspect': MAP_ASPECT } as CSSProperties}
          className="no-scrollbar relative bg-paper h-[50svh] min-h-[280px] overflow-x-auto overflow-y-hidden xl:overflow-hidden xl:h-[min(85svh,calc(100svh-106px))] xl:min-h-[560px] xl:[container-type:size]"
        >
          <div className="relative h-full mx-auto w-[calc(max(50svh,280px)*var(--map-aspect))] xl:absolute xl:inset-0 xl:m-auto xl:w-[min(100cqw,calc(100cqh*var(--map-aspect)))] xl:h-[min(100cqh,calc(100cqw/var(--map-aspect)))]">
            <WorldMap points={points} layers={layers} ariaLabel={aria} motionKey={row?.key ?? 'none'} />
          </div>

          {/* Desktop: the essentials float over sparse parts of the map (Pacific,
              Siberia, the Arctic, the Southern Ocean) and collapse out of the way. */}
          <div className="hidden xl:block">
            <WordsRail
              filters={filters}
              selected={row?.key ?? null}
              onSelect={(r) => select(r, false)}
              onShowAll={() => scrollTo(listRef.current)}
            />
            {cardOpen ? (
              <div className={`${PANEL} absolute right-3 top-3 w-[268px] max-h-[calc(100%-24px)] overflow-y-auto`}>
                <SelectedCard row={row} onCollapse={() => setCardOpen(false)} maxCountries={5} />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setCardOpen(true)}
                aria-expanded={false}
                className={`${PANEL} absolute right-3 top-3 px-3 py-2 small-caps text-[9px] tracking-[0.2em] text-ink hover:border-ink/40 max-w-[268px] truncate`}
              >
                ‹ {row?.t.term ?? 'Word'}
              </button>
            )}
            <div className={`${PANEL} absolute top-3 left-1/2 -translate-x-1/2 max-w-[46%] px-3 py-2 space-y-2`}>
              <div className="truncate text-center">{caption}</div>
              <PlaceChips selectedKey={row?.key ?? null} onPick={(r) => select(r, false)} className="justify-center" />
            </div>
            <div className={`${PANEL} absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5`}>
              <MapChips layers={layers} flip={flip} hasPoints={!!points} />
            </div>
          </div>
        </div>

        <div className="xl:hidden px-4 py-2 border-t border-rule bg-canvas flex items-center justify-between gap-3 flex-wrap">
          <MapChips layers={layers} flip={flip} hasPoints={!!points} legendOnly />
          {canPan && <span className={LABEL}>Swipe ↔</span>}
        </div>
      </section>

      {/* ── Narrow screens: the selected word under the map ── */}
      <section aria-label="Selected word" className="xl:hidden border-b border-rule bg-canvas">
        <SelectedCard row={row} />
      </section>

      {/* ── Below the map: the full list, the campaigns, how to read ── */}
      <div className="px-4 sm:px-6 xl:px-10 py-8 xl:py-10 space-y-10 max-w-screen-2xl mx-auto">
        <section ref={listRef} aria-label="Words" className="scroll-mt-20">
          <AllWords filters={filters} selected={row?.key ?? null} onSelect={(r) => select(r, true)} />
        </section>

        <section aria-label="Campaigns">
          <CampaignStrip
            scope={scope}
            setScope={(c) => {
              setScope(c);
              if (!isNarrow()) scrollTo(heroRef.current);
            }}
          />
        </section>

        <section aria-label="How to read the Monitor" className="space-y-5 border-t border-rule pt-8">
          <h2 className="small-caps text-ink">How to read the Monitor</h2>
          <div className="grid gap-px bg-rule border border-rule md:grid-cols-3">
            <div className="bg-canvas p-5 space-y-2">
              <div className={LABEL}>01 · The labels</div>
              <p className="text-[13px] leading-relaxed text-muted">
                Fixed cut-offs on a word&rsquo;s 90-day change in news coverage: ±25% and ±8%. No editor picks them.
              </p>
            </div>
            <div className="bg-canvas p-5 space-y-2">
              <div className={LABEL}>02 · The map</div>
              <p className="text-[13px] leading-relaxed text-muted">
                A separate, one-week measurement: the places GDELT finds named in English-language articles that
                use the word, as a share of articles that named any place.{' '}
                {GEO_TERRITORIES_ROW
                  ? 'Gaza, the West Bank and the words Palestinian and Palestine count as one row, Palestinian territories. Addresses that differ only after ? or # count as one article.'
                  : 'GDELT files some Gaza mentions under Israel.'}{' '}
                Named is not where it was written, and the map never feeds the labels.
              </p>
            </div>
            <div className="bg-canvas p-5 space-y-2">
              <div className={LABEL}>03 · The dates</div>
              <p className="text-[13px] leading-relaxed text-muted">
                Every figure carries its measurement date. A word too rare to measure is pending: no number, no map.
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
        </section>
      </div>
    </main>
  );
}
