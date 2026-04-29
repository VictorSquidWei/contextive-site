export function Thesis() {
  return (
    <section id="thesis" className="bg-canvas border-y border-rule px-6 lg:px-12 py-24 lg:py-32">
      <div className="max-w-screen-xl mx-auto grid lg:grid-cols-12 gap-12 lg:gap-20">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-32">
            <span className="small-caps text-muted">// 01 — Thesis</span>
            <h2 className="font-display font-bold tracking-tight text-3xl lg:text-4xl mt-6 leading-[1.05] text-balance">
              The words people choose are never random.
            </h2>
          </div>
        </div>

        <div className="lg:col-span-8 space-y-8 text-lg lg:text-xl leading-[1.55] text-ink/85 text-balance">
          <p>
            They frame how an audience thinks, who gets blamed, what feels urgent, and what
            gets ignored. When the White House calls tariffs <em>reciprocal</em> instead of{' '}
            <em>aggressive</em>, that's not a vocabulary choice — it's a framing strategy.
          </p>
          <p>
            When a CFO calls a layoff <em>workforce optimization</em> and the laid-off
            employee calls it <em>replaced by AI</em>, both are describing the same event from
            opposite sides of the table. The disagreement isn't about facts. It's about which
            vocabulary gets to decide how the facts are understood.
          </p>
          <p className="text-ink font-medium">
            Contextive tracks those words. We identify the high-leverage terms doing the most
            rhetorical work across politics, markets, technology, and culture — and we tell
            you who's using them, how the meaning is shifting, and what each word is doing
            before it shows up in the data.
          </p>

          <div className="grid grid-cols-2 gap-px bg-rule pt-8 mt-8 border-t border-rule">
            <div className="bg-canvas pt-8 pr-6">
              <div className="font-display text-4xl lg:text-5xl font-bold tracking-tight">
                14.3K
              </div>
              <div className="small-caps text-muted mt-2">
                Terms tracked across 6 platforms
              </div>
            </div>
            <div className="bg-canvas pt-8 pl-6">
              <div className="font-display text-4xl lg:text-5xl font-bold tracking-tight">
                240+
              </div>
              <div className="small-caps text-muted mt-2">
                Active intelligence files
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
