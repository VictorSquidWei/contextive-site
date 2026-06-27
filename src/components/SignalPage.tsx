import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { API_DEMO_TERMS, type DemoTerm } from '../data/apiDemo';
import { FIREWALL, campaignPath } from '../data/campaign';
import { getCampaign } from '../data/campaigns';
import { CardStudio } from './CardStudio';

/* Per-term "Velocity report" landing page at /signal/:slug.
   Gives each measured term an indexable home: the heading treatment, the shared
   Velocity Card (the static on-brand PNG), the Card Studio for customize/share, a
   compact measured readout, the firewall, and CTAs. All numbers are the measured
   reading from apiDemo.ts; an unknown slug renders an honest "not tracked yet"
   state and never invents data. */

const SITE_ORIGIN = 'https://contextive.info';
const DEFAULT_OG = `${SITE_ORIGIN}/og-image.png`;

const bySlug = (s: string | undefined): DemoTerm | undefined =>
  s ? API_DEMO_TERMS.find((t) => t.slug === s) : undefined;

const cardSrc = (t: DemoTerm) => `/cards/c${t.campaign}-${t.slug}.png`;
const cardAbs = (t: DemoTerm) => `${SITE_ORIGIN}${cardSrc(t)}`;

const fmtPct = (n: number | null | undefined): string =>
  n == null ? '—' : `${n > 0 ? '+' : n < 0 ? '−' : ''}${Math.abs(n)}%`;

const fmtVelocity = (n: number | null): string => (n == null ? '—' : `${n} / 100`);

/* Resolve the term's campaign sub-space route from its number (03 → /campaigns/03-bodies-and-food).
   Falls back to the homepage campaign index if the campaign isn't registered. */
function campaignHref(t: DemoTerm): string {
  const c = getCampaign(t.campaign);
  return c ? campaignPath(c) : '/#campaigns';
}
function campaignLabel(t: DemoTerm): string {
  const c = getCampaign(t.campaign);
  return c ? c.title : `Campaign ${t.campaign}`;
}

/* --- per-page SEO meta (no SSR): set on mount, restore the previous value on unmount --- */
function setMeta(
  selector: string,
  attr: 'content' | 'href',
  value: string,
  create: () => HTMLElement,
): () => void {
  let el = document.head.querySelector(selector) as HTMLElement | null;
  let created = false;
  if (!el) {
    el = create();
    document.head.appendChild(el);
    created = true;
  }
  const prev = el.getAttribute(attr);
  el.setAttribute(attr, value);
  return () => {
    if (!el) return;
    if (created) {
      el.remove();
    } else if (prev !== null) {
      el.setAttribute(attr, prev);
    }
  };
}

function useSignalSeo(t: DemoTerm | undefined, slug: string | undefined) {
  useEffect(() => {
    const title = t
      ? `"${t.term}" velocity — Contextive`
      : 'Term not tracked yet — Contextive';
    const description = t
      ? `Velocity report for "${t.term}": velocity ${fmtVelocity(t.velocityIndex)}, ` +
        `${fmtPct(t.deltas.d90)} over 90 days, adoption ${t.adoptionStage ?? 'pending'}. ` +
        `Measured signal — velocity, not verdict.`
      : 'This phrase is not yet under measurement on Contextive. Velocity, not verdict.';
    const canonical = `${SITE_ORIGIN}/signal/${slug ?? ''}`;
    const ogImage = t ? cardAbs(t) : DEFAULT_OG;

    const prevTitle = document.title;
    document.title = title;

    const restores = [
      () => {
        document.title = prevTitle;
      },
      setMeta('meta[name="description"]', 'content', description, () => {
        const m = document.createElement('meta');
        m.setAttribute('name', 'description');
        return m;
      }),
      setMeta('link[rel="canonical"]', 'href', canonical, () => {
        const l = document.createElement('link');
        l.setAttribute('rel', 'canonical');
        return l;
      }),
      setMeta('meta[property="og:title"]', 'content', title, () => {
        const m = document.createElement('meta');
        m.setAttribute('property', 'og:title');
        return m;
      }),
      setMeta('meta[property="og:description"]', 'content', description, () => {
        const m = document.createElement('meta');
        m.setAttribute('property', 'og:description');
        return m;
      }),
      setMeta('meta[property="og:image"]', 'content', ogImage, () => {
        const m = document.createElement('meta');
        m.setAttribute('property', 'og:image');
        return m;
      }),
      setMeta('meta[property="og:url"]', 'content', canonical, () => {
        const m = document.createElement('meta');
        m.setAttribute('property', 'og:url');
        return m;
      }),
      setMeta('meta[name="twitter:title"]', 'content', title, () => {
        const m = document.createElement('meta');
        m.setAttribute('name', 'twitter:title');
        return m;
      }),
      setMeta('meta[name="twitter:description"]', 'content', description, () => {
        const m = document.createElement('meta');
        m.setAttribute('name', 'twitter:description');
        return m;
      }),
      setMeta('meta[name="twitter:image"]', 'content', ogImage, () => {
        const m = document.createElement('meta');
        m.setAttribute('name', 'twitter:image');
        return m;
      }),
    ];

    return () => restores.forEach((r) => r());
  }, [t, slug]);
}

