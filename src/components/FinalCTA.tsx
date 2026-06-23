import { WaitlistForm } from './WaitlistForm';

export function FinalCTA() {
  return (
    <section className="bg-paper border-y border-rule px-6 lg:px-12 py-12 lg:py-16">
      <div className="max-w-screen-xl mx-auto grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        <div className="lg:col-span-7 space-y-4">
          <span className="small-caps text-muted">// Subscribe</span>
          <h2 className="font-display font-bold tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-[0.95] text-balance">
            See the words that decide the story.
          </h2>
          <p className="text-muted text-base leading-relaxed max-w-xl">
            Weekly intelligence files. The terms doing the rhetorical work, who's
            using them, and what each word reveals about what comes next.
          </p>
        </div>

        <div className="lg:col-span-5">
          <WaitlistForm
            source="final-cta"
            layout="stack"
            label="Archive Access ID"
            submitLabel="Subscribe to the dispatch"
            submittingLabel="Submitting..."
            footnote="Free. Weekly. Unsubscribe anytime."
          />
        </div>
      </div>
    </section>
  );
}
