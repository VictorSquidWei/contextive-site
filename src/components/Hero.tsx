import { useEffect, useState } from 'react';
import { TERM_FILES, SUBSTACK_SUBSCRIBE } from '../data/terms';
import { DossierCard } from './DossierCard';

const HERO_CARDS = [
  TERM_FILES.find((t) => t.term === 'AGENTIC')!,
  TERM_FILES.find((t) => t.term === 'PROMPTWASHING')!,
  TERM_FILES.find((t) => t.term === 'RECIPROCAL')!,
  TERM_FILES.find((t) => t.term === 'AI SLOP')!,
  TERM_FILES.find((t) => t.term === 'CEASEFIRE')!,
];

export function Hero() {
  const [index, setIndex] = useState(0);
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-cycle the hero cards
  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_CARDS.length);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError('Enter a valid email address.');
      return;
    }
    setSubmitting(true);
    setError(null);
    // Open our Substack page on the click itself (so it isn't popup-blocked) —
    // subscribing there is revenue, and the email is pre-filled.
    window.open(`${SUBSTACK_SUBSCRIBE}?email=${encodeURIComponent(clean)}`, '_blank', 'noopener');
    // Record to our own list in the background, for later email automation.
    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: clean }),
    }).catch(() => {});
    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <section id="top" className="relative pt-10 pb-16 lg:pt-16 lg:pb-20 px-6 lg:px-12">
      <div className="max-w-screen-xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
        {/* LEFT: Headline + form */}
        <div className="lg:col-span-7 space-y-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="inline-block w-2 h-2 bg-ink rotate-45" />
              <span className="small-caps text-muted">Intelligence Archive // Active Cycle 02</span>
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
            The words move first. The market follows. Contextive tracks high-leverage
            language across politics, finance, AI, and culture — and decodes what each
            word is doing before it shows up in the data.
          </p>

          {/* Waitlist form */}
          <div id="waitlist" className="max-w-md space-y-4">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 bg-canvas border border-rule px-4 py-4 text-sm focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink placeholder:text-whisper transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-ink text-paper px-6 py-4 small-caps hover:bg-ink/85 active:scale-[0.98] transition-all disabled:opacity-60"
                  >
                    {submitting ? 'Submitting' : 'Access Archive'}
                  </button>
                </div>
                {error && <p className="small-caps text-ink">{error}</p>}
              </form>
            ) : (
              <div className="border border-ink p-5 bg-canvas space-y-3">
                <div className="small-caps text-ink">You're on the list</div>
                <p className="text-sm text-muted leading-relaxed">
                  We've opened Substack in a new tab to confirm your subscription. If it
                  didn't open, use the link below.
                </p>
                <a
                  href={`${SUBSTACK_SUBSCRIBE}?email=${encodeURIComponent(email)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 small-caps text-ink border border-ink px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
                >
                  Confirm on Substack →
                </a>
              </div>
            )}

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
