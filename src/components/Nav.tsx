import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { SOCIAL_LINKS } from '../data/terms';

export function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? 'bg-paper/85 backdrop-blur-md border-b border-rule'
          : 'bg-paper border-b border-transparent'
      }`}
    >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 lg:px-12 py-5">
        <Link to="/" className="text-ink hover:opacity-70 transition-opacity">
          <Logo size="lg" />
        </Link>

        <div className="hidden md:flex items-center gap-10">
          <Link to="/" className="small-caps text-muted hover:text-ink transition-colors">
            Campaigns
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href={SOCIAL_LINKS.substack}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 small-caps text-ink border border-ink px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
          >
            Subscribe
          </a>
        </div>
      </div>
    </nav>
  );
}
