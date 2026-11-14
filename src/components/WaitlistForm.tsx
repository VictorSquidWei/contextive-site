import { useState, useRef, useId, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SUBSTACK_SUBSCRIBE } from '../data/terms';
import { readAttribution } from '../lib/attribution';

interface WaitlistFormProps {
  /** Tag recorded to our list so we can tell API-waitlist intent from plain dispatch signups. */
  source: string;
  /** Submit button label. */
  submitLabel?: string;
  /** Unused since the two-step form: kept so existing callers still type-check. */
  submittingLabel?: string;
  confirmTitle?: string;
  confirmBody?: string;
  /** 'row' = compact two-column fields (hero, /waitlist); 'stack' = one column (CTA blocks). */
  layout?: 'row' | 'stack';
  /** Small-caps title in the card's file header. */
  label?: string;
  /** Optional fine print under the button (step 1 only). */
  footnote?: string;
  /** Anchor id placed on the wrapper (e.g. "waitlist"). */
  anchorId?: string;
  className?: string;
  /**
   * API early-access waitlist mode. When true, submitting records the sign-up and confirms
   * with API-waitlist language WITHOUT redirecting to Substack (Substack becomes an optional
   * link). When false (default), submitting also opens Substack, for the free newsletter CTA.
   */
  apiWaitlist?: boolean;
}

// ── Shared look: the site's dossier vocabulary (small caps, rules, monochrome) ─────────
// Inputs are 16px on phones so iOS does not zoom on focus, and at least 48px tall.
const INPUT =
  'w-full min-w-0 min-h-[48px] bg-paper border border-rule px-3.5 py-3 text-base sm:text-sm text-ink ' +
  'placeholder:text-whisper focus:outline-none focus:border-ink focus:ring-1 focus:ring-ink transition-colors';
const BUTTON =
  'min-h-[48px] bg-ink text-paper px-6 py-3 small-caps hover:bg-ink/85 active:scale-[0.98] transition-all ' +
  'disabled:opacity-60 inline-flex items-center justify-center gap-2';

/** Trim, collapse spaces, drop control characters, cap the length. */
const tidy = (v: string, max: number) =>
  v.replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);

/** A random id that ties the optional second step to the same Sheet row. */
function newSignupId(): string {
  try {
    const c: Crypto | undefined = typeof crypto !== 'undefined' ? crypto : undefined;
    if (c && typeof c.randomUUID === 'function') return c.randomUUID();
    if (c && typeof c.getRandomValues === 'function') {
      const b = c.getRandomValues(new Uint8Array(16));
      return Array.from(b, (x: number) => x.toString(16).padStart(2, '0')).join('');
    }
    throw new Error('no crypto');
  } catch {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
  }
}

function post(payload: Record<string, unknown>): Promise<unknown> {
  return fetch('/api/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    keepalive: true,
  }).catch(() => {});
}

function Field({
  n,
  label,
  hint,
  htmlFor,
  children,
}: {
  n: string;
  label: string;
  hint?: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5 min-w-0">
      <label htmlFor={htmlFor} className="block small-caps text-[10px] text-muted leading-relaxed">
        <span className="font-mono text-ink/50 mr-2" aria-hidden>
          {n}
        </span>
        <span className="text-ink">{label}</span>
        {hint && <span className="text-whisper normal-case tracking-normal"> · {hint}</span>}
      </label>
      {children}
    </div>
  );
}

/** The card frame shared by every state: a file header over a ruled body. */
function FileCard({
  id,
  title,
  status,
  children,
  className = '',
}: {
  id?: string;
  title: string;
  status: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div id={id} className={`border border-ink/15 bg-canvas ${className}`}>
      <div className="flex items-center justify-between gap-3 border-b border-ink/10 px-4 sm:px-5 py-2.5">
        <span className="flex items-center gap-2 small-caps text-[10px] text-ink min-w-0">
          <span className="inline-block w-1.5 h-1.5 rotate-45 bg-ink shrink-0" aria-hidden />
          <span className="truncate">{title}</span>
        </span>
        <span className="small-caps text-[10px] text-muted shrink-0">{status}</span>
      </div>
      <div className="p-4 sm:p-5 space-y-4">{children}</div>
    </div>
  );
}

/**
 * Sign-up in two short steps.
 *  1. First name + email: the sign-up is recorded the moment this is sent.
 *  2. Optional "complete your file": a word to measure, a ZIP/postal code, a last name.
 *     It updates the same Sheet row through a random signup id, never through the email.
 */
