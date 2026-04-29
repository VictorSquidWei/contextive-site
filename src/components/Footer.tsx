import { Logo } from './Logo';
import { SOCIAL_LINKS } from '../data/terms';

const SocialIcon = ({ kind }: { kind: 'substack' | 'twitter' | 'instagram' | 'web' }) => {
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

const SocialRow = ({
  label,
  value,
  href,
  kind,
}: {
  label: string;
  value: string;
  href?: string;
  kind: 'substack' | 'twitter' | 'instagram' | 'web';
}) => {
  const Wrapper: any = href ? 'a' : 'div';
  const props = href
    ? { href, target: '_blank', rel: 'noopener noreferrer' }
    : {};

  return (
    <Wrapper
      {...props}
      className={`flex items-center gap-5 py-5 border-b border-paper/15 dark:border-ink/15 ${
        href ? 'group hover:bg-paper/5 dark:hover:bg-ink/5 transition-colors -mx-3 px-3' : ''
      }`}
    >
      <div className="w-12 h-12 border border-paper/30 dark:border-ink/30 flex items-center justify-center text-paper dark:text-ink shrink-0 group-hover:border-paper dark:group-hover:border-ink transition-colors">
        <SocialIcon kind={kind} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="small-caps text-paper/40 dark:text-ink/40 mb-1">{label}</div>
        <div className="font-display font-bold text-base sm:text-lg text-paper dark:text-ink truncate">
          {value}
        </div>
      </div>
      {href && (
        <span className="small-caps text-paper/40 dark:text-ink/40 group-hover:text-paper dark:group-hover:text-ink transition-colors hidden sm:inline">
          →
        </span>
      )}
    </Wrapper>
  );
};

export function Footer() {
  return (
    <footer className="bg-ink text-paper dark:bg-canvas dark:text-ink px-6 lg:px-12 py-20 lg:py-28">
      <div className="max-w-screen-xl mx-auto">
        {/* Logo + heading */}
        <div className="grid lg:grid-cols-12 gap-12 mb-12">
          <div className="lg:col-span-5">
            <Logo className="text-paper dark:text-ink mb-6" />
            <p className="text-paper/60 dark:text-ink/60 text-sm leading-relaxed max-w-md">
              Contextive is a language intelligence system. We track the words that move
              markets, shape policy, and frame perception — and explain what each one is
              doing.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="small-caps text-paper/40 dark:text-ink/40 mb-2">// CHANNELS</div>
            <SocialRow
              label="WEB"
              value="contextive.ai"
              kind="web"
            />
            <SocialRow
              label="SUBSTACK"
              value="open.substack.com/pub/contextive"
              href={SOCIAL_LINKS.substack}
              kind="substack"
            />
            <SocialRow
              label="X / TWITTER"
              value="x.com/contextive_ai"
              href={SOCIAL_LINKS.twitter}
              kind="twitter"
            />
            <SocialRow
              label="INSTAGRAM"
              value="www.instagram.com/contextive.ai"
              href={SOCIAL_LINKS.instagram}
              kind="instagram"
            />
          </div>
        </div>

        {/* Bottom strip */}
        <div className="pt-10 border-t border-paper/15 dark:border-ink/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 small-caps text-paper/40 dark:text-ink/40">
          <div className="flex flex-col gap-1">
            <span>© 2026 CONTEXTIVE INTELLIGENCE</span>
            <span>SIGNAL ARCHIVE // LONDON · SF</span>
          </div>
          <div className="flex gap-8">
            <a href="#thesis" className="hover:text-paper dark:hover:text-ink transition-colors">PROTOCOL</a>
            <a href="#archive" className="hover:text-paper dark:hover:text-ink transition-colors">ARCHIVE</a>
            <a href="#system" className="hover:text-paper dark:hover:text-ink transition-colors">STATUS</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
