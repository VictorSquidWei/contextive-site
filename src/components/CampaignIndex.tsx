import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ALL_CAMPAIGNS } from '../data/campaigns';
import { campaignPath, measuredCount } from '../data/campaign';
import { readerHook, FEATURED_CAMPAIGN_IDS } from '../data/readerHooks';
import { FreshnessBadge } from './FreshnessBadge';
import type { Campaign } from '../data/campaign';

/** Fires once when the element scrolls into view; instant for reduced-motion users. */
function useInView<T extends HTMLElement>(threshold = 0.12) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    ) {
      setInView(true);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setInView(true);
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

/** A thin bar that fills to the measured share (X of 17) once the card reveals. */
function MeasuredBar({ measured, total, inView }: { measured: number; total: number; inView: boolean }) {
  const pct = total ? Math.round((measured / total) * 100) : 0;
  return (
    <span className="block h-[3px] w-full bg-ink/10 group-hover:bg-paper/25 overflow-hidden transition-colors" aria-hidden>
      <span
        className="block h-full bg-ink/50 group-hover:bg-paper/70 transition-[width,background-color] duration-[900ms] ease-out"
        style={{ width: inView ? `${pct}%` : '0%' }}
      />
    </span>
  );
}

function Arrow() {
  return (
    <span
      aria-hidden
      className="inline-block motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:translate-x-1"
    >
      →
    </span>
  );
}

function FeaturedCard({ c, i, inView }: { c: Campaign; i: number; inView: boolean }) {
  const { measured, total } = measuredCount(c);
  const hook = readerHook(c.id);
  return (
    <div className={`ci-item${inView ? ' ci-in' : ''}`} style={{ transitionDelay: `${i * 80}ms` }}>
      <Link
        to={campaignPath(c)}
        className="group relative overflow-hidden h-full bg-canvas border border-rule p-7 lg:p-8 flex flex-col gap-4 min-w-0 hover:bg-ink hover:text-paper transition-colors duration-300 motion-safe:transition-[transform,background-color,color] motion-safe:hover:-translate-y-1 dossier-shadow"
      >
        {/* Ghost number watermark */}
        <span className="pointer-events-none select-none absolute -top-3 right-1 font-display font-black leading-none text-[5.5rem] text-ink/[0.05] group-hover:text-paper/10 transition-colors">
          {c.number}
        </span>

        <div className="flex items-center justify-between small-caps text-muted group-hover:text-paper/60 relative">
          <span>{c.label}</span>
          <span>{c.shortTitle}</span>
        </div>

        <p className="relative font-display font-bold text-2xl lg:text-[1.7rem] leading-[1.1] tracking-tight text-balance">
          {hook || c.title}
        </p>

        <div className="mt-auto pt-4 space-y-3 relative">
          <MeasuredBar measured={measured} total={total} inView={inView} />
          <div className="flex items-center justify-between small-caps">
            <span className="text-muted group-hover:text-paper/60">
              {measured} / {total} measured
            </span>
            <span className="inline-flex items-center gap-2">
              See who is winning <Arrow />
            </span>
          </div>
          <FreshnessBadge
            campaign={c}
            variant="inline"
            className="text-muted group-hover:text-paper/50"
          />
        </div>
      </Link>
    </div>
  );
}

function RowCard({ c, i, inView }: { c: Campaign; i: number; inView: boolean }) {
  const { measured, total } = measuredCount(c);
  const hook = readerHook(c.id);
  return (
    <div className={`ci-item${inView ? ' ci-in' : ''}`} style={{ transitionDelay: `${i * 55}ms` }}>
      <Link
        to={campaignPath(c)}
        className="group relative overflow-hidden h-full bg-canvas border border-rule p-6 lg:p-7 flex items-start gap-5 min-w-0 hover:bg-ink hover:text-paper transition-colors duration-300 motion-safe:transition-[transform,background-color,color] motion-safe:hover:-translate-y-0.5"
      >
        <span className="font-display font-black text-4xl lg:text-5xl leading-none shrink-0 w-14 text-ink/20 group-hover:text-paper/40 transition-colors">
          {c.number}
        </span>
        <span className="min-w-0 flex-1 flex flex-col gap-2 self-center">
          <span className="font-display font-bold text-lg lg:text-xl leading-tight tracking-tight text-balance">
            {hook || c.title}
          </span>
          <MeasuredBar measured={measured} total={total} inView={inView} />
          <span className="small-caps text-muted group-hover:text-paper/60 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>{c.shortTitle}</span>
            <span>{measured} / {total} measured</span>
            <FreshnessBadge campaign={c} variant="inline" />
          </span>
        </span>
        <span className="shrink-0 self-center text-muted group-hover:text-paper">
          <Arrow />
        </span>
      </Link>
    </div>
  );
}

export function CampaignIndex() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const featured = FEATURED_CAMPAIGN_IDS.map((id) => ALL_CAMPAIGNS.find((c) => c.id === id)).filter(
    (c): c is Campaign => !!c
  );
  const featuredIds = new Set(featured.map((c) => c.id));
  const rest = ALL_CAMPAIGNS.filter((c) => !featuredIds.has(c.id));

  return (
    <section id="campaigns" className="px-6 lg:px-12 py-16 lg:py-24 bg-paper">
      <div ref={ref} className="max-w-screen-xl mx-auto">
        <div className="mb-10 lg:mb-16">
          <span className="small-caps text-muted inline-flex items-center gap-2.5">
            <span className="inline-block w-1.5 h-1.5 bg-ink rotate-45 motion-safe:animate-pulse" aria-hidden />
            Ten vocabulary wars
          </span>
          <h2 className="font-display font-bold tracking-tight text-4xl lg:text-6xl mt-6 leading-[0.98] text-balance max-w-4xl">
            Same event, different words. <span className="text-muted">Which one is winning?</span>
          </h2>
          <p className="text-muted mt-6 max-w-2xl leading-relaxed">
            Ten fights over what to call the news, tracked by how fast each word is gaining ground.
            Measured against open coverage data, never estimated.
          </p>
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-4 lg:mb-5">
            {featured.map((c, i) => (
              <FeaturedCard key={c.id} c={c} i={i} inView={inView} />
            ))}
          </div>
        )}

        {/* The rest */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-5">
          {rest.map((c, i) => (
            <RowCard key={c.id} c={c} i={featured.length + i} inView={inView} />
          ))}
        </div>
      </div>
    </section>
  );
}
