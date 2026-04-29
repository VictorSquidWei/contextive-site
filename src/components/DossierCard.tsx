import type { TermFile } from '../data/terms';

interface DossierCardProps {
  term: TermFile;
  compact?: boolean;
}

function VelocityBar({ velocity }: { velocity: TermFile['velocity'] }) {
  const levels = { FALLING: 1, STEADY: 2, RISING: 3, SPIKING: 4 } as const;
  const active = levels[velocity];
  return (
    <div className="flex gap-[2px] items-end h-3">
      {[1, 2, 3, 4].map((n) => (
        <div
          key={n}
          className={`w-[3px] transition-colors ${
            n <= active ? 'bg-current' : 'bg-current opacity-15'
          }`}
          style={{ height: `${4 + n * 2}px` }}
        />
      ))}
    </div>
  );
}

export function DossierCard({ term, compact = false }: DossierCardProps) {
  const sentimentTone = term.sentiment > 1 ? '+' : term.sentiment < -1 ? '−' : '·';

  return (
    <article
      className={`paper-grain dossier-shadow ${
        compact ? 'w-[300px] sm:w-[340px]' : 'w-full'
      } border border-ink/10 p-7 sm:p-8 flex flex-col gap-6 text-ink relative`}
    >
      {/* Top metadata bar */}
      <div className="flex items-start justify-between border-b border-ink/15 pb-5">
        <div className="space-y-1">
          <div className="small-caps text-ink/60">
            REF / {term.ref}
          </div>
          <div className="small-caps text-ink/40">
            {term.campaign}
          </div>
        </div>
        <div className="text-right space-y-1">
          <div className="small-caps text-ink/60">{term.classification}</div>
          <div className="small-caps text-ink/40">CONF. HIGH</div>
        </div>
      </div>

      {/* Term title */}
      <div className="space-y-2">
        <div className="small-caps text-muted">TERM PROFILE</div>
        <h3 className="font-display font-bold uppercase leading-[0.95] tracking-tight text-3xl sm:text-4xl text-balance">
          {term.term}
        </h3>
        <div className="small-caps text-muted">{term.domain}</div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-4 pt-2 pb-2 border-y border-ink/10 py-4">
        <div>
          <div className="small-caps text-ink/40 mb-1.5">VELOCITY</div>
          <div className="flex items-center gap-2">
            <VelocityBar velocity={term.velocity} />
            <span className="small-caps">{term.velocity}</span>
          </div>
        </div>
        <div>
          <div className="small-caps text-ink/40 mb-1.5">SENTIMENT</div>
          <div className="font-mono text-sm font-medium">
            {sentimentTone} {term.sentiment.toFixed(1)}
          </div>
        </div>
        <div>
          <div className="small-caps text-ink/40 mb-1.5">FILES</div>
          <div className="font-mono text-sm font-medium">{term.totalFiles.toLocaleString()}</div>
        </div>
      </div>

      {/* Contextual note */}
      <div className="flex-1 space-y-3">
        <div className="flex items-center gap-2 small-caps text-ink/40">
          <span>⚐</span>
          <span>CONTEXTUAL NOTE</span>
        </div>
        <p className="font-display text-base leading-snug text-balance">
          {term.scope}
        </p>
        <p className="text-[13px] leading-relaxed text-muted">
          {term.contextNote}
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-ink/10 mt-auto">
        <div className="small-caps text-ink/50">
          FIRST SEEN / {term.firstSeen}
        </div>
        <div className="flex items-center gap-2">
          <span className="small-caps text-ink/50">{term.status}</span>
          <div className="w-2.5 h-2.5 border border-ink/40" />
        </div>
      </div>
    </article>
  );
}
