import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WaitlistForm } from './WaitlistForm';
import { SampleResponse } from './SampleResponse';
import { FIREWALL } from '../data/campaign';

const WHAT_YOU_GET = [
  ['Velocity', 'How fast a phrase is gaining or losing ground — momentum, not a snapshot.'],
  ['Inflection points', 'The dated moments coverage broke from its baseline.'],
  ['Adoption stage', 'Where a term sits on the niche-to-mainstream curve.'],
  ['Sentiment & co-occurrence', 'Average tone, and the words it travels with.'],
  ['compare(a, b)', 'Two phrases head to head — the defining-tension primitive, e.g. obliterated vs ceasefire.'],
  ['Measured or pending', 'A figure we can measure, or an honest pending — never a guess.'],
];

const WHO_ITS_FOR = [
  ['Comms & public affairs', 'Know whether your framing is winning against the opposing one — before the polling confirms it.'],
  ['Brand & trend intelligence', 'Catch a term crossing from niche to mainstream while it still matters.'],
  ['Newsrooms & researchers', 'A measured, citable read on which language is moving, and when it moved.'],
];

interface Tier {
  name: string;
  price: string;
  unit?: string;
  lines: string[];
  featured?: boolean;
}

const PRICING: Tier[] = [
  { name: 'Free', price: '$0', lines: ['~25 lookups / day', '2 tracked terms', 'Community support'] },
  { name: 'Starter', price: '$39', unit: '/mo', lines: ['10 tracked terms', '5k calls / mo', 'Daily refresh · email alerts'] },
  { name: 'Pro', price: '$149', unit: '/mo', lines: ['50 tracked terms', '50k calls / mo', 'Webhooks · history · compare'], featured: true },
  { name: 'Enterprise', price: 'Custom', lines: ['Bulk + historical backfill', 'SLA · dashboards', 'Annual'] },
];

