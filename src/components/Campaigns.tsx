import { useEffect, useRef, useState } from 'react';
import { CAMPAIGNS } from '../data/terms';

function padded(n: number) {
  return String(n).padStart(2, '0');
}

export function Campaigns() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');
  const chipRowRef = useRef<HTMLDivElement>(null);

  const active = CAMPAIGNS[activeIdx];
  const total = CAMPAIGNS.length;

  function goTo(i: number) {
    if (i === activeIdx || i < 0 || i >= total) return;
    setDirection(i > activeIdx ? 'forward' : 'backward');
    setActiveIdx(i);
  }

  function prev() {
    if (activeIdx > 0) goTo(activeIdx - 1);
  }

  function next() {
    if (activeIdx < total - 1) goTo(activeIdx + 1);
  }

  useEffect(() => {
    const el = chipRowRef.current?.querySelector<HTMLElement>(`[data-idx="${activeIdx}"]`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [activeIdx]);

  const slideClass =
    direction === 'forward' ? 'campaign-slide-in-right' : 'campaign-slide-in-left';

  return (
    <section id="campaigns" className="bg-canvas border-y border-rule px-6 lg:px-12 py-12 lg:py-16">
      <div className="max-w-screen-xl mx-auto">
        {/* Header row: eyebrow + headline left, controls right */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6">
          <div>
            <span className="small-caps text-muted">// 03 Campaigns</span>
            <h2 className="font-display font-bold tracking-tight text-3xl lg:text-4xl mt-4 leading-[1.0] text-balance">
              The vocabulary war, by campaign.
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={prev}
              disabled={activeIdx === 0}
              aria-label="Previous campaign"
              className="border border-ink p-2 transition-colors enabled:hover:bg-ink enabled:hover:text-paper disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="small-caps tabular-nums text-muted whitespace-nowrap">
              <span className="text-ink">{padded(activeIdx + 1)}</span> / {padded(total)}
            </div>
            <button
              onClick={next}
              disabled={activeIdx === total - 1}
              aria-label="Next campaign"
              className="border border-ink p-2 transition-colors enabled:hover:bg-ink enabled:hover:text-paper disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </div>
        </div>

        {/* Chip strip */}
        <div className="relative mb-8">
          <div
            ref={chipRowRef}
            className="flex gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth py-2 [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
          >
            {CAMPAIGNS.map((c, i) => {
              const isActive = i === activeIdx;
              return (
                <button
                  key={c.id}
                  data-idx={i}
                  onClick={() => goTo(i)}
                  className={`snap-start shrink-0 min-w-[180px] sm:min-w-[200px] text-left border border-ink p-4 transition-colors ${
                    isActive
                      ? 'bg-ink text-paper'
                      : 'bg-canvas text-ink hover:bg-ink/5'
                  }`}
                >
                  <div className={`small-caps ${isActive ? 'text-paper/60' : 'text-muted'}`}>
                    {c.label}
                  </div>
                  <div className="font-display font-bold text-base leading-tight tracking-tight mt-1">
                    {c.shortTitle}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-canvas to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-canvas to-transparent" />
        </div>

        {/* Active campaign block */}
        <div className="relative overflow-hidden">
          <article key={activeIdx} className={`grid lg:grid-cols-12 gap-8 ${slideClass}`}>
            {/* Number / metadata column */}
            <div className="lg:col-span-3">
              <div className="flex lg:flex-col gap-4 lg:gap-2 items-baseline">
                <div className="campaign-number-pop font-display font-bold text-6xl lg:text-7xl leading-none text-ink/90">
                  {padded(activeIdx + 1)}
                </div>
                <div>
                  <div className="small-caps text-muted mb-1">{active.label}</div>
                  <div className="small-caps text-ink">{active.period}</div>
                </div>
              </div>
            </div>

            {/* Content column */}
            <div className="lg:col-span-9 space-y-6">
              <div className="space-y-3">
                <h3 className="font-display font-bold tracking-tight text-2xl lg:text-3xl leading-[1.05] text-balance">
                  {active.title}
                </h3>
                <p className="text-muted leading-relaxed text-base max-w-3xl text-balance">
                  {active.description}
                </p>
              </div>

              {/* Pillars */}
              <div className="grid md:grid-cols-3 gap-px bg-rule border border-rule">
                {active.pillars.map((p, i) => (
                  <div key={p.title} className="bg-canvas p-5 lg:p-6 space-y-2">
                    <div className="small-caps text-muted">PILLAR / 0{i + 1}</div>
                    <h4 className="font-display font-bold text-base leading-tight">{p.title}</h4>
                    <p className="text-sm text-muted leading-relaxed">{p.body}</p>
                  </div>
                ))}
              </div>

              {/* Term chips */}
              <div className="space-y-2">
                <div className="small-caps text-muted">TRACKED TERMS</div>
                <div className="flex flex-wrap gap-2">
                  {active.terms.map((term) => (
                    <span
                      key={term}
                      className="inline-flex items-center gap-2 border border-ink px-3 py-1.5 small-caps hover:bg-ink hover:text-paper transition-colors cursor-default"
                    >
                      <span className="w-1 h-1 bg-current rotate-45" />
                      {term}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