export function WaitlistForm({
  source,
  submitLabel = 'Join the waitlist',
  confirmTitle = "You're on the list",
  confirmBody = "We've opened Substack in a new tab to confirm your subscription. If it didn't open, use the link below.",
  layout = 'stack',
  label,
  footnote,
  anchorId,
  className = '',
  apiWaitlist = false,
}: WaitlistFormProps) {
  const uid = useId();
  const ids = {
    first: `${uid}-first`,
    email: `${uid}-email`,
    word: `${uid}-word`,
    postal: `${uid}-postal`,
    last: `${uid}-last`,
    error: `${uid}-error`,
  };
  const [step, setStep] = useState<'form' | 'details' | 'done'>('form');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [word, setWord] = useState('');
  const [postal, setPostal] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<{ field: 'first' | 'email' | 'postal'; text: string } | null>(null);
  const signupId = useRef<string>('');
  // Step 2 waits for step 1's request, so its row always exists before the update arrives.
  const firstPost = useRef<Promise<unknown>>(Promise.resolve());
  // Each step's heading takes focus when the step appears, so keyboard and screen-reader
  // users land on the new content instead of the page body.
  const heading = useRef<HTMLDivElement>(null);
  const mounted = useRef(false);
  useEffect(() => {
    if (mounted.current) heading.current?.focus();
    mounted.current = true;
  }, [step]);
  const hpRef = useRef<HTMLInputElement>(null); // honeypot: bots fill it, people don't
  const two = layout === 'row';
  const title = label || (apiWaitlist ? 'Early access request' : 'The dispatch');

  function handleStart(e: React.FormEvent) {
    e.preventDefault();
    const first = tidy(firstName, 60);
    const clean = email.trim().toLowerCase();
    if (!first) return setError({ field: 'first', text: 'Add your first name.' });
    if (clean.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean))
      return setError({ field: 'email', text: 'Enter a valid email address.' });
    setError(null);
    // Newsletter mode opens Substack on the click itself, so it isn't popup-blocked.
    if (!apiWaitlist) {
      window.open(`${SUBSTACK_SUBSCRIBE}?email=${encodeURIComponent(clean)}`, '_blank', 'noopener');
    }
    signupId.current = newSignupId();
    firstPost.current = post({
      email: clean,
      source,
      hp: hpRef.current?.value || '',
      first_name: first,
      signup_id: signupId.current,
      // The ad this visit arrived from (utm_* tags), so the Sheet can tell boosts apart.
      ...readAttribution(),
    });
    setEmail(clean);
    setStep('details');
  }

  function handleDetails(e: React.FormEvent) {
    e.preventDefault();
    const zip = tidy(postal, 10);
    if (zip && !/^[A-Za-z0-9 -]{3,10}$/.test(zip))
      return setError({ field: 'postal', text: 'That ZIP or postal code looks off. Fix it or leave it blank.' });
    setError(null);
    const w = tidy(word, 60);
    const last = tidy(lastName, 60);
    if (w || zip || last) {
      const update = { update: true, signup_id: signupId.current, word_request: w, postal: zip, last_name: last };
      firstPost.current.finally(() => post(update));
    }
    setStep('done');
  }

  const errorLine = error && (
    <p id={ids.error} role="alert" className="text-xs text-ink">
      {error.text}
    </p>
  );
  const invalid = (f: 'first' | 'email' | 'postal') =>
    error?.field === f ? { 'aria-invalid': true, 'aria-describedby': ids.error } : {};
  const privacy = (
    <p className="text-[11px] text-whisper leading-snug">
      We use what you give us only to run Contextive and to email you about it.{' '}
      <Link to="/privacy" className="underline underline-offset-2 hover:text-ink">
        Privacy
      </Link>
    </p>
  );
  const name = tidy(firstName, 60);
  const substackHref = `${SUBSTACK_SUBSCRIBE}?email=${encodeURIComponent(email)}`;

  // ── Step 3: done ──────────────────────────────────────────────────────────
  if (step === 'done') {
    return (
      <FileCard id={anchorId} title={title} status="Filed" className={className}>
        <div role="status" className="space-y-2">
          <div ref={heading} tabIndex={-1} className="font-display font-bold text-lg leading-tight focus:outline-none">
            {confirmTitle}
            {name ? `, ${name}` : ''}.
          </div>
          <p className="text-sm text-muted leading-relaxed">{confirmBody}</p>
        </div>
        <a
          href={substackHref}
          target="_blank"
          rel="noopener noreferrer"
          className={
            apiWaitlist
              ? 'inline-flex items-center min-h-[48px] small-caps text-[10px] text-muted underline underline-offset-4 hover:text-ink transition-colors'
              : 'inline-flex items-center min-h-[48px] gap-2 small-caps text-ink border border-ink px-4 hover:bg-ink hover:text-paper transition-colors'
          }
        >
          {apiWaitlist ? 'Optional: the free dispatch on Substack →' : 'Confirm on Substack →'}
        </a>
      </FileCard>
    );
  }

  // ── Step 2: optional details ──────────────────────────────────────────────
  if (step === 'details') {
    return (
      <FileCard id={anchorId} title={title} status="Optional" className={className}>
        <form onSubmit={handleDetails} className="space-y-4" noValidate>
          <div role="status" className="space-y-1">
            <div ref={heading} tabIndex={-1} className="font-display font-bold text-lg leading-tight focus:outline-none">
              You&rsquo;re on the list{name ? `, ${name}` : ''}.
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Optional, 20 seconds: help us decide what to measure next.
            </p>
          </div>

          <Field n="03" label="A word you want measured" hint="optional" htmlFor={ids.word}>
            <input
              id={ids.word}
              type="text"
              autoComplete="off"
              maxLength={60}
              placeholder="One word or phrase"
              value={word}
              onChange={(e) => setWord(e.target.value)}
              className={INPUT}
            />
            <p className="text-[11px] text-whisper leading-snug">Just the word, no sides.</p>
          </Field>

          <div className={`grid gap-4 ${two ? 'sm:grid-cols-[8rem_1fr]' : ''}`}>
            <Field n="04" label="ZIP" hint="optional" htmlFor={ids.postal}>
              <input
                id={ids.postal}
                type="text"
                autoComplete="postal-code"
                maxLength={10}
                placeholder="ZIP / postal"
                value={postal}
                onChange={(e) => setPostal(e.target.value)}
                {...invalid('postal')}
                className={INPUT}
              />
            </Field>
            <Field n="05" label="Last name" hint="optional" htmlFor={ids.last}>
              <input
                id={ids.last}
                type="text"
                autoComplete="family-name"
                maxLength={60}
                placeholder="Last name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={INPUT}
              />
            </Field>
          </div>

          {errorLine}
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="submit" className={`${BUTTON} sm:flex-1`}>
              Add to my file <span aria-hidden>→</span>
            </button>
            <button
              type="button"
              onClick={() => setStep('done')}
              className="min-h-[48px] px-5 small-caps text-muted border border-rule hover:text-ink hover:border-ink/40 transition-colors"
            >
              Skip
            </button>
          </div>
          {!apiWaitlist && (
            <a
              href={substackHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center min-h-[48px] small-caps text-[10px] text-ink underline underline-offset-4"
            >
              Substack didn&rsquo;t open? Confirm your subscription →
            </a>
          )}
          <p className="text-[11px] text-whisper leading-snug">ZIP tells us where our readers are.</p>
          {privacy}
        </form>
      </FileCard>
    );
  }

  // ── Step 1: name + email ──────────────────────────────────────────────────
  return (
    <FileCard id={anchorId} title={title} status="Step 1" className={className}>
      <form onSubmit={handleStart} className="space-y-4" noValidate>
        {/* Honeypot: offscreen, not tabbable, ignored by real users; bots fill it and are dropped server-side. */}
        <input
          ref={hpRef}
          type="text"
          name="hp"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1, opacity: 0 }}
        />
        <p className="text-sm text-muted leading-relaxed">
          {apiWaitlist
            ? 'Early access to the measured signal behind every campaign. We\u2019ll email you when it opens.'
            : 'New campaigns as they are measured, each with its date.'}
        </p>
        <div className={`grid gap-4 ${two ? 'sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]' : ''}`}>
          <Field n="01" label="First name" htmlFor={ids.first}>
            <input
              id={ids.first}
              type="text"
              name="given-name"
              required
              autoComplete="given-name"
              maxLength={60}
              placeholder="First name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              {...invalid('first')}
              className={INPUT}
            />
          </Field>
          <Field n="02" label="Email" htmlFor={ids.email}>
            <input
              id={ids.email}
              type="email"
              name="email"
              required
              autoComplete="email"
              inputMode="email"
              placeholder="you@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              {...invalid('email')}
              className={INPUT}
            />
          </Field>
        </div>
        {errorLine}
        <button type="submit" className={`${BUTTON} w-full`}>
          {submitLabel} <span aria-hidden>→</span>
        </button>
        {footnote && <p className="small-caps text-whisper text-[10px]">{footnote}</p>}
        {privacy}
      </form>
    </FileCard>
  );
}
