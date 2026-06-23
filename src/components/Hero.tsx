import { useEffect, useState } from 'react';
import { TERM_FILES } from '../data/terms';
import { DossierCard } from './DossierCard';
import { WaitlistForm } from './WaitlistForm';

const HERO_CARDS = [
  TERM_FILES.find((t) => t.term === 'AGENTIC')!,
  TERM_FILES.find((t) => t.term === 'PROMPTWASHING')!,
  TERM_FILES.find((t) => t.term === 'RECIPROCAL')!,
  TERM_FILES.find((t) => t.term === 'AI SLOP')!,
  TERM_FILES.find((t) => t.term === 'CEASEFIRE')!,
];

export function Hero() {
  const [index, setIndex] = useState(0);

  // Auto-cycle the hero cards
  useEffect(() => {
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
              <span className="small-caps text-muted">Intelligence Archive // Active Cycle 06</span>
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
            and shifts meaning across politics, the economy, AI, and culture — tracking
            which words are winning the argument before the verdict is in.
          </p>

          {/* Email capture — records to our list + opens the dispatch on Substack */}
          <div className="max-w-md space-y-4">
            <WaitlistForm source="hero" layout="row" submitLabel="Access Archive" anchorId="waitlist" />

            <div className="flex flex-col gap-2 pt-2">
              <div className="flex items-center gap-3 text-muted">
                <div className="w-1.5 h-1.5 bg-ink rotate-45" />
                <span className="small-caps text-[9px]">Cross-platform velocity tracking</span>
              </div>
              <div className="flex items-center gap-3 text-muted">
                <div className="w-1.5 h-1.5 bg-ink rotate-45" />
                <span className="small-caps text-[9px]">Human-reviewed signal files</span>
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
                <div
                  key={card.ref}
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
                  <DossierCard term={card} compact />
                </div>
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
