export function Manifesto() {
  return (
    <section className="bg-ink text-paper dark:bg-canvas dark:text-ink px-6 lg:px-12 py-24 lg:py-32 relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, #fff 0, #fff 1px, transparent 1px, transparent 16px)',
        }}
      />

      <div className="max-w-screen-xl mx-auto relative">
        <div className="grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-2">
            <div className="small-caps text-paper/50 dark:text-ink/50">// MANIFESTO</div>
          </div>
          <blockquote className="lg:col-span-10 space-y-8">
            <p className="font-display font-bold text-balance text-3xl sm:text-4xl lg:text-5xl xl:text-6xl leading-[1.05] tracking-tight">
              In geopolitics, language doesn't describe reality.{' '}
              <span className="text-paper/40 dark:text-ink/40">It sets the terms for how reality is understood.</span>{' '}
              Most readers see headlines. They don't see the language decisions underneath them.
            </p>
            <footer className="flex items-center gap-3 small-caps text-paper/60 dark:text-ink/60">
              <span className="w-6 h-px bg-paper/40 dark:bg-ink/40" />
              <span>FROM "THE WORDS THAT MOVE MARKETS" — CONTEXTIVE</span>
            </footer>
          </blockquote>
        </div>
      </div>
    </section>
  );
}
