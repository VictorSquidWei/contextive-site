import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import { SUBSTACK_SUBSCRIBE } from '../data/terms';

/* ─────────────────────────────────────────────────────────────────────────
   How Contextive works — the methodology / signal-layer page.
   Brand rules: monochrome + typographic only, velocity-not-verdict, and the
   description of our own method stays as honest as the briefs (GDELT measures
   the open news/media record; cross-platform spread is an editorial read).
   ───────────────────────────────────────────────────────────────────────── */

const REVEAL = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.2, 0, 0.2, 1] } },
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="inline-block w-2 h-2 bg-ink rotate-45" />
      <span className="small-caps text-muted">{children}</span>
    </div>
  );
}

/* Count a value up from 0 the first time it scrolls into view. */
function useCountUp(target: number, active: boolean, duration = 1400) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!active) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setVal(target);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(Math.round(eased * target));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, target, duration]);
  return val;
}

/* ── The crowd: countless marks, each blinking on its own clock ─────────── */
function CrowdField() {
  const COLS = 22;
  const ROWS = 8;
  const dots = Array.from({ length: COLS * ROWS });
  return (
    <div className="relative overflow-hidden border border-rule bg-canvas paper-grain">
      <div
        className="grid gap-3 sm:gap-4 p-6 sm:p-10"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
        aria-hidden="true"
      >
        {dots.map((_, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const delay = ((col + row) % 11) * 0.28;
          return (
            <span
              key={i}
              className="crowd-dot block w-1.5 h-1.5 sm:w-2 sm:h-2 bg-ink"
              style={{ animationDelay: `${delay}s` }}
            />
          );
        })}
      </div>
      {/* the scan — we watch the whole field, not the loudest voice */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3">
        <div className="scan-sweep h-full w-full bg-gradient-to-r from-transparent via-ink/10 to-transparent" />
      </div>
    </div>
  );
}

/* ── Extraction: the open record + platform spread flow into the signal ──── */
function ExtractionDiagram() {
  const SOURCES_MEASURED = ['NEWS WIRES', 'BROADCAST', 'WEB', 'PRINT'];
  const SOURCES_EDITORIAL = ['X', 'REDDIT', 'TIKTOK', 'YOUTUBE'];
  // y-anchors for each source row
  const yFor = (group: 'a' | 'b', i: number) =>
    group === 'a' ? 64 + i * 40 : 248 + i * 40;

  return (
    <div className="border border-rule bg-canvas paper-grain p-4 sm:p-8 overflow-x-auto">
      <svg
        viewBox="0 0 820 440"
        className="w-full min-w-[560px] text-ink"
        role="img"
        aria-label="Tracked terms are measured against the open media record via GDELT, with cross-platform spread read editorially on top, producing seven signal fields."
      >
        <style>{`
          .lbl { font-family: 'JetBrains Mono', monospace; font-size: 12px; letter-spacing: 0.12em; fill: currentColor; }
          .lbl-mute { fill: rgb(var(--color-muted)); }
          .grp { font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.28em; fill: rgb(var(--color-whisper)); }
          .node-lbl { font-family: 'Space Grotesk', sans-serif; font-weight: 700; fill: currentColor; }
          .stroke-rule { stroke: rgb(var(--color-rule)); }
          .stroke-ink { stroke: currentColor; }
        `}</style>

        {/* group captions */}
        <text x="28" y="40" className="grp">THE OPEN RECORD — MEASURED</text>
        <text x="28" y="224" className="grp">PLATFORM SPREAD — EDITORIAL</text>

        {/* connector paths: sources → GDELT node (x≈360) */}
        {SOURCES_MEASURED.map((_, i) => (
          <path
            key={`a${i}`}
            d={`M 150 ${yFor('a', i)} C 250 ${yFor('a', i)}, 280 200, 380 200`}
            fill="none"
            className="stroke-ink flow-line"
            strokeWidth="1.5"
            opacity="0.85"
          />
        ))}
        {SOURCES_EDITORIAL.map((_, i) => (
          <path
            key={`b${i}`}
            d={`M 150 ${yFor('b', i)} C 250 ${yFor('b', i)}, 300 248, 380 240`}
            fill="none"
            className="stroke-rule flow-line flow-line-slow"
            strokeWidth="1.5"
            strokeOpacity="0.9"
          />
        ))}

        {/* source labels with markers */}
        {SOURCES_MEASURED.map((s, i) => (
          <g key={s}>
            <rect x="28" y={yFor('a', i) - 4} width="6" height="6" transform={`rotate(45 31 ${yFor('a', i) - 1})`} fill="currentColor" />
            <text x="48" y={yFor('a', i)} className="lbl">{s}</text>
          </g>
        ))}
        {SOURCES_EDITORIAL.map((s, i) => (
          <g key={s}>
            <rect x="28" y={yFor('b', i) - 4} width="6" height="6" transform={`rotate(45 31 ${yFor('b', i) - 1})`} fill="rgb(var(--color-muted))" />
            <text x="48" y={yFor('b', i)} className="lbl lbl-mute">{s}</text>
          </g>
        ))}

        {/* GDELT node */}
        <g className="node-pulse" style={{ transformOrigin: '440px 200px' }}>
          <rect x="380" y="168" width="120" height="64" fill="none" className="stroke-ink" strokeWidth="2" />
          <text x="440" y="194" textAnchor="middle" className="node-lbl" fontSize="18">GDELT</text>
          <text x="440" y="214" textAnchor="middle" className="lbl lbl-mute" fontSize="9">COVERAGE INTENSITY</text>
        </g>

        {/* GDELT → signal */}
        <path d="M 500 200 C 580 200, 600 200, 660 200" fill="none" className="stroke-ink flow-line flow-line-fast" strokeWidth="2" />

        {/* Signal node */}
        <g>
          <rect x="660" y="150" width="132" height="100" fill="none" className="stroke-ink" strokeWidth="2" />
          <text x="726" y="184" textAnchor="middle" className="node-lbl" fontSize="15">SEVEN</text>
          <text x="726" y="206" textAnchor="middle" className="node-lbl" fontSize="15">SIGNALS</text>
          <text x="726" y="230" textAnchor="middle" className="lbl lbl-mute" fontSize="9">PER TERM</text>
        </g>
      </svg>
    </div>
  );
}

const SIGNALS: { field: string; def: string }[] = [
  { field: 'Velocity index', def: '30-day momentum against a 90-day baseline, ranked 0–100 within the set.' },
  { field: 'Corpus density', def: 'Share of monitored coverage — a labelled proxy, not literal mention counts.' },
  { field: 'Inflection points', def: 'Dated peaks where coverage broke from its own trend.' },
  { field: 'Sentiment', def: 'Average tone of the coverage, clamped to −5…+5.' },
  { field: 'Co-occurrence', def: 'The words a term travels with.' },
  { field: 'Adoption stage', def: 'Where the term sits in its life cycle — emerging to fading.' },
  { field: 'Platforms spiking', def: 'Where it surges across platforms — read editorially on top.' },
];

/* ── A live signal card assembling itself (real measured example) ───────── */
function SignalDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const velocity = useCountUp(100, inView, 1500);
  const delta = useCountUp(425, inView, 1500);

  return (
    <div ref={ref} className="border border-ink bg-canvas dossier-shadow p-6 sm:p-8">
      <div className="flex items-center justify-between gap-4 border-b border-rule pb-4">
        <span className="small-caps text-muted">REF / C06-B3 · MEASURED</span>
        <span className="small-caps text-muted">STRATEGIC / TERMINATION</span>
      </div>

      <h3 className="font-display font-bold text-3xl sm:text-4xl mt-5 mb-6">“ceasefire”</h3>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-px bg-rule border border-rule">
        {[
          { k: 'VELOCITY', v: `${velocity}/100` },
          { k: '90-DAY', v: `+${delta}%` },
          { k: 'STAGE', v: 'SPREADING' },
          { k: 'SENTIMENT', v: '−3.5' },
        ].map((m) => (
          <div key={m.k} className="bg-canvas p-3 sm:p-4">
            <div className="small-caps text-whisper mb-1">{m.k}</div>
            <div className="font-display font-bold text-lg sm:text-xl tabular-nums">{m.v}</div>
          </div>
        ))}
      </div>

      <p className="text-sm text-muted leading-relaxed mt-5">
        A real reading from Campaign 06. The card is filled from the measured series —
        the same numbers the brief and the carousel use. Nothing here is keyed by hand.
      </p>
    </div>
  );
}

