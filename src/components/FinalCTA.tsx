import { useState } from 'react';
import { SUBSTACK_SUBSCRIBE } from '../data/terms';

export function FinalCTA() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    const clean = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) return;
    setSubmitting(true);
    // Open Substack on the click (revenue), then record to our own list in the background.
    window.open(`${SUBSTACK_SUBSCRIBE}?email=${encodeURIComponent(clean)}`, '_blank', 'noopener');
    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: clean }),
    }).catch(() => {});
    setSubmitted(true);
    setSubmitting(false);
  }

  return (
    <section className="bg-paper border-y border-rule px-6 lg:px-12 py-12 lg:py-16">
      <div className="max-w-screen-xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-4">
          <span className="small-caps text-muted">// Subscribe</span>
          <h2 className="font-display font-bold tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-[0.95] text-balance">
            See the words that decide the story.
          </h2>
          <p className="text-muted text-base leading-relaxed max-w-xl">
            Weekly intelligence files. The terms doing the rhetorical work, who's
            using them, and what each word reveals about what comes next.
          </p>
        </div>

        <div className="lg:col-span-5">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="small-caps text-muted block">Archive Access ID</label>
              <input
                type="email"
                required
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-canvas border border-rule px-4 py-3 text-sm focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink placeholder:text-whisper transition-colors"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-ink text-paper py-3 small-caps hover:bg-ink/85 active:scale-[0.99] transition-all disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : 'Subscribe to the dispatch'}
              </button>
              <p className="small-caps text-whisper text-[10px]">
                Free. Weekly. Unsubscribe anytime.
              </p>
            </form>
          ) : (
            <div className="border border-ink p-4 bg-canvas space-y-3">
              <div className="small-caps text-ink">You're on the list</div>
              <p className="text-sm text-muted leading-relaxed">
                We've opened Substack to confirm your subscription. If it didn't open, use the link below.
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
        </div>
      </div>
    </section>
  );
}
