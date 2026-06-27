import { useEffect, useRef, useState } from 'react';
import type { DemoTerm } from '../data/apiDemo';

/* Share affordance for a measured term's Velocity Card.
   Monochrome / typographic, matches the Signal Explorer house style. Three actions:
     • Download card  — <a download> the pre-rendered PNG (the Instagram path: IG has no
                        web post-intent, so the user downloads then uploads manually).
     • Share to X     — opens a twitter.com/intent/tweet with measured velocity + the firewall
                        spirit (velocity, not verdict; no verdict language).
     • Copy link      — copies the absolute card URL to the clipboard with a brief confirmation.
   All numbers come from the measured DemoTerm; nothing is invented. The card itself is a
   pre-rendered static asset at /cards/c<campaign>-<slug>.png — consumed here, never generated. */

const SITE_ORIGIN = 'https://contextive.info';
const X_HANDLE = '@contextive_ai';

// term → card asset. The pre-rendered PNGs are named c<campaign>-<slug>.png and the
// DemoTerm.slug already matches that slug exactly (verified against public/cards).
function cardPath(t: DemoTerm): string {
  return `/cards/c${t.campaign}-${t.slug}.png`;
}

const fmtSignedPct = (n: number | null): string =>
  n == null ? '—' : `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n)}%`;

// X intent copy: states the measured reading, keeps the firewall spirit (velocity, not verdict).
function tweetText(t: DemoTerm): string {
  const v = t.velocityIndex == null ? '—' : `${t.velocityIndex}/100`;
  const d90 = fmtSignedPct(t.deltas.d90);
  return `"${t.term}" — velocity ${v}, ${d90} / 90d. Velocity, not verdict. via ${X_HANDLE}`;
}

function IconDownload() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M8 2v8m0 0L5 7m3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2.5 11.5v1A1.5 1.5 0 0 0 4 14h8a1.5 1.5 0 0 0 1.5-1.5v-1" strokeLinecap="round" />
    </svg>
  );
}

function IconX() {
  // The X (Twitter) glyph.
  return (
    <svg viewBox="0 0 16 16" className="h-3 w-3 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M9.94 6.77 14.3 2h-1.5L9.27 5.86 6.45 2H2l4.57 6.41L2 13.5h1.5l3.74-4.07L10.2 13.5H14L9.94 6.77Zm-1.32 1.44-.43-.6L4.04 3.1h1.6l2.78 3.87.43.6 3.62 5.03h-1.6L8.62 8.21Z" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      <rect x="2.25" y="2.25" width="11.5" height="11.5" rx="3.25" />
      <circle cx="8" cy="8" r="2.6" />
      <circle cx="11.2" cy="4.8" r="0.7" fill="currentColor" stroke="none" />
    </svg>
  );
}

function IconLink({ copied }: { copied: boolean }) {
  if (copied) {
    return (
      <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
        <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 16 16" className="h-3.5 w-3.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
      <path d="M6.5 9.5a2.5 2.5 0 0 0 3.6.1l2-2a2.5 2.5 0 1 0-3.5-3.6l-1 1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 6.5a2.5 2.5 0 0 0-3.6-.1l-2 2a2.5 2.5 0 1 0 3.5 3.6l1-1" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Shared visual: monochrome bordered button, JetBrains-Mono label, no color.
const btn =
  'group inline-flex items-center gap-1.5 small-caps text-[10px] px-2.5 py-1.5 border border-rule ' +
  'text-muted hover:border-ink hover:text-ink transition-colors min-w-0 whitespace-nowrap';

export function ShareCard({ term }: { term: DemoTerm }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const relPath = cardPath(term);
  const absUrl = `${SITE_ORIGIN}${relPath}`;
  const downloadName = `contextive-${term.slug}.png`;

  // Reset the "copied" confirmation when the selected term changes.
  useEffect(() => {
    setCopied(false);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [term.slug]);

  const shareX =
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText(term))}` +
    `&url=${encodeURIComponent(absUrl)}`;

  async function copyLink() {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(absUrl);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      // Fallback for browsers without the async clipboard API.
      try {
        const ta = document.createElement('textarea');
        ta.value = absUrl;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand('copy');
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div className="mt-px bg-paper border-x border-b border-rule px-4 py-3 min-w-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 min-w-0">
        <span className="small-caps text-whisper text-[9px] shrink-0">Share the card</span>

        <div className="flex flex-wrap items-center gap-1.5 min-w-0">
          {/* 1 — Download the pre-rendered PNG. */}
          <a
            href={relPath}
            download={downloadName}
            className={btn}
            title="Download this Velocity Card (PNG)"
          >
            <IconDownload />
            <span>Download</span>
          </a>

          {/* 2 — Share to X via the tweet intent. */}
          <a
            href={shareX}
            target="_blank"
            rel="noopener noreferrer"
            className={btn}
            title="Share to X"
          >
            <IconX />
            <span>Share to X</span>
          </a>

          {/* Instagram — honest about the web limitation: same download, no fake post-intent. */}
          <a
            href={relPath}
            download={downloadName}
            className={btn}
            title="Download, then post to Instagram"
          >
            <IconInstagram />
            <span>Instagram</span>
          </a>

          {/* 3 — Copy the absolute card URL. */}
          <button
            type="button"
            onClick={copyLink}
            className={btn}
            aria-live="polite"
            title="Copy link to this card"
          >
            <IconLink copied={copied} />
            <span>{copied ? 'Copied' : 'Copy link'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
