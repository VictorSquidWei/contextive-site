import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { SOCIAL_LINKS } from '../data/terms';

type ChannelKind = 'substack' | 'twitter' | 'instagram' | 'web';

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
    case 'twitter':
      return (
        <svg className={common} viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
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
  { label: 'X / TWITTER', value: 'x.com/contextive_ai',                 href: SOCIAL_LINKS.twitter,   kind: 'twitter' },
  { label: 'INSTAGRAM',   value: 'www.instagram.com/contextive.ai',     href: SOCIAL_LINKS.instagram, kind: 'instagram' },
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
              Contextive is a language intelligence system. We track the words that move
              markets, shape policy, and frame perception — and explain what each one is
              doing.
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
            <Link to="/" className="hover:text-paper dark:hover:text-ink transition-colors">CAMPAIGNS</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
