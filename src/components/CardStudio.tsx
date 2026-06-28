import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { DemoTerm } from '../data/apiDemo';
import { FIREWALL } from '../data/campaign';
import { THEMES, DEFAULT_THEME, velocityCardSVG, themeFromBackground } from '../lib/velocityCard';
import type { CardTheme, VelocityCardData } from '../lib/velocityCard';

/* Card Studio — the share-first "stage" for a measured term's Velocity Card. Left: the real
   shareable card (rendered from the SAME builder the static generator uses, so preview ==
   download). Right: a compact live reading (credibility) + background customization + the share
   actions. Backgrounds are a curated, brand-safe set plus an auto-contrast custom color. Every
   number is the measured reading; nothing invented; the firewall is baked into the card. */

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

// The on-brand caption people paste with the card (X intent + Copy caption).
function caption(t: DemoTerm): string {
  const v = t.velocityIndex == null ? '—' : `${t.velocityIndex}/100`;
  return `"${t.term}" — velocity ${v}, ${fmtSignedPct(t.deltas.d90)} / 90d. Velocity, not verdict. via ${X_HANDLE}`;
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(text); return true; }
  } catch { /* fall through */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy'); document.body.removeChild(ta);
    return ok;
  } catch { return false; }
}

const swatchCls = (sel: boolean) =>
  `h-6 w-6 rounded-full border transition-transform ${sel ? 'ring-2 ring-ink ring-offset-1 ring-offset-paper scale-110 border-ink' : 'border-rule hover:scale-105'}`;
const btnPrimary =
  'inline-flex items-center justify-center gap-1.5 small-caps text-[11px] px-3.5 py-2.5 bg-ink text-paper border border-ink hover:opacity-90 transition disabled:opacity-50';
const btnGhost =
  'inline-flex items-center justify-center gap-1.5 small-caps text-[11px] px-3.5 py-2.5 border border-rule text-muted hover:border-ink hover:text-ink transition';

// Animated reading bar (a touch of "watch it move" on term/value change).
function ReadBar({ value }: { value: number | null }) {
  const [w, setW] = useState(0);
  useEffect(() => { const id = requestAnimationFrame(() => setW(value ?? 0)); return () => cancelAnimationFrame(id); }, [value]);
  return (
    <div className="h-1.5 w-full bg-rule">
      <div className="h-full bg-ink transition-[width] duration-700 ease-out" style={{ width: `${w}%` }} />
    </div>
  );
}

