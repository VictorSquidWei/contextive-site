import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { SOCIAL_LINKS } from '../data/terms';

type ChannelKind = 'substack' | 'threads' | 'instagram' | 'web';

const SocialIcon = ({ kind }: { kind: ChannelKind }) => {
  const common = 'w-5 h-5';
  switch (kind) {
    case 'web':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="9" />
          <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
        </svg>
      );
    case 'substack':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor">
          <path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z" />
        </svg>
      );
    case 'threads':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor">
          <path d="M16.2 11.37a6.6 6.6 0 00-.25-.11c-.14-2.72-1.63-4.27-4.12-4.29h-.04c-1.49 0-2.73.64-3.49 1.8l1.37.94c.57-.86 1.46-1.04 2.12-1.04h.03c.82 0 1.44.24 1.84.71.29.34.49.82.58 1.42a10.5 10.5 0 00-2.36-.11c-2.37.14-3.9 1.52-3.8 3.45.05.98.54 1.82 1.37 2.37.71.46 1.62.69 2.57.64 1.25-.07 2.23-.55 2.92-1.42.52-.67.85-1.53 1-2.62.6.36 1.05.84 1.3 1.42.42.98.44 2.6-.87 3.91-1.15 1.15-2.53 1.64-4.62 1.66-2.32-.02-4.07-.76-5.21-2.21C7.47 16.9 6.92 15 6.9 12.5c.02-2.5.57-4.4 1.64-5.76 1.14-1.45 2.9-2.19 5.21-2.21 2.33.02 4.11.76 5.29 2.22.58.71 1.02 1.61 1.31 2.66l1.61-.43c-.35-1.3-.9-2.42-1.65-3.34C18.8 3.76 16.6 2.83 13.76 2.81h-.01c-2.83.02-5.01.95-6.47 2.78C5.98 7.21 5.3 9.46 5.28 12.5v.01c.02 3.03.7 5.28 2 6.9 1.46 1.82 3.64 2.76 6.47 2.78h.01c2.52-.02 4.29-.68 5.75-2.14 1.91-1.91 1.86-4.3 1.23-5.77-.45-1.05-1.31-1.9-2.49-2.49zm-4.28 3.97c-1.05.06-2.14-.41-2.2-1.38-.04-.72.51-1.52 2.27-1.62.2-.01.4-.02.59-.02.64 0 1.24.06 1.78.18-.2 2.5-1.38 2.8-2.44 2.85z" />
        </svg>
      );
    case 'instagram':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <circle cx="12" cy="12" r="3.5" />
          <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" />
        </svg>
      );
  }
};

interface Channel {
  label: string;
  value: string;
  href?: string;
  kind: ChannelKind;
}

const CHANNELS: Channel[] = [
  { label: 'WEB',         value: 'contextive.info',                     kind: 'web' },
  { label: 'SUBSTACK',    value: 'open.substack.com/pub/contextive',    href: SOCIAL_LINKS.substack,  kind: 'substack' },
  { label: 'THREADS',     value: 'threads.com/@contextive.info',        href: SOCIAL_LINKS.threads,   kind: 'threads' },
  { label: 'INSTAGRAM',   value: 'www.instagram.com/contextive.info',   href: SOCIAL_LINKS.instagram, kind: 'instagram' },
];

const ChannelTile = ({ label, value, href, kind }: Channel) => {
  const Wrapper: any = href ? 'a' : 'div';
  const props = href
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <Wrapper
      {...props}
      title={value}
      className="group flex items-center gap-3 p-3 border border-paper/15 dark:border-ink/15 hover:border-paper/40 dark:hover:border-ink/40 transition-colors"
    >
      <div className="w-10 h-10 border border-paper/30 dark:border-ink/30 flex items-center justify-center text-paper dark:text-ink shrink-0 group-hover:border-paper dark:group-hover:border-ink transition-colors">
        <SocialIcon kind={kind} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="small-caps text-paper/40 dark:text-ink/40 leading-none">{label}</div>
        <div className="font-display font-bold text-xs text-paper dark:text-ink truncate mt-1">
          {value}
        </div>
      </div>
    </Wrapper>
  );
};

export function Footer() {
  return (
    <footer className="bg-ink text-paper dark:bg-canvas dark:text-ink px-6 lg:px-12 py-12 lg:py-16">
      <div className="max-w-screen-xl mx-auto">
        {/* Top compact row */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 mb-10">
          {/* Brand */}
          <div className="lg:col-span-5 space-y-4">
            <Logo className="text-paper dark:text-ink" />
            <p className="text-paper/60 dark:text-ink/60 text-sm leading-relaxed max-w-md">
              Contextive is a language intelligence system. We measure how public language
              gains momentum and shifts meaning (velocity, not verdict) across politics,
              the economy, AI, and culture.
            </p>
          </div>

          {/* Channels grid */}
          <div className="lg:col-span-7">
            <div className="small-caps text-paper/40 dark:text-ink/40 mb-3">// CHANNELS</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {CHANNELS.map((c) => (
                <ChannelTile {...c} key={c.label} />
              ))}
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="pt-6 border-t border-paper/15 dark:border-ink/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 small-caps text-paper/40 dark:text-ink/40 text-[10px]">
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            <span>© 2026 CONTEXTIVE INTELLIGENCE</span>
            <span>SEATTLE, UNITED STATES</span>
          </div>
          <div className="flex gap-6">
            <Link to="/" className="hover:text-paper dark:hover:text-ink transition-colors">HOME</Link>
            <Link to="/#campaigns" className="hover:text-paper dark:hover:text-ink transition-colors">CAMPAIGNS</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
