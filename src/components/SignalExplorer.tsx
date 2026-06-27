import { useEffect, useMemo, useState } from 'react';
import { API_DEMO_TERMS, type DemoTerm } from '../data/apiDemo';
import { ShareCard } from './ShareCard';

/* Interactive Signal Explorer — the centerpiece of /waitlist.
   Click a measured term and the card animates to its real reading; toggle Compare
   for a head-to-head (the compare() primitive). All numbers are measured, never
   invented. When VITE_CONTEXTIVE_API_URL is set, the response view fetches the
   selected term live (falls back to the embedded measured reading on any error). */

const FEATURED = API_DEMO_TERMS.filter((t) => t.featured);
const bySlug = (s: string) => API_DEMO_TERMS.find((t) => t.slug === s);

const env = (import.meta as unknown as { env?: Record<string, string | undefined> }).env ?? {};
const API_URL = env.VITE_CONTEXTIVE_API_URL;
const API_KEY = env.VITE_CONTEXTIVE_API_KEY || 'ctx_demo_key';

const fmtPct = (n: number | null) =>
  n == null ? '—' : `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n)}%`;

// Stylized momentum glyph — direction reflects the real 90-day momentum (rising vs falling).
function sparkPoints(d90: number | null, w = 300, h = 72): string {
  const rising = (d90 ?? 0) >= 0;
  const ys = rising
    ? [60, 56, 63, 47, 52, 38, 44, 28, 33, 18, 9]
    : [12, 17, 11, 25, 20, 34, 29, 43, 48, 58, 66];
  const n = ys.length;
  return ys.map((y, i) => `${((i / (n - 1)) * w).toFixed(1)},${y}`).join(' ');
}

function toResponse(t: DemoTerm) {
  return {
    term: t.term,
    status: 'measured',
    campaign: t.campaign,
    domain_tag: t.domain,
    source: 'gdelt-doc-2.0',
    methodology_version: '1.0',
    velocity_index: t.velocityIndex,
    adoption_stage: t.adoptionStage,
    momentum: t.deltas,
    sentiment: t.sentiment,
    inflections: t.inflections,
    co_occurrence: t.coOccurrence,
  };
}

function VelocityBar({ value, dark = false }: { value: number | null; dark?: boolean }) {
  const [w, setW] = useState(0);
  useEffect(() => {
    const id = requestAnimationFrame(() => setW(value ?? 0));
    return () => cancelAnimationFrame(id);
  }, [value]);
  return (
    <div className={`h-2 w-full ${dark ? 'bg-paper/20' : 'bg-rule'}`}>
      <div
        className={`h-full ${dark ? 'bg-paper' : 'bg-ink'} transition-[width] duration-700 ease-out`}
        style={{ width: `${w}%` }}
      />
    </div>
  );
}

