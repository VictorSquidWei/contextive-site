import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getCampaignById } from '../data/campaigns';
import { TermLeaderboard } from './TermLeaderboard';
import { plainRead, humanPct, findTerm, tensionCaption } from '../lib/readSignal';
import { readerHook, HERO_CAPTIONS } from '../data/readerHooks';
import { FreshnessBadge } from './FreshnessBadge';
import type { Campaign, CampaignTerm } from '../data/campaign';

/** One pole of the defining tension, with its measured read looked up from the terms. */
function TensionPole({ c, name }: { c: Campaign; name: string }) {
  const term = findTerm(c, name);
  const read = term ? plainRead(term) : undefined;
  return (
    <div className="flex-1 min-w-0 space-y-2">
      <div className="font-display font-bold uppercase leading-[0.95] tracking-tight text-xl sm:text-2xl lg:text-3xl text-balance">
        {name}
      </div>
      {term && read && !read.pending ? (
        <div className="space-y-1">
          <span className="small-caps text-[11px] px-2 py-0.5 border border-ink/25 inline-block">
            {read.chip}
          </span>
          <div className="font-mono text-sm text-muted tabular-nums">
            {term.measurement.velocityIndex ?? '—'} / 100 · {humanPct(term.measurement.deltas?.d90)} in 90 days
          </div>
        </div>
      ) : (
        <div className="small-caps text-muted text-[11px]">the counter-word</div>
      )}
    </div>
  );
}

function HeroTension({ c }: { c: Campaign }) {
  const dt = c.definingTension;
  if (!dt) return null;

  // The two-pole duel only makes sense when both poles are real terms we can read.
  // Some campaigns phrase the tension as prose ("X: velocity vs verdict"); for those
  // we show a clean callout with the authored note instead of signal-less headings.
  const bothResolve = !!findTerm(c, dt.a) && !!findTerm(c, dt.b);
  if (!bothResolve) {
    return (
      <div className="border border-ink/15 bg-canvas p-6 sm:p-8 space-y-3">
        <div className="small-caps text-muted">The defining tension</div>
        {dt.note && <p className="text-base sm:text-lg leading-relaxed text-balance">{dt.note}</p>}
      </div>
    );
  }

  const caption = HERO_CAPTIONS[c.id] || tensionCaption(c) || dt.note;
  return (
    <div className="border border-ink/15 bg-canvas p-6 sm:p-8 space-y-5">
      <div className="small-caps text-muted">The word that is winning</div>
      <div className="flex flex-col sm:flex-row items-start gap-5 sm:gap-4">
        <TensionPole c={c} name={dt.a} />
        <div className="shrink-0 self-center small-caps text-muted py-1">vs</div>
        <TensionPole c={c} name={dt.b} />
      </div>
      {caption && (
        <p className="text-sm sm:text-base leading-relaxed text-balance line-clamp-3">{caption}</p>
      )}
    </div>
  );
}

type Tab = { key: string; label: string; terms: CampaignTerm[]; blurb?: string };

export function CampaignPage() {
  const { id } = useParams();
  const c = id ? getCampaignById(id) : undefined;
  const [tab, setTab] = useState('top');

  useEffect(() => {
    window.scrollTo(0, 0);
    setTab('top');
  }, [id]);

  if (!c) return <Navigate to="/" replace />;

  const measured = c.terms.filter((t) => t.measurement.status !== 'pending').length;
  const clusters = c.clusters ?? [];
  const tabs: Tab[] = [
    { key: 'top', label: 'Top movers', terms: c.terms },
    ...clusters.map((cl) => ({
      key: cl.key,
      label: cl.name,
      blurb: cl.blurb,
      terms: c.terms.filter((t) => t.cluster === cl.key),
    })),
  ];
  const active = tabs.find((t) => t.key === tab) ?? tabs[0];

  return (
    <main className="bg-paper text-ink">
      {/* Light header */}
      <section className="px-6 lg:px-12 pt-8 lg:pt-12 pb-8 border-b border-rule">
        <div className="max-w-screen-lg mx-auto space-y-5">
          <Link
            to="/"
            className="small-caps text-muted hover:text-ink transition-colors inline-flex items-center gap-2"
          >
            <span aria-hidden>←</span> All campaigns
          </Link>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 small-caps text-muted">
            <span className="text-ink">{c.label}</span>
            <span>{c.period}</span>
            <span>
              {measured} of {c.terms.length} words measured
            </span>
            <FreshnessBadge campaign={c} />
          </div>

          <h1 className="font-display font-bold tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[0.98] text-balance">
            {c.title}
          </h1>
          {readerHook(c.id) && (
            <p className="font-display text-lg sm:text-xl leading-snug max-w-2xl text-balance">
              {readerHook(c.id)}
            </p>
          )}
        </div>
      </section>

      {/* Hero tension + how-to-read */}
      <section className="px-6 lg:px-12 pt-8 lg:pt-10">
        <div className="max-w-screen-lg mx-auto">
          <HeroTension c={c} />
        </div>
      </section>

      {/* Cluster tabs + leaderboard */}
      <section className="px-6 lg:px-12 py-8 lg:py-10">
        <div className="max-w-screen-lg mx-auto space-y-5">
          {/* Group filter (plain toggle buttons — a filter, not a tab widget) */}
          <div className="flex gap-1 overflow-x-auto -mx-1 px-1 pb-1" role="group" aria-label="Filter words by group">
            {tabs.map((t) => (
              <button
                key={t.key}
                type="button"
                aria-pressed={t.key === tab}
                onClick={() => setTab(t.key)}
                className={`shrink-0 whitespace-nowrap small-caps px-4 py-2 border transition-colors ${
                  t.key === tab
                    ? 'bg-ink text-paper border-ink'
                    : 'bg-canvas text-muted border-rule hover:text-ink hover:border-ink/40'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {active.blurb && (
            <p className="text-sm text-muted leading-relaxed max-w-2xl">{active.blurb}</p>
          )}

          <p className="small-caps text-muted text-[11px] leading-relaxed">
            Ranked by how fast each word is gaining ground in the news. Tap a word for detail. We track
            how the words move, not who is right.
          </p>

          <TermLeaderboard terms={active.terms} campaignId={c.id} />

          {/* Full readout CTA */}
          <div className="pt-2">
            <Link
              to={`/campaigns/${c.id}/readout`}
              className="inline-flex items-center gap-2 border border-ink px-5 py-3 small-caps hover:bg-ink hover:text-paper transition-colors"
            >
              View the full readout <span aria-hidden>→</span>
            </Link>
            <p className="small-caps text-muted text-[11px] mt-3">
              Every word, every signal field, the methodology and the sourcing.
            </p>
          </div>
        </div>
      </section>

      {/* Firewall — demoted to a slim line */}
      <section className="px-6 lg:px-12 py-8 border-t border-rule bg-canvas">
        <div className="max-w-screen-lg mx-auto border-l-2 border-ink pl-4">
          <div className="small-caps text-ink/40 mb-1">Firewall</div>
          <p className="font-display text-sm sm:text-base leading-snug max-w-2xl">{c.firewall}</p>
        </div>
      </section>
    </main>
  );
}