export function Waitlist() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <main className="px-6 lg:px-12 py-12 lg:py-20">
      <div className="max-w-screen-xl mx-auto">
        {/* Hero */}
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          <div className="lg:col-span-7 space-y-8">
            <div className="flex items-center gap-3">
              <span className="inline-block w-2 h-2 bg-ink rotate-45" />
              <span className="small-caps text-muted">The Contextive API // Coming soon</span>
            </div>

            <h1 className="font-display font-bold leading-[0.95] tracking-tight text-balance text-[2.75rem] sm:text-[3.5rem] lg:text-[4.5rem]">
              The signal, as an API.
            </h1>

            <p className="text-base lg:text-lg text-muted max-w-[520px] leading-relaxed text-balance">
              Every word Contextive tracks is a measured signal — momentum, inflection, adoption
              stage, tone — drawn from the open news and media record. The API puts that signal in
              your stack: query any phrase, get back how fast it is moving and where it is heading.
              Velocity, not verdict.
            </p>

            <div className="max-w-md space-y-3">
              <span className="small-caps text-muted block">Request early access</span>
              <WaitlistForm
                source="api-waitlist"
                layout="row"
                submitLabel="Join the waitlist"
                confirmBody="You're on the API waitlist — and we've opened Substack so the intelligence dispatch comes with it. If the tab didn't open, use the link below."
              />
              <p className="small-caps text-whisper text-[10px]">
                Joins the waitlist + the weekly dispatch. No spam.
              </p>
            </div>
          </div>

          {/* Concrete artifact: a real response (becomes a live API round-trip when VITE_CONTEXTIVE_API_URL is set) */}
          <div className="lg:col-span-5 w-full min-w-0">
            <SampleResponse />
          </div>
        </div>

        {/* What you get */}
        <section className="mt-20 lg:mt-28">
          <div className="small-caps text-muted mb-6">// What a query returns</div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-px bg-rule border border-rule">
            {WHAT_YOU_GET.map(([title, body]) => (
              <div key={title} className="bg-paper p-5 space-y-2">
                <div className="font-display font-bold text-ink">{title}</div>
                <p className="text-sm text-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Who it's for */}
        <section className="mt-16 lg:mt-24">
          <div className="small-caps text-muted mb-6">// Who it's for</div>
          <div className="grid md:grid-cols-3 gap-8">
            {WHO_ITS_FOR.map(([title, body]) => (
              <div key={title} className="space-y-2">
                <div className="font-display font-bold text-lg text-ink">{title}</div>
                <p className="text-sm text-muted leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What's a tracked term */}
        <section className="mt-16 lg:mt-24">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            <div className="lg:col-span-5 space-y-4">
              <div className="small-caps text-muted">// What's a tracked term</div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl leading-tight text-balance">
                A tracked term is a phrase you keep under watch.
              </h2>
              <p className="text-muted leading-relaxed">
                Most queries are one-off lookups — a phrase's reading right now. A{' '}
                <span className="text-ink font-medium">tracked term</span> is different: you put a phrase
                under continuous measurement and Contextive re-measures it on every refresh, so its velocity,
                inflection points, and adoption stage stay current — and you're alerted when it moves. It's the
                unit your plan is counted in.
              </p>
            </div>
            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-px bg-rule border border-rule">
              <div className="bg-paper p-6 space-y-2">
                <div className="small-caps text-muted">A lookup</div>
                <p className="text-sm text-muted leading-relaxed">
                  One-off. A phrase's reading the moment you ask — for research and spot-checks. The Free tier
                  includes about 25 a day.
                </p>
              </div>
              <div className="bg-paper p-6 space-y-2">
                <div className="small-caps text-ink">A tracked term</div>
                <p className="text-sm text-muted leading-relaxed">
                  A phrase kept under measurement and refreshed on your plan's cadence, with alerts when it
                  inflects. This is what your plan is sized in.
                </p>
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-px bg-rule border border-rule mt-8">
            <div className="bg-paper p-6 space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-3xl text-ink">10</span>
                <span className="small-caps text-muted">tracked terms · Starter</span>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                Enough to watch your own core messaging and the handful of phrases around it — a single
                narrative, monitored closely.
              </p>
            </div>
            <div className="bg-paper p-6 space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="font-display font-bold text-3xl text-ink">50</span>
                <span className="small-caps text-muted">tracked terms · Pro</span>
              </div>
              <p className="text-sm text-muted leading-relaxed">
                A full message map: your framing, the opposing framing, and the category's shared vocabulary —
                all watched side by side and ready for <span className="font-mono text-ink">compare()</span>.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="mt-16 lg:mt-24">
          <div className="flex items-baseline justify-between flex-wrap gap-2 mb-6">
            <div className="small-caps text-muted">// Early-access pricing</div>
            <div className="small-caps text-whisper text-[10px]">Launch pricing · usage beyond plan is metered · subject to change</div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-px bg-rule border border-rule">
            {PRICING.map((tier) => (
              <div
                key={tier.name}
                className={`p-6 space-y-4 ${tier.featured ? 'bg-ink text-paper' : 'bg-paper'}`}
              >
                <div className={`small-caps ${tier.featured ? 'text-paper/60' : 'text-muted'}`}>{tier.name}</div>
                <div className="flex items-baseline gap-1">
                  <span className="font-display font-bold text-3xl tracking-tight">{tier.price}</span>
                  {tier.unit && (
                    <span className={`small-caps text-[11px] ${tier.featured ? 'text-paper/50' : 'text-whisper'}`}>{tier.unit}</span>
                  )}
                </div>
                <ul className="space-y-2">
                  {tier.lines.map((line) => (
                    <li key={line} className="flex items-start gap-2.5">
                      <span className={`mt-1.5 w-1.5 h-1.5 rotate-45 shrink-0 ${tier.featured ? 'bg-paper' : 'bg-ink'}`} />
                      <span className={`text-sm leading-snug ${tier.featured ? 'text-paper/85' : 'text-muted'}`}>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Honest by design */}
        <section className="mt-16 lg:mt-24 border-t border-rule pt-10">
          <div className="grid lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7 space-y-3">
              <div className="small-caps text-muted">// Honest by design</div>
              <p className="text-base text-muted leading-relaxed max-w-2xl">
                The signal is drawn from the open news and media record, and every figure carries the
                date it was retrieved and the method that produced it. We sell measured momentum — not
                trading alpha, not a prediction. Cross-platform spread is a labelled editorial overlay.
                See <Link to="/how-it-works" className="text-ink underline underline-offset-4 hover:opacity-70">how it works</Link>.
              </p>
              <p className="font-display text-ink text-lg leading-snug max-w-2xl pt-2">
                &ldquo;{FIREWALL}&rdquo;
              </p>
            </div>
            <div className="lg:col-span-5">
              <div className="border border-ink p-6 space-y-4 bg-canvas">
                <div className="font-display font-bold text-xl text-ink">Get on the list</div>
                <p className="text-sm text-muted leading-relaxed">
                  Early access opens to a small first group. Tell us the phrases you would track first.
                </p>
                <WaitlistForm
                  source="api-waitlist-footer"
                  layout="stack"
                  submitLabel="Join the waitlist"
                />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
