import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ALL_CAMPAIGNS } from '../data/campaigns';
import { campaignPath, type Campaign, type CampaignTerm } from '../data/campaign';
import { plainRead, humanPct, findTerm } from '../lib/readSignal';
import { WaitlistForm } from './WaitlistForm';

// The newest campaign is the active cycle (ALL_CAMPAIGNS is sorted by number).
const ACTIVE_CYCLE = ALL_CAMPAIGNS[ALL_CAMPAIGNS.length - 1]?.number ?? '';

// The rotating hero cards read MEASURED campaign data only: every figure on a card is
// the term's own measured 30/90-day change and within-campaign rank, with its own
// measurement date. (They used to read the legacy hand-built terms.ts files, whose
// "SPIKING / sentiment / files" fields were never measured.) A pick that is missing or
// pending drops out instead of showing a number, so the stack can only shrink.
const HERO_PICKS: [string, string][] = [
  ['12', 'youth mental health'],
  ['06', 'ceasefire'],
  ['10', 'cost allocation'],
  ['01', 'export controls'],
  ['02', 'restructuring'],
];
const HERO_CARDS = HERO_PICKS.map(([n, term]) => {
  const c = ALL_CAMPAIGNS.find((x) => x.number === n && x.signalBasis === 'measured');
  const t = c ? findTerm(c, term) : undefined;
  return c && t && t.measurement.status !== 'pending' ? { c, t } : null;
}).filter((x): x is { c: Campaign; t: CampaignTerm } => x !== null);

const fmtDay = (iso?: string) =>
  iso
    ? new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' })
    : '';

function MeasuredCard({ c, t }: { c: Campaign; t: CampaignTerm }) {
  const m = t.measurement;
  const read = plainRead(t);
  const stat = (label: string, value: string) => (
    <div>
      <div className="small-caps text-ink/40 mb-1.5">{label}</div>
      <div className="font-mono text-sm font-medium tabular-nums">{value}</div>
    </div>
  );
  return (
    <article className="paper-grain dossier-shadow w-[300px] sm:w-[340px] border border-ink/10 p-7 sm:p-8 flex flex-col gap-6 text-ink relative">
      <div className="flex items-start justify-between gap-4 border-b border-ink/15 pb-5">
        <div className="space-y-1 min-w-0">
          <div className="small-caps text-ink/60">{c.label}</div>
          <div className="small-caps text-ink/40 truncate">{c.shortTitle}</div>
        </div>
        <div className="text-right space-y-1 shrink-0">
          <div className="small-caps text-ink/60">Measured</div>
          <div className="small-caps text-ink/40">{fmtDay(c.refDate)}</div>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-display font-bold uppercase leading-[0.95] tracking-tight text-3xl sm:text-4xl text-balance">
          {t.term}
        </h3>
        <span className="small-caps text-[11px] px-2 py-0.5 border border-ink/25 inline-block">{read.chip}</span>
      </div>

      <div className="grid grid-cols-3 gap-4 border-y border-ink/10 py-4">
        {stat('90 days', humanPct(m.deltas?.d90))}
        {stat('30 days', humanPct(m.deltas?.d30))}
        {stat('Velocity', m.velocityIndex != null ? `${m.velocityIndex}/100` : '—')}
      </div>

      <p className="text-[13px] leading-relaxed text-muted line-clamp-3">{t.whatItDoes}</p>

      <div className="flex items-center justify-between pt-4 border-t border-ink/10 mt-auto small-caps text-ink/50">
        <span>Measured in news coverage</span>
        <span>Velocity, not verdict</span>
      </div>
    </article>
  );
}

export function Hero() {
  const [index, setIndex] = useState(0);

  // Auto-cycle the hero cards (honor reduced-motion: hold on the first card)
  useEffect(() => {
    if (HERO_CARDS.length < 2) return;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_CARDS.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="top" className="relative pt-10 pb-16 lg:pt-16 lg:pb-20 px-6 lg:px-12">
      <div className="max-w-screen-xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        {/* LEFT: Headline + form */}
        <div className="lg:col-span-7 space-y-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-block w-2 h-2 bg-ink rotate-45" />
              <span className="small-caps text-muted">Intelligence Archive // Active Cycle {ACTIVE_CYCLE}</span>
            </div>
          </div>

          <h1 className="font-display font-bold leading-[0.95] tracking-tight text-balance text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] xl:text-[6.5rem]">
            <span className="block">Language</span>
            <span className="block">
              is{' '}
              <em className="italic font-extrabold not-italic">
                <span className="italic">leverage</span>
              </em>
              <span aria-hidden="true">.</span>
            </span>
          </h1>

          <p className="text-base lg:text-lg text-muted max-w-[480px] leading-relaxed text-balance">
            The words move first. Contextive measures how public language gains momentum
            and shifts meaning across politics, the economy, AI, and culture. It tracks
            which words are winning the argument before the verdict is in.
          </p>

          {/* Email capture — the API early-access waitlist (records to our list; no Substack redirect) */}
          <div className="max-w-md space-y-4">
            <WaitlistForm
              source="hero"
              layout="row"
              apiWaitlist
              label="Join the waitlist for early API access"
              submitLabel="Get early access"
              confirmTitle="You're on the waitlist"
              confirmBody="We'll email you when early access to the Contextive API opens."
              anchorId="waitlist"
            />

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-3 text-muted">
                <div className="w-1.5 h-1.5 bg-ink rotate-45" />
                <span className="small-caps text-[9px]">Full-text news velocity tracking</span>
              </div>
              <div className="flex items-center gap-3 text-muted">
                <div className="w-1.5 h-1.5 bg-ink rotate-45" />
                <span className="small-caps text-[9px]">Human reviewed signal files</span>
              </div>
              <div className="flex items-center gap-3 text-muted">
                <div className="w-1.5 h-1.5 bg-ink rotate-45" />
                <span className="small-caps text-[9px]">Weekly intelligence dispatch</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Rotating dossier card stack */}
        <div className="lg:col-span-5 relative">
          <div className="card-stage relative h-[480px] lg:h-[560px] flex items-center justify-center">
            {HERO_CARDS.map((card, i) => {
              const offset = (i - index + HERO_CARDS.length) % HERO_CARDS.length;
              return (
                <Link
                  to={campaignPath(card.c)}
                  aria-label={`${card.t.term}: open ${card.c.title}`}
                  tabIndex={offset === 0 ? 0 : -1}
                  key={`${card.c.number}-${card.t.term}`}
                  className="absolute transition-all duration-1000 ease-[cubic-bezier(0.2,0,0.2,1)]"
                  style={{
                    transform: `
                      translate3d(${offset * 14}px, ${-offset * 18}px, ${-offset * 80}px)
                      scale(${1 - offset * 0.04})
                    `,
                    opacity: offset > 3 ? 0 : 1 - offset * 0.18,
                    zIndex: HERO_CARDS.length - offset,
                    filter: offset === 0 ? 'blur(0)' : `blur(${offset * 0.6}px)`,
                  }}
                >
                  <MeasuredCard c={card.c} t={card.t} />
                </Link>
              );
            })}
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {HERO_CARDS.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                className={`h-[2px] transition-all ${
                  i === index ? 'w-8 bg-ink' : 'w-4 bg-rule hover:bg-muted'
                }`}
                aria-label={`Show card ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
