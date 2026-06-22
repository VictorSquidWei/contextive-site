import { Link } from 'react-router-dom';

/* Compact animated motif echoing the methodology page: a crowd of marks
   flowing along a dashed rail into a single SIGNAL node. Monochrome, HTML/CSS
   only (respects prefers-reduced-motion via the shared keyframes). */
function MiniFlow() {
  return (
    <div className="relative border border-rule bg-paper paper-grain px-6 py-10 sm:px-10">
      <div className="flex items-center gap-5 sm:gap-8 text-ink">
        {/* the crowd */}
        <div className="grid grid-cols-5 gap-2.5 shrink-0" aria-hidden="true">
          {Array.from({ length: 25 }).map((_, i) => (
            <span
              key={i}
              className="crowd-dot block w-1.5 h-1.5 bg-ink"
              style={{ animationDelay: `${((i % 5) + Math.floor(i / 5)) * 0.3}s` }}
            />
          ))}
        </div>

        {/* the flow */}
        <div className="flow-rail h-px flex-1" aria-hidden="true" />

        {/* the signal */}
        <div
          className="node-pulse shrink-0 border-2 border-ink px-4 py-3 text-center bg-paper"
          style={{ transformOrigin: 'center' }}
        >
          <div className="font-display font-bold text-sm leading-none">SIGNAL</div>
        </div>
      </div>
      <div className="mt-6 flex items-center justify-between small-caps text-whisper">
        <span>The crowd</span>
        <span>GDELT</span>
        <span>Measured</span>
      </div>
    </div>
  );
}

export function HowItWorksTeaser() {
  return (
    <section className="px-6 lg:px-12 py-16 lg:py-24 border-t border-rule bg-canvas">
      <div className="max-w-screen-xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
        <div className="lg:col-span-6 space-y-5">
          <div className="flex items-center gap-3">
            <span className="inline-block w-2 h-2 bg-ink rotate-45" />
            <span className="small-caps text-muted">Methodology</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight text-balance">
            How a word becomes a measured signal
          </h2>
          <p className="text-muted leading-relaxed max-w-[440px]">
            From the open record to a number you can check — velocity, not verdict.
            See the signal layer, animated.
          </p>
          <Link
            to="/how-it-works"
            className="group inline-flex items-center gap-3 small-caps text-ink border-b-2 border-ink pb-1 hover:gap-4 transition-all"
          >
            See how it works
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </div>
        <div className="lg:col-span-6">
          <MiniFlow />
        </div>
      </div>
    </section>
  );
}