function SignalCard({ t, compact = false }: { t: DemoTerm; compact?: boolean }) {
  return (
    <div className="relative border border-rule bg-paper paper-grain overflow-hidden h-full min-w-0">
      {/* scanning sheen */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="scan-sweep absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-ink/[0.05] to-transparent" />
      </div>

      <div className="relative p-5 sm:p-6 space-y-5">
        {/* header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-display font-bold text-xl sm:text-2xl text-ink leading-tight truncate">{t.term}</div>
            <div className="small-caps text-whisper text-[10px] mt-1 truncate">{t.domain} · C{t.campaign}</div>
          </div>
          <span className="small-caps text-[10px] text-muted border border-rule px-2 py-1 shrink-0 whitespace-nowrap">
            {t.adoptionStage}
          </span>
        </div>

        {/* velocity */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="small-caps text-[10px] text-muted">Velocity index</span>
            <span className="font-display font-bold text-2xl text-ink tabular-nums">{t.velocityIndex ?? '—'}</span>
          </div>
          <VelocityBar value={t.velocityIndex} />
        </div>

        {/* momentum sparkline (direction = measured 90-day momentum) */}
        <div className="space-y-1.5">
          <div className="flex items-baseline justify-between small-caps text-[10px] text-muted">
            <span>90-day momentum</span>
            <span className="font-mono text-ink">{fmtPct(t.deltas.d90)}</span>
          </div>
          <svg viewBox="0 0 300 72" className="w-full h-12 text-ink" fill="none" aria-hidden="true">
            <line x1="0" y1="68" x2="300" y2="68" stroke="currentColor" strokeWidth="1" className="text-rule" />
            <polyline
              points={sparkPoints(t.deltas.d90)}
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* deltas + sentiment */}
        <div className="grid grid-cols-3 gap-px bg-rule border border-rule text-center">
          {[
            ['30d', fmtPct(t.deltas.d30)],
            ['1y', fmtPct(t.deltas.yoy)],
            ['Tone', t.sentiment == null ? '—' : t.sentiment.toFixed(1)],
          ].map(([k, v]) => (
            <div key={k} className="bg-paper py-2">
              <div className="small-caps text-whisper text-[9px]">{k}</div>
              <div className="font-mono text-xs text-ink mt-0.5">{v}</div>
            </div>
          ))}
        </div>

        {!compact && (
          <>
            {/* co-occurrence */}
            {t.coOccurrence.length > 0 && (
              <div className="space-y-2">
                <div className="small-caps text-[10px] text-muted">Travels with</div>
                <div className="flex flex-wrap gap-1.5">
                  {t.coOccurrence.map((c) => (
                    <span key={c} className="small-caps text-[10px] text-muted border border-rule px-2 py-1">{c}</span>
                  ))}
                </div>
              </div>
            )}
            {/* inflections */}
            {t.inflections.length > 0 && (
              <div className="flex items-center justify-between small-caps text-[10px] text-whisper">
                <span>Last inflection</span>
                <span className="font-mono text-muted">
                  {t.inflections[0].date} · z{t.inflections[0].z}
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Chip({
  t,
  active,
  onClick,
}: {
  t: DemoTerm;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`small-caps text-[11px] px-3 py-2 border transition-colors ${
        active
          ? 'bg-ink text-paper border-ink'
          : 'bg-paper text-muted border-rule hover:border-ink hover:text-ink'
      }`}
    >
      {t.term}
    </button>
  );
}

export function SignalExplorer() {
  const [mode, setMode] = useState<'explore' | 'compare'>('explore');
  const [pick, setPick] = useState('ceasefire'); // explore: selected slug
  const [a, setA] = useState('ceasefire'); // compare: A
  const [b, setB] = useState('obliterated'); // compare: B
  const [showJson, setShowJson] = useState(false);
  const [liveJson, setLiveJson] = useState<string | null>(null);

  const current = bySlug(pick) ?? FEATURED[0];
  const termA = bySlug(a) ?? FEATURED[0];
  const termB = bySlug(b) ?? FEATURED[1];

  const leader =
    (termA.velocityIndex ?? 0) === (termB.velocityIndex ?? 0)
      ? null
      : (termA.velocityIndex ?? 0) > (termB.velocityIndex ?? 0)
        ? termA
        : termB;
  const gap = Math.abs((termA.velocityIndex ?? 0) - (termB.velocityIndex ?? 0));

  // Compare-mode chip click fills A, then B, then cycles A.
  const [next, setNext] = useState<'a' | 'b'>('a');
  function compareSelect(slug: string) {
    if (next === 'a') {
      setA(slug);
      setNext('b');
    } else {
      setB(slug);
      setNext('a');
    }
  }

  // Optional live round-trip for the response view when the API is deployed.
  useEffect(() => {
    setLiveJson(null);
    if (!API_URL || !showJson || mode !== 'explore') return;
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 6000);
    fetch(`${API_URL.replace(/\/$/, '')}/v1/terms/${current.slug}`, {
      headers: { 'X-API-Key': API_KEY },
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => setLiveJson(JSON.stringify(d, null, 2)))
      .catch(() => setLiveJson(null))
      .finally(() => clearTimeout(timer));
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [current.slug, showJson, mode]);

  const jsonText = useMemo(
    () => liveJson ?? JSON.stringify(toResponse(current), null, 2),
    [liveJson, current],
  );

  return (
    <section className="mt-16 lg:mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <div className="small-caps text-muted">// Explore the measured signal</div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl leading-tight text-balance mt-2">
            Pick a phrase. Watch it move.
          </h2>
        </div>
        {/* mode toggle */}
        <div className="flex border border-rule shrink-0" role="tablist" aria-label="Explorer mode">
          {(['explore', 'compare'] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={`small-caps text-[11px] px-4 py-2 transition-colors ${
                mode === m ? 'bg-ink text-paper' : 'bg-paper text-muted hover:text-ink'
              }`}
            >
              {m === 'explore' ? 'Explore' : 'Compare'}
            </button>
          ))}
        </div>
      </div>

      {/* chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FEATURED.map((t) => (
          <Chip
            key={t.slug}
            t={t}
            active={mode === 'explore' ? current.slug === t.slug : a === t.slug || b === t.slug}
            onClick={() => (mode === 'explore' ? setPick(t.slug) : compareSelect(t.slug))}
          />
        ))}
      </div>

      {mode === 'explore' ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-rule border border-rule">
          <div className="bg-paper min-w-0">
            <SignalCard t={current} />
            <ShareCard term={current} />
          </div>
          {/* request / response panel */}
          <div className="bg-ink text-paper flex flex-col min-w-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-paper/15">
              <span className="font-mono text-[11px] text-paper/80 truncate">GET /v1/terms/{current.slug}</span>
              <button
                type="button"
                onClick={() => setShowJson((v) => !v)}
                className="small-caps text-[10px] text-paper/60 hover:text-paper transition-colors shrink-0 ml-2"
              >
                {showJson ? 'Hide JSON' : 'View JSON'}
              </button>
            </div>
            {showJson ? (
              <pre className="px-4 py-4 overflow-x-auto text-[11px] leading-relaxed font-mono text-paper/90 flex-1">
{jsonText}
              </pre>
            ) : (
              <div className="px-5 py-6 space-y-4 flex-1">
                <p className="text-sm text-paper/70 leading-relaxed">
                  Every phrase returns the same shape: a measured momentum reading, stamped with the date
                  and method that produced it. Unmeasured terms come back <span className="text-paper">pending</span>,
                  never a guess.
                </p>
                <dl className="space-y-2 font-mono text-[12px]">
                  {[
                    ['velocity_index', String(current.velocityIndex ?? '—')],
                    ['adoption_stage', current.adoptionStage ?? '—'],
                    ['momentum.d90', fmtPct(current.deltas.d90)],
                    ['sentiment', current.sentiment == null ? '—' : current.sentiment.toFixed(2)],
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-4 border-b border-paper/10 pb-1.5">
                      <dt className="text-paper/50">{k}</dt>
                      <dd className="text-paper">{v}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* leader banner */}
          <div className="border border-ink bg-ink text-paper px-5 py-4 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[11px] text-paper/70 min-w-0 break-words">
              compare(<span className="text-paper">{termA.term}</span>, <span className="text-paper">{termB.term}</span>)
            </span>
            <span className="font-display font-bold text-sm sm:text-base">
              {leader ? <><span className="text-paper">{leader.term}</span> leads by {gap} velocity</> : 'Dead heat'}
            </span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-rule border border-rule">
            <div className="bg-paper min-w-0"><SignalCard t={termA} compact /></div>
            <div className="bg-paper min-w-0"><SignalCard t={termB} compact /></div>
          </div>
          <p className="small-caps text-whisper text-[10px]">
            Tap two phrases above to set the matchup. The defining tension primitive, e.g. obliterated vs ceasefire.
          </p>
        </div>
      )}
    </section>
  );
}
