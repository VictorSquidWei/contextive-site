import { Link } from 'react-router-dom';

/* Compact animated motif: a live API response. A query line with a blinking
   cursor, an ascending velocity sparkline with a pulsing endpoint, and a
   scanning sheen. Monochrome, CSS-only, respects prefers-reduced-motion.
   Numbers are real — the measured `ceasefire` reading (Campaign 06), not invented. */
function MiniSignal() {
  return (
    <div className="relative border border-rule bg-paper paper-grain overflow-hidden">
      {/* scanning sheen */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="scan-sweep absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-ink/[0.06] to-transparent" />
      </div>

      <div className="relative px-6 py-6 sm:px-8 space-y-5">
        {/* query line */}
        <div className="font-mono text-xs sm:text-sm text-ink flex items-center gap-1.5 flex-wrap">
          <span className="text-muted">GET</span>
          <span>/v1/terms/ceasefire</span>
          <span className="api-cursor inline-block w-[7px] h-[1.05em] bg-ink translate-y-[2px]" aria-hidden="true" />
        </div>

        {/* velocity sparkline */}
        <svg viewBox="0 0 300 80" className="w-full h-16 text-ink" fill="none" aria-hidden="true">
          <line x1="0" y1="74" x2="300" y2="74" stroke="currentColor" strokeWidth="1" className="text-rule" />
          <polyline
            points="0,68 30,64 60,70 90,55 120,59 150,45 180,51 210,34 240,40 270,22 292,12"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          <circle cx="292" cy="12" r="5" fill="currentColor" className="velocity-pulse" />
        </svg>

        {/* velocity index */}
        <div className="space-y-2">
          <div className="flex items-center justify-between small-caps text-[10px] text-muted">
            <span>Velocity index</span>
            <span className="font-mono text-ink">100</span>
          </div>
          <div className="h-1.5 bg-rule">
            <div className="h-full bg-ink" style={{ width: '100%' }} />
          </div>
        </div>

        {/* meta */}
        <div className="flex items-center justify-between small-caps text-[10px] text-whisper">
          <span className="border border-rule px-2 py-1 text-muted">Adoption · Spreading</span>
          <span>Measured · GDELT</span>
        </div>
      </div>
    </div>
  );
}

export function ApiTeaser() {
  return (
    <section className="px-6 lg:px-12 py-12 lg:py-16 border-t border-rule bg-paper">
      <div className="max-w-screen-xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <div className="lg:col-span-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 bg-ink rotate-45" />
            <span className="small-caps text-muted">The API</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight text-balance">
            Put the signal in your stack
          </h2>
          <p className="text-muted leading-relaxed max-w-[440px]">
            Query any phrase, get its measured momentum back as structured data: velocity,
            inflection, adoption stage. The same signal behind every campaign, as an API.
          </p>
          <Link
            to="/waitlist"
            className="group inline-flex items-center gap-3 small-caps text-ink border-b-2 border-ink pb-1 hover:gap-4 transition-all"
          >
            Join the API waitlist
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
        <div className="lg:col-span-6">
          <MiniSignal />
        </div>
      </div>
    </section>
  );
}
