import { useState } from 'react';
import { SUBSTACK_SUBSCRIBE } from '../data/terms';

interface WaitlistFormProps {
  /** Tag recorded to our list so we can tell API-waitlist intent from plain dispatch signups. */
  source: string;
  /** Submit button label. */
  submitLabel?: string;
  submittingLabel?: string;
  confirmTitle?: string;
  confirmBody?: string;
  /** 'row' = input + button side by side (hero); 'stack' = button below input (page / CTA). */
  layout?: 'row' | 'stack';
  /** Optional small-caps label above the input (form state only). */
  label?: string;
  /** Optional fine print below the input (form state only). */
  footnote?: string;
  /** Anchor id placed on the wrapper (e.g. "waitlist"). */
  anchorId?: string;
  className?: string;
}

/**
 * One email capture, two outcomes: it records the address to our own list (tagged by
 * `source`) AND opens our Substack so the same action subscribes them to the dispatch.
 * Substack is opened on the click itself so it isn't popup-blocked; our-list capture
 * happens in the background and never blocks the flow.
 */
export function WaitlistForm({
  source,
  submitLabel = 'Join the waitlist',
  submittingLabel = 'Submitting',
  confirmTitle = "You're on the list",
  confirmBody = "We've opened Substack in a new tab to confirm your subscription. If it didn't open, use the link below.",
  layout = 'stack',
  label,
  footnote,
  anchorId,
  className = '',
}: WaitlistFormProps) {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    // Open Substack on the click (so it isn't popup-blocked); email is pre-filled.
    window.open(`${SUBSTACK_SUBSCRIBE}?email=${encodeURIComponent(clean)}`, '_blank', 'noopener');
    // Record to our own list in the background, tagged by source, for later automation.
    fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: clean, source }),
    }).catch(() => {});
    setSubmitted(true);
    setSubmitting(false);
  }

  if (submitted) {
    return (
      <div id={anchorId} className={`border border-ink p-5 bg-canvas space-y-3 ${className}`}>
        <div className="small-caps text-ink">{confirmTitle}</div>
        <p className="text-sm text-muted leading-relaxed">{confirmBody}</p>
        <a
          href={`${SUBSTACK_SUBSCRIBE}?email=${encodeURIComponent(email)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 small-caps text-ink border border-ink px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
        >
          Confirm on Substack →
        </a>
      </div>
    );
  }

  return (
    <form id={anchorId} onSubmit={handleSubmit} className={`flex flex-col gap-3 ${className}`}>
      {label && <label className="small-caps text-muted block">{label}</label>}
      <div className={`flex gap-3 ${layout === 'row' ? 'flex-col sm:flex-row' : 'flex-col'}`}>
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
          className={`bg-ink text-paper px-6 py-4 small-caps hover:bg-ink/85 active:scale-[0.98] transition-all disabled:opacity-60 ${
            layout === 'stack' ? 'w-full' : ''
          }`}
        >
          {submitting ? submittingLabel : submitLabel}
        </button>
      </div>
      {error && <p className="small-caps text-ink">{error}</p>}
      {footnote && <p className="small-caps text-whisper text-[10px]">{footnote}</p>}
    </form>
  );
}
