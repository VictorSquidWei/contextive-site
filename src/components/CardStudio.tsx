import { useEffect, useMemo, useRef, useState } from 'react';
import type { DemoTerm } from '../data/apiDemo';
import { FIREWALL } from '../data/campaign';
import { THEMES, DEFAULT_THEME, velocityCardSVG, themeFromBackground } from '../lib/velocityCard';
import type { CardTheme, VelocityCardData } from '../lib/velocityCard';

/* Card Studio — customize a measured term's Velocity Card (background theme) with a live preview,
   then download the customized PNG or share. The card itself is rendered from the SAME shared
   builder the static generator uses (src/lib/velocityCard.js), so preview == download == the
   on-brand card. Backgrounds are a curated, brand-safe set (neutral lights/warms/darks — no
   red/blue partisan palette). Every number is the measured reading; nothing invented. */

const SITE_ORIGIN = 'https://contextive.info';
const X_HANDLE = '@contextive_ai';

const cardPath = (t: DemoTerm) => `/cards/c${t.campaign}-${t.slug}.png`;
const fmtSignedPct = (n: number | null): string =>
  n == null ? '—' : `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n)}%`;

function toData(t: DemoTerm): VelocityCardData {
  return {
    term: t.term,
    domainTag: t.domain,
    velocityIndex: t.velocityIndex,
    adoptionStage: t.adoptionStage,
    d30: t.deltas.d30, d90: t.deltas.d90, yoy: t.deltas.yoy,
    sentiment: t.sentiment,
    inflection: t.inflections?.[0]?.date ?? 'n/a',
    coOccurrence: t.coOccurrence,
    campaignNumber: t.campaign,
    campaignShort: t.campaignTitle,
    firewall: FIREWALL,
  };
}

function tweetText(t: DemoTerm): string {
  const v = t.velocityIndex == null ? '—' : `${t.velocityIndex}/100`;
  return `"${t.term}" — velocity ${v}, ${fmtSignedPct(t.deltas.d90)} / 90d. Velocity, not verdict. via ${X_HANDLE}`;
}

const btn =
  'group inline-flex items-center gap-1.5 small-caps text-[10px] px-2.5 py-1.5 border border-rule ' +
  'text-muted hover:border-ink hover:text-ink transition-colors min-w-0 whitespace-nowrap';

const swatchCls = (sel: boolean) =>
  `h-6 w-6 rounded-full border transition-transform ${sel ? 'ring-2 ring-ink ring-offset-1 ring-offset-paper scale-110 border-ink' : 'border-rule hover:scale-105'}`;

export function CardStudio({ term }: { term: DemoTerm }) {
  const [theme, setTheme] = useState<CardTheme>(DEFAULT_THEME);
  const [customColor, setCustomColor] = useState('#2A2A28');
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const data = useMemo(() => toData(term), [term]);
  // Responsive preview (inline in the document, so it uses the real brand webfonts).
  const previewSvg = useMemo(
    () => velocityCardSVG(data, theme, { width: '100%', height: 'auto', style: 'display:block;width:100%;height:auto' }),
    [data, theme],
  );

  const relPath = cardPath(term);
  const absUrl = `${SITE_ORIGIN}${relPath}`;
  const shareX =
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText(term))}&url=${encodeURIComponent(absUrl)}`;

  useEffect(() => {
    setCopied(false);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [term.slug]);

  // Rasterize the customized card to a 1080x1080 PNG entirely client-side.
  function downloadPng() {
    setBusy(true);
    const svg = velocityCardSVG(data, theme, { width: 1080, height: 1080 });
    const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }));
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1080; canvas.height = 1080;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = theme.bg;
        ctx.fillRect(0, 0, 1080, 1080);
        ctx.drawImage(img, 0, 0, 1080, 1080);
      }
      URL.revokeObjectURL(url);
      canvas.toBlob((b) => {
        setBusy(false);
        if (!b) return;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = `contextive-${term.slug}-${theme.id}.png`;
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }, 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); setBusy(false); window.open(relPath, '_blank'); };
    img.src = url;
  }

  async function copyLink() {
    let ok = false;
    try {
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(absUrl); ok = true; }
    } catch { ok = false; }
    if (!ok) {
      try {
        const ta = document.createElement('textarea');
        ta.value = absUrl; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select(); ok = document.execCommand('copy'); document.body.removeChild(ta);
      } catch { ok = false; }
    }
    if (ok) {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 1800);
    }
  }

  return (
    <div className="mt-px bg-paper border-x border-b border-rule px-4 py-4 min-w-0">
      <div className="small-caps text-whisper text-[9px] mb-3">Customize &amp; share the card</div>

      {/* live preview — scales with the column, uses the real brand fonts */}
      <div className="mx-auto w-full max-w-[360px] border border-rule" aria-label={`Velocity card preview for ${term.term}`}>
        <div className="aspect-square w-full" dangerouslySetInnerHTML={{ __html: previewSvg }} />
      </div>

      {/* background swatches */}
      <div className="mt-3 flex flex-wrap items-center gap-2 min-w-0">
        <span className="small-caps text-whisper text-[9px] shrink-0">Background</span>
        {THEMES.map((t) => {
          const sel = t.id === theme.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t)}
              title={t.label}
              aria-label={`${t.label} background`}
              aria-pressed={sel}
              className={swatchCls(sel)}
              style={{ backgroundColor: t.bg }}
            />
          );
        })}
        {/* custom color — any background, text auto-contrasts to stay legible */}
        <label
          title="Custom color"
          className={`relative cursor-pointer ${swatchCls(theme.id === 'custom')}`}
          style={{ backgroundColor: customColor }}
        >
          <input
            type="color"
            value={customColor}
            onChange={(e) => { setCustomColor(e.target.value); setTheme(themeFromBackground(e.target.value)); }}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Custom background color"
          />
          <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center text-[11px] font-bold leading-none"
            style={{ color: themeFromBackground(customColor).fg }}>+</span>
        </label>
      </div>

      {/* actions */}
      <div className="mt-3 flex flex-wrap items-center gap-1.5 min-w-0">
        <button type="button" onClick={downloadPng} disabled={busy} className={btn} title="Download this Velocity Card (PNG)">
          <span>{busy ? 'Rendering…' : 'Download'}</span>
        </button>
        <a href={shareX} target="_blank" rel="noopener noreferrer" className={btn} title="Share to X">
          <span>Share to X</span>
        </a>
        <button type="button" onClick={downloadPng} disabled={busy} className={btn} title="Download, then post to Instagram">
          <span>Instagram</span>
        </button>
        <button type="button" onClick={copyLink} className={btn} aria-live="polite" title="Copy link to this card">
          <span>{copied ? 'Copied' : 'Copy link'}</span>
        </button>
      </div>
      <p className="mt-2 text-whisper text-[10px] leading-snug">
        Download exports your chosen background. Share and copy use the standard card.
      </p>
    </div>
  );
}
