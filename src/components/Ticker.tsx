import { TICKER_TERMS } from '../data/terms';

export function Ticker() {
  // Duplicate the array for seamless infinite loop
  const items = [...TICKER_TERMS, ...TICKER_TERMS];

  return (
    <div className="border-y border-ink bg-ink text-paper dark:bg-canvas dark:text-ink py-3 overflow-hidden relative">
      {/* Edge fades */}
      <div className="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-ink to-transparent dark:from-canvas z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-ink to-transparent dark:from-canvas z-10 pointer-events-none" />

      <div className="flex items-center gap-2 small-caps mb-2 px-6 lg:px-12 text-whisper">
        <span className="inline-block w-1.5 h-1.5 bg-paper dark:bg-ink velocity-pulse" />
        <span>LIVE SIGNAL // CROSS-PLATFORM TERM TRACKING</span>
      </div>

      <div className="flex marquee-track whitespace-nowrap">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-8 shrink-0">
            <span className="font-display text-sm font-bold tracking-tight uppercase text-paper dark:text-ink">
              {item.term}
            </span>
            <span className="text-whisper small-caps">{item.meta}</span>
            <span className="text-whisper">·</span>
          </div>
        ))}
      </div>
    </div>
  );
}
