import { CAMPAIGNS } from '../data/terms';

export function Campaigns() {
  return (
    <section id="campaigns" className="bg-canvas border-y border-rule px-6 lg:px-12 py-24 lg:py-32">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="mb-20 max-w-3xl">
          <span className="small-caps text-muted">// 03 — Campaigns</span>
          <h2 className="font-display font-bold tracking-tight text-4xl lg:text-5xl mt-6 leading-[1.0] text-balance">
            Two cycles. Same thesis.
          </h2>
          <p className="text-muted mt-6 leading-relaxed text-lg">
            Each Contextive campaign maps the vocabulary war inside one domain. We pick the
            terrain where language is doing the most strategic work, identify the terms
            doing the lifting, and publish the analysis on Substack and X.
          </p>
        </div>

        {/* Campaign blocks */}
        <div className="space-y-24 lg:space-y-32">
          {CAMPAIGNS.map((c, idx) => (
            <article key={c.id} className="grid lg:grid-cols-12 gap-12">
              {/* Number / metadata column */}
              <div className="lg:col-span-3">
                <div className="flex lg:flex-col gap-6 lg:gap-3 items-baseline">
                  <div className="font-display font-bold text-7xl lg:text-8xl leading-none text-ink/90">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <div>
                    <div className="small-caps text-muted mb-1">{c.label}</div>
                    <div className="small-caps text-ink">{c.period}</div>
                  </div>
                </div>
              </div>

              {/* Content column */}
              <div className="lg:col-span-9 space-y-10">
                <div className="space-y-5">
                  <h3 className="font-display font-bold tracking-tight text-3xl lg:text-4xl leading-[1.05] text-balance">
                    {c.title}
                  </h3>
                  <p className="text-muted leading-relaxed text-lg max-w-3xl text-balance">
                    {c.description}
                  </p>
                </div>

                {/* Pillars */}
                <div className="grid md:grid-cols-3 gap-px bg-rule border border-rule">
                  {c.pillars.map((p, i) => (
                    <div key={p.title} className="bg-canvas p-6 lg:p-8 space-y-3">
                      <div className="small-caps text-muted">PILLAR / 0{i + 1}</div>
                      <h4 className="font-display font-bold text-lg leading-tight">
                        {p.title}
                      </h4>
                      <p className="text-sm text-muted leading-relaxed">{p.body}</p>
                    </div>
                  ))}
                </div>

                {/* Term chips */}
                <div className="space-y-3">
                  <div className="small-caps text-muted">TRACKED TERMS</div>
                  <div className="flex flex-wrap gap-2">
                    {c.terms.map((term) => (
                      <span
                        key={term}
                        className="inline-flex items-center gap-2 border border-ink px-3 py-1.5 small-caps hover:bg-ink hover:text-paper transition-colors cursor-default"
                      >
                        <span className="w-1 h-1 bg-current rotate-45" />
                        {term}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
