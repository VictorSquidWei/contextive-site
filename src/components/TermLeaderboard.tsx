import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { CampaignTerm } from '../data/campaign';
import { plainRead, humanPct, leaderboardSort } from '../lib/readSignal';

function VelocityMeter({ value }: { value?: number }) {
  const v = typeof value === 'number' ? value : 0;
  // spans (not divs) so this is valid phrasing content inside the row <button>.
  return (
    <span className="block h-1.5 w-full bg-ink/10" aria-hidden>
      <span className="block h-1.5 bg-ink" style={{ width: `${v}%` }} />
    </span>
  );
}

function Row({
  term,
  rank,
  readoutHref,
  open,
  onToggle,
}: {
  term: CampaignTerm;
  rank: number;
  readoutHref: string;
  open: boolean;
  onToggle: () => void;
}) {
  const m = term.measurement;
  const read = plainRead(term);
  const rowId = `lb-${term.ref || term.term}`.replace(/[^a-zA-Z0-9-]/g, '-');

  return (
    <div className="bg-canvas">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={open ? `${rowId}-panel` : undefined}
        className="w-full text-left px-4 sm:px-5 py-4 flex items-center gap-3 sm:gap-5 hover:bg-ink/[0.03] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-ink"
      >
        {/* Rank */}
        <span className="font-mono text-xs text-muted w-6 shrink-0 tabular-nums">
          {String(rank).padStart(2, '0')}
        </span>

        {/* Term + meter */}
        <span className="flex-1 min-w-0 space-y-1.5">
          <span className="flex items-center gap-2 flex-wrap">
            <span className="font-display font-bold text-base sm:text-lg leading-tight uppercase tracking-tight break-words min-w-0">
              {term.term}
            </span>
            <span
              className={`small-caps text-[10px] px-1.5 py-0.5 border ${
                read.pending ? 'border-dashed border-ink/30 text-muted' : 'border-ink/25 text-ink'
              }`}
            >
              {read.chip}
            </span>
          </span>
          {!read.pending && <VelocityMeter value={m.velocityIndex} />}
        </span>

        {/* 90d change + chevron */}
        <span className="flex items-center gap-3 sm:gap-4 shrink-0">
          <span className="text-right leading-tight">
            {read.pending ? (
              <span className="small-caps text-muted text-[10px]">Pending</span>
            ) : (
              <>
                <span className="font-mono text-sm font-medium tabular-nums block">
                  {humanPct(m.deltas?.d90)}
                </span>
                <span className="small-caps text-muted text-[9px]">90-day</span>
              </>
            )}
          </span>
          <span
            className={`text-muted transition-transform ${open ? 'rotate-90' : ''}`}
            aria-hidden
          >
            ›
          </span>
        </span>
      </button>

      {/* Expanded detail */}
      {open && (
        <div
          id={`${rowId}-panel`}
          className="px-4 sm:px-5 pb-5 pt-1 space-y-4 border-t border-rule bg-canvas"
        >
          {read.pending ? (
            <p className="text-sm text-muted leading-relaxed">
              Measurement pending: {m.reason || 'this word is not yet at a measurable level in the news coverage.'}
            </p>
          ) : (
            <>
              {term.whatItDoes && (
                <p className="text-sm leading-relaxed text-balance">{term.whatItDoes}</p>
              )}
              <div className="flex flex-wrap gap-x-8 gap-y-2">
                <span className="min-w-0">
                  <span className="small-caps text-muted text-[10px] block mb-0.5">Momentum</span>
                  <span className="text-sm">{read.blurb}</span>
                </span>
                <span>
                  <span className="small-caps text-muted text-[10px] block mb-0.5">30-day</span>
                  <span className="font-mono text-sm tabular-nums">{humanPct(m.deltas?.d30)}</span>
                </span>
                <span>
                  <span className="small-caps text-muted text-[10px] block mb-0.5">90-day</span>
                  <span className="font-mono text-sm tabular-nums">{humanPct(m.deltas?.d90)}</span>
                </span>
                <span>
                  <span className="small-caps text-muted text-[10px] block mb-0.5">Rank</span>
                  <span className="font-mono text-sm tabular-nums">{m.velocityIndex ?? '—'} / 100</span>
                </span>
              </div>
            </>
          )}
          <Link
            to={readoutHref}
            className="inline-flex items-center gap-1.5 small-caps text-ink underline underline-offset-4 hover:no-underline"
          >
            See full details <span aria-hidden>→</span>
          </Link>
        </div>
      )}
    </div>
  );
}

export function TermLeaderboard({
  terms,
  campaignId,
}: {
  terms: CampaignTerm[];
  campaignId: string;
}) {
  const [openRef, setOpenRef] = useState<string | null>(null);
  const sorted = [...terms].sort(leaderboardSort);

  return (
    <div className="border border-rule divide-y divide-rule">
      {sorted.map((t, i) => {
        const key = t.ref || t.term;
        const anchor = (t.ref || t.term).replace(/[^a-zA-Z0-9-]/g, '-');
        return (
          <Row
            key={key}
            term={t}
            rank={i + 1}
            readoutHref={`/campaigns/${campaignId}/readout#${anchor}`}
            open={openRef === key}
            onToggle={() => setOpenRef(openRef === key ? null : key)}
          />
        );
      })}
    </div>
  );
}
