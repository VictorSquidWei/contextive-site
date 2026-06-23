import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Logo } from './Logo';
import { ThemeToggle } from './ThemeToggle';
import { SOCIAL_LINKS } from '../data/terms';

const LINKS = [
  { to: '/#campaigns', label: 'Campaigns' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/waitlist', label: 'API' },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // "Campaigns" jumps to the homepage campaign section: scroll in place if already
  // home, otherwise let the link navigate to /#campaigns (HomePage scrolls on mount).
  function handleNavClick(e: React.MouseEvent, to: string) {
    if (to === '/#campaigns' && location.pathname === '/') {
      e.preventDefault();
      document.getElementById('campaigns')?.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  }

  return (
    <nav
      className={`sticky top-0 z-50 transition-colors duration-300 ${
        scrolled || menuOpen
          ? 'bg-paper/85 backdrop-blur-md border-b border-rule'
          : 'bg-paper border-b border-transparent'
      }`}
    >
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-6 lg:px-12 py-5">
        <Link to="/" className="text-ink hover:opacity-70 transition-opacity">
          <Logo size="lg" />
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-10">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={(e) => handleNavClick(e, l.to)}
              className="small-caps text-muted hover:text-ink transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <a
            href={SOCIAL_LINKS.substack}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-2 small-caps text-ink border border-ink px-4 py-2 hover:bg-ink hover:text-paper transition-colors"
          >
            Subscribe
          </a>

          {/* Mobile menu toggle */}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            className="md:hidden inline-flex flex-col justify-center gap-[5px] w-10 h-10 items-center border border-rule hover:border-ink transition-colors"
          >
            <span
              className={`block w-4 h-px bg-ink transition-transform duration-200 ${
                menuOpen ? 'translate-y-[6px] rotate-45' : ''
              }`}
            />
            <span
              className={`block w-4 h-px bg-ink transition-opacity duration-200 ${
                menuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`block w-4 h-px bg-ink transition-transform duration-200 ${
                menuOpen ? '-translate-y-[6px] -rotate-45' : ''
              }`}
            />
          </button>
        </div>
      </div>

      {/* Mobile menu panel */}
      <div
        className={`md:hidden overflow-hidden border-t border-rule transition-[max-height,opacity] duration-300 ease-out ${
          menuOpen ? 'max-h-72 opacity-100' : 'max-h-0 opacity-0 border-transparent'
        }`}
      >
        <div className="px-6 py-4 flex flex-col gap-1">
          {LINKS.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              onClick={(e) => handleNavClick(e, l.to)}
              className="small-caps text-muted hover:text-ink py-3 border-b border-rule transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={SOCIAL_LINKS.substack}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center justify-center gap-2 small-caps text-paper bg-ink px-4 py-3 hover:bg-ink/85 transition-colors"
          >
            Subscribe
          </a>
        </div>
      </div>
    </nav>
  );
}
