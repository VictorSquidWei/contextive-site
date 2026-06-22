import { useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { getCampaignById } from '../data/campaigns';
import { SignalCard } from './SignalCard';
import type { CampaignTerm } from '../data/campaign';

function TermGrid({ terms }: { terms: CampaignTerm[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {terms.map((t) => (
        <SignalCard key={t.ref || t.term} term={t} />
      ))}
    </div>
  );
}

export function CampaignPage() {
  const { id } = useParams();
  const c = id ? getCampaignById(id) : undefined;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  if (!c) return <Navigate to="/" replace />;

  const hasClusters = !!c.clusters && c.clusters.length > 0;
  const byCluster = (key: string) => c.terms.filter((t) => t.cluster === key);

  return (
    <main className="bg-paper text-ink">
      {/* Header */}
      <section className="px-6 lg:px-12 pt-10 lg:pt-14 pb-12 border-b border-rule">
        <div className="max-w-screen-xl mx-auto">
          <Link
            to="/"
            className="small-caps text-muted hover:text-ink transition-colors inline-flex items-center gap-2"
          >
            <span aria-hidden>←</span> All campaigns
          </Link>

          <div className="mt-8 grid lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 small-caps text-muted">
                <span className="text-ink">{c.label}</span>
                <span>{c.period}</span>
                <span>{c.signalBasis === 'measured' ? 'Measured signal' : 'Editorial sample'}</span>
                {c.status === 'in-progress' && <span className="text-ink">Measurement in progress</span>}
              </div>
              <h1 className="font-display font-bold tracking-tight text-4xl sm:text-5xl lg:text-6xl leading-[0.98] text-balance">
                {c.title}
              </h1>
              {c.anchor && <p className="text-muted leading-relaxed max-w-3xl text-balance">{c.anchor}</p>}
              {c.thesis?.map((t, i) => (
                <p key={i} className="leading-relaxed max-w-3xl text-balance">
                  {t}
                </p>
              ))}
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="border-l-2 border-ink pl-4 py-1">
                <div className="small-caps text-ink/40 mb-2">FIREWALL</div>
                <p className="font-display text-sm leading-snug">{c.firewall}</p>
              </div>
              {c.definingTension && (
                <div className="border border-rule bg-canvas p-5 space-y-2">
                  <div className="small-caps text-ink/40">DEFINING TENSION</div>
                  <div className="font-display font-bold text-lg leading-tight">
                    "{c.definingTension.a}" <span className="text-muted font-normal">vs</span> "
                    {c.definingTension.b}"
                  </div>
                  {c.definingTension.note && (
                    <p className="text-sm text-muted leading-relaxed">{c.definingTension.note}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Clusters + term cards */}
      <section className="px-6 lg:px-12 py-12 lg:py-16">
        <div className="max-w-screen-xl mx-auto space-y-12">
          {hasClusters
            ? c.clusters!.map((cl) => {
                const terms = byCluster(cl.key);
                if (!terms.length) return null;
                return (
                  <div key={cl.key} className="space-y-6">
                    <div className="border-b border-rule pb-4">
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        <span className="font-display font-bold text-2xl">Cluster {cl.key}</span>
                        <span className="font-display font-bold text-2xl text-muted">{cl.name}</span>
                      </div>
                      {cl.blurb && (
                        <p className="text-muted mt-2 max-w-3xl leading-relaxed">{cl.blurb}</p>
                      )}
                    </div>
                    <TermGrid terms={terms} />
                  </div>
                );
              })
            : <TermGrid terms={c.terms} />}
        </div>
      </section>

      {/* Cross-cluster tensions */}
      {c.tensions && c.tensions.length > 0 && (
        <section className="px-6 lg:px-12 py-12 lg:py-16 bg-canvas border-y border-rule">
          <div className="max-w-screen-xl mx-auto">
            <span className="small-caps text-muted">// Cross-cluster tensions</span>
            <h2 className="font-display font-bold tracking-tight text-3xl lg:text-4xl mt-4 mb-10 text-balance">
              Same event, incompatible names.
            </h2>
            <div className="grid md:grid-cols-2 gap-px bg-rule border border-rule">
              {c.tensions.map((t, i) => (
                <div key={i} className="bg-canvas p-6 space-y-2">
                  {t.title && <div className="font-display font-bold text-lg leading-tight">{t.title}</div>}
                  <p className="text-sm text-muted leading-relaxed">{t.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