export function CardStudio({ term }: { term: DemoTerm }) {
  const [theme, setTheme] = useState<CardTheme>(DEFAULT_THEME);
  const [customColor, setCustomColor] = useState('#2A2A28');
  const [copied, setCopied] = useState<'' | 'link' | 'caption'>('');
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const data = useMemo(() => toData(term), [term]);
  const previewSvg = useMemo(
    () => velocityCardSVG(data, theme, { width: '100%', height: 'auto', style: 'display:block;width:100%;height:auto' }),
    [data, theme],
  );

  const relPath = cardPath(term);
  const absUrl = `${SITE_ORIGIN}${relPath}`;
  const shareX =
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(caption(term))}&url=${encodeURIComponent(absUrl)}`;

  useEffect(() => {
    setCopied('');
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [term.slug]);

  function flash(which: 'link' | 'caption') {
    setCopied(which);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(''), 1800);
  }

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
      if (ctx) { ctx.fillStyle = theme.bg; ctx.fillRect(0, 0, 1080, 1080); ctx.drawImage(img, 0, 0, 1080, 1080); }
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

  const tone = term.sentiment == null ? '—' : term.sentiment.toFixed(1);

  return (
    <div className="border border-rule bg-paper grid grid-cols-1 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
      {/* HERO — the shareable card */}
      <div className="p-5 sm:p-7 flex flex-col items-center gap-4 border-b lg:border-b-0 lg:border-r border-rule min-w-0">
        <div className="w-full max-w-[440px] border border-rule shadow-sm" aria-label={`Velocity card preview for ${term.term}`}>
          <div className="aspect-square w-full" dangerouslySetInnerHTML={{ __html: previewSvg }} />
        </div>
        <Link to={`/signal/${term.slug}`} className="small-caps text-[10px] text-muted hover:text-ink transition-colors">
          Open full report ↗
        </Link>
      </div>

      {/* RAIL — reading + customize + share */}
      <div className="p-5 sm:p-7 flex flex-col gap-5 min-w-0">
        <div>
          <div className="small-caps text-muted text-[10px]">// Share the signal</div>
          <h3 className="font-display font-bold text-xl sm:text-2xl text-ink leading-tight mt-1">Make it yours, then post it.</h3>
        </div>

        {/* compact live reading */}
        <div className="space-y-2.5">
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <div className="small-caps text-whisper text-[9px]">Velocity index</div>
              <div className="font-display font-bold text-4xl text-ink tabular-nums leading-none">
                {term.velocityIndex ?? '—'}<span className="text-base text-muted font-medium"> /100</span>
              </div>
            </div>
            <span className="small-caps text-[10px] text-muted border border-rule px-2 py-1 shrink-0 whitespace-nowrap">{term.adoptionStage ?? '—'}</span>
          </div>
          <ReadBar value={term.velocityIndex} />
          <div className="grid grid-cols-3 gap-px bg-rule border border-rule text-center">
            {[['90d', fmtSignedPct(term.deltas.d90)], ['1y', fmtSignedPct(term.deltas.yoy)], ['Tone', tone]].map(([k, v]) => (
              <div key={k} className="bg-paper py-2">
                <div className="small-caps text-whisper text-[9px]">{k}</div>
                <div className="font-mono text-xs text-ink mt-0.5">{v}</div>
              </div>
            ))}
          </div>
        </div>

        {/* background customization */}
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="small-caps text-whisper text-[9px] shrink-0">Background</span>
          {THEMES.map((t) => (
            <button
              key={t.id} type="button" onClick={() => setTheme(t)}
              title={t.label} aria-label={`${t.label} background`} aria-pressed={t.id === theme.id}
              className={swatchCls(t.id === theme.id)} style={{ backgroundColor: t.bg }}
            />
          ))}
          <label title="Custom color" className={`relative cursor-pointer ${swatchCls(theme.id === 'custom')}`} style={{ backgroundColor: customColor }}>
            <input
              type="color" value={customColor}
              onChange={(e) => { setCustomColor(e.target.value); setTheme(themeFromBackground(e.target.value)); }}
              className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label="Custom background color"
            />
            <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center text-[11px] font-bold leading-none" style={{ color: themeFromBackground(customColor).fg }}>+</span>
          </label>
        </div>

        {/* share actions */}
        <div className="grid grid-cols-2 gap-2">
          <button type="button" onClick={downloadPng} disabled={busy} className={btnPrimary} title="Download this Velocity Card (PNG)">
            {busy ? 'Rendering…' : 'Download card'}
          </button>
          <a href={shareX} target="_blank" rel="noopener noreferrer" className={btnPrimary} title="Share to X">Share to X</a>
          <button type="button" onClick={downloadPng} disabled={busy} className={btnGhost} title="Download, then post to Instagram">Instagram</button>
          <button type="button" onClick={async () => { if (await copyText(absUrl)) flash('link'); }} className={btnGhost} title="Copy link to this card">
            {copied === 'link' ? 'Link copied' : 'Copy link'}
          </button>
          <button type="button" onClick={async () => { if (await copyText(caption(term))) flash('caption'); }} className={`${btnGhost} col-span-2`} title="Copy the caption to paste with the card">
            {copied === 'caption' ? 'Caption copied' : 'Copy caption'}
          </button>
        </div>

        <p className="text-whisper text-[10px] leading-snug">
          Download exports your chosen background. Instagram has no web post, so download then upload. Share and copy use the standard card.
        </p>
      </div>
    </div>
  );
}
