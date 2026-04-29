import { useState } from 'react';
import { TERM_FILES } from '../data/terms';
import { DossierCard } from './DossierCard';

const TABS = ['ALL', 'GEOPOLITICS', 'AI & WORK'] as const;
type Tab = (typeof TABS)[number];

export function Archive() {
  const [active, setActive] = useState<Tab>('ALL');

  const filtered =
    active === 'ALL'
      ? TERM_FILES
      : TERM_FILES.filter((t) => t.campaign === active);

  return (
    <section id="archive" className="px-6 lg:px-12 py-24 lg:py-32 bg-paper">
      <div className="max-w-screen-xl mx-auto">
        {/* Header */}
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-7">
            <span className="small-caps text-muted">// 02 — Archive</span>
            <h2 className="font-display font-bold tracking-tight text-4xl lg:text-5xl mt-6 leading-[1.0] text-balance">
              Sample intelligence files.
            </h2>
            <p className="text-muted mt-6 max-w-2xl leading-relaxed">
              A live cross-section of the Contextive archive. Each file tracks one
              high-leverage term across velocity, sentiment, and platform behavior — with the
              context note explaining what the word is doing.
            </p>
          </div>

          <div className="lg:col-span-5 flex lg:justify-end items-end">
            <div className="flex border border-ink">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActive(tab)}
                  className={`px-4 py-3 small-caps transition-colors border-r border-ink last:border-r-0 ${
                    active === tab
                      ? 'bg-ink text-paper'
                      : 'bg-paper text-ink hover:bg-ink/5'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-rule">
          {filtered.map((term) => (
            <div key={term.ref} className="bg-paper p-px">
              <DossierCard term={term} />
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="flex flex-wrap justify-between items-center mt-12 pt-8 border-t border-rule small-caps text-muted">
          <span>{filtered.length} FILES // SYNTHETIC SAMPLE OUTPUT</span>
          <span>ACCESS LEVEL: DEMO</span>
        </div>
      </div>
    </section>
  );
}