function Readout({ t }: { t: DemoTerm }) {
  const rows: [string, string][] = [
    ['Velocity index', fmtVelocity(t.velocityIndex)],
    ['Adoption stage', t.adoptionStage ?? '—'],
    ['30-day', fmtPct(t.deltas.d30)],
    ['90-day', fmtPct(t.deltas.d90)],
    ['1-year', fmtPct(t.deltas.yoy)],
    ['Sentiment', t.sentiment == null ? '—' : t.sentiment.toFixed(2)],
    ['Last inflection', t.inflections?.[0]?.date ?? '—'],
  ];
  return (
    <div className="border border-rule bg-paper min-w-0">
      <div className="small-caps text-whisper text-[9px] px-4 pt-4">Measured readout</div>
      <dl className="px-4 py-3 space-y-2">
        {rows.map(([k, v]) => (
          <div
            key={k}
            className="flex items-baseline justify-between gap-4 border-b border-rule pb-1.5 last:border-0 last:pb-0"
          >
            <dt className="small-caps text-[10px] text-muted">{k}</dt>
            <dd className="font-mono text-xs text-ink tabular-nums text-right">{v}</dd>
          </div>
        ))}
      </dl>
      {t.coOccurrence.length > 0 && (
        <div className="px-4 pb-4 space-y-2">
          <div className="small-caps text-[10px] text-muted">Travels with</div>
          <div className="flex flex-wrap gap-1.5">
            {t.coOccurrence.map((c) => (
              <span key={c} className="small-caps text-[10px] text-muted border border-rule px-2 py-1">
                {c}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function NotTracked({ slug }: { slug: string | undefined }) {
  return (
    <main className="px-6 lg:px-12 py-16 lg:py-24">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/waitlist"
          className="small-caps text-muted hover:text-ink transition-colors inline-flex items-center gap-2"
        >
          <span aria-hidden>←</span> The Contextive API
        </Link>
        <div className="mt-8 small-caps text-muted">// Velocity report</div>
        <h1 className="font-display font-bold tracking-tight text-4xl sm:text-5xl leading-[0.98] mt-3 break-words">
          {slug ? `"${slug.replace(/-/g, ' ')}"` : 'Term'}
        </h1>
        <div className="mt-6 border border-dashed border-rule px-5 py-4 small-caps text-muted flex items-center gap-3">
          <span aria-hidden>◷</span>
          Not tracked yet — measurement pending
        </div>
        <p className="text-muted leading-relaxed mt-6 max-w-prose">
          This phrase is not yet under continuous measurement. Contextive reports only what the
          pipeline measures, never a guess — so there is no reading to show here. Request early
          access to the API and tell us the phrases you want tracked first.
        </p>
        <p className="font-display text-ink text-lg leading-snug mt-6 max-w-prose">
          &ldquo;{FIREWALL}&rdquo;
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            to="/waitlist"
            className="small-caps text-[11px] px-4 py-2.5 bg-ink text-paper border border-ink hover:opacity-80 transition-opacity"
          >
            Request a tracked term →
          </Link>
          <Link
            to="/#campaigns"
            className="small-caps text-[11px] px-4 py-2.5 border border-rule text-muted hover:border-ink hover:text-ink transition-colors"
          >
            Browse campaigns
          </Link>
        </div>
      </div>
    </main>
  );
}

export function SignalPage() {
  const { slug } = useParams();
  const t = bySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useSignalSeo(t, slug);

  if (!t) return <NotTracked slug={slug} />;

  return (
    <main className="px-6 lg:px-12 py-12 lg:py-20">
      <div className="max-w-screen-xl mx-auto">
        {/* Back to the API product page */}
        <Link
          to="/waitlist"
          className="small-caps text-muted hover:text-ink transition-colors inline-flex items-center gap-2"
        >
          <span aria-hidden>←</span> The Contextive API
        </Link>

        {/* Heading treatment */}
        <header className="mt-8 max-w-3xl">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 small-caps text-muted">
            <span className="inline-block w-2 h-2 bg-ink rotate-45" aria-hidden />
            <span className="text-ink">Velocity report</span>
            <span>{t.domain}</span>
            <Link to={campaignHref(t)} className="hover:text-ink transition-colors">
              C{t.campaign} · {t.campaignTitle}
            </Link>
          </div>
          <h1 className="font-display font-bold leading-[0.95] tracking-tight text-balance text-[2.75rem] sm:text-[3.5rem] lg:text-[4.5rem] mt-5 break-words">
            {t.term}
          </h1>
          <p className="text-base lg:text-lg text-muted max-w-[560px] leading-relaxed text-balance mt-5">
            How fast &ldquo;{t.term}&rdquo; is moving in the open news and media record: velocity{' '}
            {fmtVelocity(t.velocityIndex)}, {fmtPct(t.deltas.d90)} over 90 days, currently{' '}
            {t.adoptionStage ?? 'pending'}. Velocity, not verdict.
          </p>
        </header>

        {/* Card + readout */}
        <section className="mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* The shared Velocity Card — the static on-brand PNG (correct fonts) */}
          <div className="lg:col-span-6 min-w-0">
            <div className="mx-auto w-full max-w-[420px] border border-rule">
              <img
                src={cardSrc(t)}
                alt={`Velocity Card for "${t.term}" — velocity ${fmtVelocity(t.velocityIndex)}, ${fmtPct(t.deltas.d90)} over 90 days`}
                width={1080}
                height={1080}
                loading="eager"
                className="block w-full h-auto"
              />
            </div>
            {/* Card Studio — customize / share */}
            <div className="mx-auto w-full max-w-[420px] mt-px">
              <CardStudio term={t} />
            </div>
          </div>

          {/* Compact measured readout + methodology + CTA */}
          <div className="lg:col-span-6 min-w-0 space-y-8">
            <Readout t={t} />

            <div className="space-y-3">
              <div className="small-caps text-muted">// How this is measured</div>
              <p className="text-sm text-muted leading-relaxed max-w-prose">
                The reading is drawn from the open news and media record (GDELT). Velocity is a
                within-set percentile of recent coverage against its own baseline; momentum is the
                raw 30/90-day and year-over-year change; inflections are dated peaks in the smoothed
                series. Every figure is measured, never estimated. See{' '}
                <Link to="/how-it-works" className="text-ink underline underline-offset-4 hover:opacity-70">
                  how it works
                </Link>
                .
              </p>
              <p className="font-display text-ink text-lg leading-snug max-w-prose pt-1">
                &ldquo;{FIREWALL}&rdquo;
              </p>
            </div>

            <div className="border border-ink bg-canvas p-6 space-y-4">
              <div className="font-display font-bold text-xl text-ink">Track this phrase</div>
              <p className="text-sm text-muted leading-relaxed">
                Put &ldquo;{t.term}&rdquo; under continuous measurement with the Contextive API, or
                read it in context in {campaignLabel(t)}.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  to="/waitlist"
                  className="small-caps text-[11px] px-4 py-2.5 bg-ink text-paper border border-ink hover:opacity-80 transition-opacity"
                >
                  Get the API →
                </Link>
                <Link
                  to={campaignHref(t)}
                  className="small-caps text-[11px] px-4 py-2.5 border border-rule text-muted hover:border-ink hover:text-ink transition-colors"
                >
                  See the campaign
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
