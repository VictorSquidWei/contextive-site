import type { ReactNode } from 'react';
import type { CampaignTerm } from '../data/campaign';

function fmtPct(v?: number | null): string {
  if (v === null || v === undefined) return '—';
  return `${v > 0 ? '+' : ''}${v}%`;
}

function deltaGlyph(v?: number | null): string {
  if (v === null || v === undefined) return '·';
  if (v > 0) return '▲';
  if (v < 0) return '▼';
  return '■';
}

const LEVELS: Record<string, number> = { FALLING: 1, STEADY: 2, RISING: 3, SPIKING: 4 };

function LegacyVelocityBar({ label }: { label?: string }) {
  const active = (label && LEVELS[label]) || 0;
  return (
    <div className="flex gap-[2px] items-end h-3">
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className={`w-[3px] ${n <= active ? 'bg-current' : 'bg-current opacity-15'}`}
          style={{ height: `${4 + n * 2}px` }}
        />
      ))}
    </div>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <div className="small-caps text-muted tracking-[0.18em] sm:tracking-[0.3em] mb-1.5">{label}</div>
      <div className="font-mono text-sm font-medium">{children}</div>
    </div>
  );
}

export function SignalCard({ term }: { term: CampaignTerm }) {
  const m = term.measurement;
  const pending = m.status === 'pending';
  const measured = m.status === 'measured';

  return (
    <article className="paper-grain dossier-shadow w-full border border-ink/10 p-7 sm:p-8 flex flex-col gap-6 text-ink h-full">
      {/* Top metadata bar */}
      <div className="flex items-start justify-between border-b border-ink/15 pb-5">
        <div className="space-y-1">
          {term.ref && <div className="small-caps text-ink/60">REF / {term.ref}</div>}
          {term.domainTag && <div className="small-caps text-muted">{term.domainTag}</div>}
        </div>
        <div className="text-right space-y-1">
          <div className="small-caps text-ink/60">
            {measured
              ? m.adoptionStage || 'MEASURED'
              : pending
                ? 'PENDING'
                : term.classification || 'EDITORIAL'}
          </div>
          {term.cluster && <div className="small-caps text-muted">CLUSTER {term.cluster}</div>}
        </div>
      </div>

      {/* Term title */}
      <div className="space-y-2">
        <div className="small-caps text-muted">TERM PROFILE</div>
        <h3 className="font-display font-bold uppercase leading-[0.95] tracking-tight text-3xl sm:text-4xl text-balance">
          {term.term}
        </h3>
      </div>

      {/* Signal block — measured / pending / editorial */}
      {pending ? (
        <div className="border border-dashed border-ink/30 px-4 py-3 small-caps text-ink/60 flex items-center gap-3">
          <span className="velocity-pulse" aria-hidden>
            ◷
          </span>
          MEASUREMENT PENDING: {m.reason || 'awaiting pipeline run'}
        </div>
      ) : measured ? (
        <div className="space-y-4 border-y border-ink/10 py-4">
          <div>
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="small-caps text-muted">VELOCITY INDEX</span>
              <span className="font-mono text-sm font-medium">{m.velocityIndex ?? '—'} / 100</span>
            </div>
            <div className="h-1 bg-ink/10">
              <div className="h-1 bg-ink" style={{ width: `${m.velocityIndex ?? 0}%` }} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Stat label="30D">
              {deltaGlyph(m.deltas?.d30)} {fmtPct(m.deltas?.d30)}
            </Stat>
            <Stat label="90D">
              {deltaGlyph(m.deltas?.d90)} {fmtPct(m.deltas?.d90)}
            </Stat>
            <Stat label="YOY">
              {deltaGlyph(m.deltas?.yoy)} {fmtPct(m.deltas?.yoy)}
            </Stat>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Stat label="SENTIMENT">{m.sentiment == null ? 'n/a' : m.sentiment.toFixed(1)}</Stat>
            <Stat label="STAGE">
              <span className="small-caps">{m.adoptionStage || '—'}</span>
            </Stat>
            <Stat label="DENSITY">{m.corpusDensity ? m.corpusDensity.value : '—'}</Stat>
          </div>
          {m.inflections && m.inflections.length > 0 && (
            <div>
              <div className="small-caps text-muted mb-1">INFLECTIONS</div>
              <div className="font-mono text-xs text-muted">
                {m.inflections.map((p) => p.date).join('  ·  ')}
              </div>
            </div>
          )}
          {m.corpusDensity?.proxy && (
            <div className="small-caps text-muted text-[9px] leading-relaxed">
              Coverage intensity proxy, not literal mentions/M
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4 border-y border-ink/10 py-4">
          <div>
            <div className="small-caps text-muted mb-1.5">VELOCITY</div>
            <div className="flex items-center gap-2">
              <LegacyVelocityBar label={m.velocityLabel} />
              <span className="small-caps">{m.velocityLabel}</span>
            </div>
          </div>
          <Stat label="SENTIMENT">{m.sentiment == null ? '·' : m.sentiment.toFixed(1)}</Stat>
          <Stat label="FILES">{m.totalFiles?.toLocaleString() ?? '—'}</Stat>
        </div>
      )}

      {/* What the word does / where contested */}
      <div className="flex-1 space-y-3">
        {term.whatItDoes && (
          <>
            <div className="small-caps text-muted">WHAT THE WORD DOES</div>
            <p className="font-display text-base leading-snug text-balance">{term.whatItDoes}</p>
          </>
        )}
        {term.whereContested && (
          <>
            <div className="small-caps text-muted pt-2">WHERE IT IS CONTESTED</div>
            <p className="text-[13px] leading-relaxed text-muted">{term.whereContested}</p>
          </>
        )}
      </div>

      {/* Platforms + co-occurrence */}
      {term.platforms?.length ? (
        <div className="text-[11px]">
          <span className="small-caps text-muted">PLATFORMS </span>
          <span className="text-muted">{term.platforms.join(', ')}</span>
        </div>
      ) : null}
      {term.coOccurrence?.length ? (
        <div className="text-[11px]">
          <span className="small-caps text-muted">CO-OCCURRENCE </span>
          <span className="text-muted">{term.coOccurrence.join(', ')}</span>
        </div>
      ) : null}

      {/* Verbatim */}
      {term.verbatims && term.verbatims.length > 0 && (
        <div className="border-l-2 border-ink/30 pl-4 space-y-1">
          <p className="font-display text-sm italic leading-snug">"{term.verbatims[0].quote}"</p>
          {term.verbatims[0].attribution && (
            <p className="small-caps text-muted">{term.verbatims[0].attribution}</p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-ink/10 mt-auto small-caps text-muted">
        <span>{term.firstSeen ? `FIRST SEEN / ${term.firstSeen}` : m.retrievedAt ? 'MEASURED' : ''}</span>
        <span>{term.statusLabel || (measured ? 'SIGNAL' : pending ? 'QUEUED' : '')}</span>
      </div>
    </article>
  );
}
