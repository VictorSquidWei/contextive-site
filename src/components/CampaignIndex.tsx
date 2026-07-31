import { Link } from 'react-router-dom';
import { ALL_CAMPAIGNS } from '../data/campaigns';
import { campaignPath, measuredCount } from '../data/campaign';
import { readerHook, FEATURED_CAMPAIGN_IDS } from '../data/readerHooks';
import type { Campaign } from '../data/campaign';

function FeaturedCard({ c }: { c: Campaign }) {
  const { measured, total } = measuredCount(c);
  const hook = readerHook(c.id);
  return (
    <Link
      to={campaignPath(c)}
      className="group bg-canvas border border-rule p-7 lg:p-8 flex flex-col gap-4 hover:bg-ink hover:text-paper transition-colors min-w-0"
    >
      <div className="flex items-center justify-between small-caps text-muted group-hover:text-paper/60">
        <span>{c.label}</span>
        <span>{c.shortTitle}</span>
      </div>
      <p className="font-display font-bold text-2xl lg:text-[1.7rem] leading-[1.08] tracking-tight text-balance">
        {hook || c.title}
      </p>
      <div className="mt-auto pt-4 border-t border-rule group-hover:border-paper/20 flex items-center justify-between small-caps">
        <span className="text-muted group-hover:text-paper/60">{measured} / {total} measured</span>
        <span className="inline-flex items-center gap-2">
          See who is winning <span aria-hidden>→</span>
        </span>
      </div>
    </Link>
  );
}

function RowCard({ c }: { c: Campaign }) {
  const { measured, total } = measuredCount(c);
  const hook = readerHook(c.id);
  return (
    <Link
      to={campaignPath(c)}
      className="group bg-paper p-6 lg:p-7 flex items-start gap-5 hover:bg-ink hover:text-paper transition-colors min-w-0"
    >
      <span className="font-display font-bold text-3xl lg:text-4xl leading-none opacity-80 shrink-0 w-12">
        {c.number}
      </span>
      <span className="min-w-0 flex-1 space-y-1.5">
        <span className="block font-display font-bold text-lg lg:text-xl leading-tight tracking-tight text-balance">
          {hook || c.title}
        </span>
        <span className="small-caps text-muted group-hover:text-paper/60 flex flex-wrap gap-x-3">
          <span>{c.shortTitle}</span>
          <span>{measured} / {total} measured</span>
        </span>
      </span>
      <span className="shrink-0 text-muted group-hover:text-paper/70 pt-1" aria-hidden>→</span>
    </Link>
  );
}

export function CampaignIndex() {
  const featured = FEATURED_CAMPAIGN_IDS.map((id) => ALL_CAMPAIGNS.find((c) => c.id === id)).filter(
    (c): c is Campaign => !!c
  );
  const featuredIds = new Set(featured.map((c) => c.id));
  const rest = ALL_CAMPAIGNS.filter((c) => !featuredIds.has(c.id));

  return (
    <section id="campaigns" className="px-6 lg:px-12 py-14 lg:py-20 bg-paper">
      <div className="max-w-screen-xl mx-auto">
        <div className="mb-10 lg:mb-14">
          <span className="small-caps text-muted">// Ten vocabulary wars</span>
          <h2 className="font-display font-bold tracking-tight text-4xl lg:text-5xl mt-6 leading-[1.0] text-balance max-w-3xl">
            Same event, different words. Which one is winning?
          </h2>
          <p className="text-muted mt-5 max-w-2xl leading-relaxed">
            Ten fights over what to call the news, tracked by how fast each word is gaining ground.
            Measured against open coverage data, never estimated.
          </p>
        </div>

        {/* Featured */}
        {featured.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {featured.map((c) => (
              <FeaturedCard key={c.id} c={c} />
            ))}
          </div>
        )}

        {/* The rest */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-rule border border-rule">
          {rest.map((c) => (
            <RowCard key={c.id} c={c} />
          ))}
        </div>
      </div>
    </section>
  );
}
