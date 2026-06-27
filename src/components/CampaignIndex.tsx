import { Link } from 'react-router-dom';
import { ALL_CAMPAIGNS } from '../data/campaigns';
import { campaignPath, measuredCount } from '../data/campaign';

export function CampaignIndex() {
  return (
    <section id="campaigns" className="px-6 lg:px-12 py-14 lg:py-20 bg-paper">
      <div className="max-w-screen-xl mx-auto">
        <div className="mb-12 lg:mb-16">
          <span className="small-caps text-muted">// Campaigns</span>
          <h2 className="font-display font-bold tracking-tight text-4xl lg:text-5xl mt-6 leading-[1.0] text-balance max-w-3xl">
            One vocabulary war per cycle.
          </h2>
          <p className="text-muted mt-6 max-w-2xl leading-relaxed">
            Each campaign maps how a single moment gets named in incompatible ways, tracked by how
            fast each name is winning, measured against open coverage data, not estimated.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-rule border border-rule">
          {ALL_CAMPAIGNS.map((c) => {
            const { measured, total } = measuredCount(c);
            return (
              <Link
                key={c.id}
                to={campaignPath(c)}
                className="group bg-paper p-8 lg:p-10 flex flex-col gap-5 hover:bg-ink hover:text-paper transition-colors"
              >
                <div className="flex items-start justify-between">
                  <span className="font-display font-bold text-5xl lg:text-6xl leading-none opacity-90">
                    {c.number}
                  </span>
                  <span className="small-caps text-muted group-hover:text-paper/60">{c.period}</span>
                </div>
                <div className="space-y-2">
                  <div className="small-caps text-muted group-hover:text-paper/60">{c.label}</div>
                  <h3 className="font-display font-bold text-2xl lg:text-3xl leading-[1.05] tracking-tight text-balance">
                    {c.title}
                  </h3>
                </div>
                {c.summary && (
                  <p className="text-sm text-muted group-hover:text-paper/70 leading-relaxed line-clamp-3">
                    {c.summary}
                  </p>
                )}
                <div className="mt-auto pt-4 border-t border-rule group-hover:border-paper/20 flex items-center justify-between small-caps">
                  <span className="text-muted group-hover:text-paper/60">
                    {c.signalBasis === 'measured' ? `${measured} / ${total} measured` : `${total} terms`}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    {c.status === 'in-progress' ? 'In progress' : 'View'}
                    <span aria-hidden>→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