export function HowItWorks() {
  return (
    <main className="overflow-x-hidden">
      {/* HERO */}
      <section className="px-6 lg:px-12 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="max-w-screen-xl mx-auto">
          <motion.div
            initial="hidden"
            animate="show"
            variants={REVEAL}
            className="max-w-3xl space-y-6"
          >
            <Eyebrow>Methodology // The signal layer</Eyebrow>
            <h1 className="font-display font-bold leading-[0.96] tracking-tight text-balance text-[2.75rem] sm:text-6xl lg:text-7xl">
              How a word becomes a measured signal
            </h1>
            <p className="text-base lg:text-lg text-muted max-w-[560px] leading-relaxed text-balance">
              Contextive tracks how language gains momentum — <em className="italic">velocity, not verdict</em>.
              No opinions, no estimates. Here is the path from the open public record to a
              number you can check.
            </p>
          </motion.div>
        </div>
      </section>

      {/* 1 — THE CROWD */}
      <section className="px-6 lg:px-12 py-16 lg:py-24 border-t border-rule">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={REVEAL}
            className="lg:col-span-5 space-y-5"
          >
            <span className="small-caps text-whisper">01 — Source</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
              It starts with the crowd
            </h2>
            <p className="text-muted leading-relaxed">
              Every cultural argument is fought in public — millions of posts, headlines,
              broadcasts and threads. No single account decides a word's fate; the pattern
              does. Contextive watches the whole field, never the loudest voice.
            </p>
          </motion.div>
          <div className="lg:col-span-7">
            <CrowdField />
          </div>
        </div>
      </section>

      {/* 2 — THE OPEN RECORD / GDELT */}
      <section className="px-6 lg:px-12 py-16 lg:py-24 border-t border-rule">
        <div className="max-w-screen-xl mx-auto space-y-10">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={REVEAL}
            className="max-w-2xl space-y-5"
          >
            <span className="small-caps text-whisper">02 — Extraction</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
              We read the open record
            </h2>
            <p className="text-muted leading-relaxed">
              Each tracked term becomes a query against{' '}
              <span className="text-ink">GDELT</span> — the Global Database of Events,
              Language and Tone, which monitors the world's news and media in near real
              time. The result is a measured coverage-intensity series, not a guess. Where
              a term surges across social platforms is read editorially on top — labelled
              as such, never blended into the measurement.
            </p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-80px' }}
            variants={REVEAL}
          >
            <ExtractionDiagram />
          </motion.div>
        </div>
      </section>

      {/* 3 — SEVEN SIGNALS */}
      <section className="px-6 lg:px-12 py-16 lg:py-24 border-t border-rule">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={REVEAL}
            className="lg:col-span-6 space-y-6"
          >
            <span className="small-caps text-whisper">03 — Signal</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
              From coverage to signal
            </h2>
            <p className="text-muted leading-relaxed">
              Each term's coverage series is turned into seven measured fields. Together
              they describe not what a word means, but how fast it is winning.
            </p>
            <div className="divide-y divide-rule border-t border-rule">
              {SIGNALS.map((s, i) => (
                <div key={s.field} className="flex gap-4 py-3">
                  <span className="small-caps text-whisper pt-1 w-6 shrink-0">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <div className="font-display font-semibold text-lg">{s.field}</div>
                    <div className="text-sm text-muted leading-relaxed">{s.def}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={REVEAL}
            className="lg:col-span-6 lg:sticky lg:top-28"
          >
            <SignalDemo />
          </motion.div>
        </div>
      </section>

      {/* 4 — MEASURE, DON'T ESTIMATE */}
      <section className="px-6 lg:px-12 py-16 lg:py-24 border-t border-rule">
        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={REVEAL}
            className="space-y-5"
          >
            <span className="small-caps text-whisper">04 — The rule</span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight">
              Measure, don't estimate
            </h2>
            <p className="text-muted leading-relaxed">
              If a term can't be measured, we don't invent a number — the card reads
              <span className="text-ink"> measurement pending</span> until the data lands.
              And when a measured number kills a planned narrative, that is the story, not
              something to bury.
            </p>
          </motion.div>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={REVEAL}
            className="grid grid-cols-2 gap-4"
          >
            <div className="border border-ink bg-canvas p-5 space-y-2">
              <span className="small-caps text-muted">Measured</span>
              <div className="font-display font-bold text-2xl">80<span className="text-whisper text-base">/100</span></div>
              <div className="institution-rule text-rule" />
              <p className="text-xs text-muted leading-relaxed">A real coverage series, with a retrieval timestamp.</p>
            </div>
            <div className="border border-dashed border-rule bg-canvas p-5 space-y-2">
              <span className="small-caps text-whisper">Pending</span>
              <div className="font-display font-bold text-2xl text-whisper">— —</div>
              <div className="institution-rule text-rule" />
              <p className="text-xs text-whisper leading-relaxed">Not yet measurable. Never a guess in its place.</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 5 — FIREWALL */}
      <section className="px-6 lg:px-12 py-16 lg:py-24 border-t border-rule">
        <div className="max-w-screen-xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            variants={REVEAL}
            className="max-w-4xl"
          >
            <span className="small-caps text-whisper">05 — The firewall</span>
            <blockquote className="border-l-2 border-ink pl-6 sm:pl-8 mt-6">
              <p className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl leading-snug text-balance">
                “We track how the words have been used and how fast they are winning, not
                whether the underlying politics is correct.”
              </p>
            </blockquote>
            <p className="text-muted leading-relaxed mt-6 max-w-[560px]">
              Velocity, not verdict. We measure the language of an argument; we never take
              the argument's side.
            </p>
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 lg:px-12 py-20 lg:py-28 border-t border-rule">
        <div className="max-w-screen-xl mx-auto flex flex-col items-start gap-8">
          <h2 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl leading-tight max-w-2xl text-balance">
            See the method on a live campaign
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/campaigns/06-iran-war"
              className="inline-flex items-center gap-2 small-caps text-paper bg-ink px-6 py-4 hover:bg-ink/85 transition-colors"
            >
              Campaign 06 — the Iran war →
            </Link>
            <a
              href={SUBSTACK_SUBSCRIBE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 small-caps text-ink border border-ink px-6 py-4 hover:bg-ink hover:text-paper transition-colors"
            >
              Subscribe
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
