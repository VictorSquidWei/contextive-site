import { useState } from 'react';
import { SUBSTACK_SUBSCRIBE } from '../data/terms';

export function FinalCTA() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        window.open(`${SUBSTACK_SUBSCRIBE}?email=${encodeURIComponent(email)}`, '_blank');
      }
      setSubmitted(true);
      setEmail('');
    } catch {
      window.open(`${SUBSTACK_SUBSCRIBE}?email=${encodeURIComponent(email)}`, '_blank');
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="bg-paper border-y border-rule px-6 lg:px-12 py-12 lg:py-16">
      <div className="max-w-screen-xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-4">
          <span className="small-caps text-muted">// 05 — Subscribe</span>
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
            <div className="border border-ink p-4 bg-canvas space-y-2">
              <div className="small-caps text-ink">Subscription Confirmed</div>
              <p className="text-sm text-muted leading-relaxed">
                Welcome to the archive. Check your inbox.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
