const STEPS = [
  {
    number: '01',
    title: 'Signal Detection',
    body:
      'Cross-platform velocity tracking across X, LinkedIn, Reddit, TikTok, YouTube, and major news outlets. Surface the terms before they saturate.',
  },
  {
    number: '02',
    title: 'Context Mapping',
    body:
      'Each term gets traced across speakers, sectors, and time. Who is using it, what is it replacing, where is the meaning shifting.',
  },
  {
    number: '03',
    title: 'Intelligence Files',
    body:
      'Human-reviewed analysis. Not summaries — analysis. Why the word was chosen, what it conceals, and what it tells you about what comes next.',
  },
  {
    number: '04',
    title: 'Archive',
    body:
      'A permanent, searchable repository. Track a term over months. See when sentiment flipped, when velocity spiked, when a counter-vocabulary emerged.',
  },
];

export function System() {
  return (
    <section id="system" className="px-6 lg:px-12 py-24 lg:py-32 bg-paper">
      <div className="max-w-screen-xl mx-auto">
        <div className="mb-16 max-w-3xl">
          <span className="small-caps text-muted">// 04 — The System</span>
          <h2 className="font-display font-bold tracking-tight text-4xl lg:text-5xl mt-6 leading-[1.0] text-balance">
            Signal in. Intelligence out.
          </h2>
          <p className="text-muted mt-6 leading-relaxed text-lg max-w-2xl">
            Contextive runs as an agentic pipeline with human-in-the-loop review at every
            stage. The result: language intelligence that's both fast enough to be useful and
            careful enough to be trusted.
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-rule border border-rule">
          {STEPS.map((s) => (
            <div key={s.number} className="bg-paper p-7 lg:p-9 space-y-6 group hover:bg-canvas transition-colors">
              <div className="flex items-baseline justify-between">
                <span className="font-display font-bold text-3xl">{s.number}</span>
                <span className="small-caps text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                  STAGE
                </span>
              </div>
              <div className="institution-rule"></div>
              <div className="space-y-3">
                <h3 className="font-display font-bold text-xl leading-tight">{s.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom strap */}
        <div className="mt-16 grid lg:grid-cols-3 gap-8 lg:gap-16 pt-12 border-t border-rule">
          <div>
            <div className="small-caps text-muted mb-2">PIPELINE</div>
            <div className="font-display text-lg leading-snug">Agentic detection. Human verification.</div>
          </div>
          <div>
            <div className="small-caps text-muted mb-2">CADENCE</div>
            <div className="font-display text-lg leading-snug">Weekly Substack. Daily X feed.</div>
          </div>
          <div>
            <div className="small-caps text-muted mb-2">SCOPE</div>
            <div className="font-display text-lg leading-snug">Politics. Markets. Tech. Culture.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
