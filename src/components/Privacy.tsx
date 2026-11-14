import { useEffect } from 'react';
import { Link } from 'react-router-dom';

// Where people send access, correction and deletion requests.
export const PRIVACY_CONTACT = 'courtney@contextive.info';
const UPDATED = '14 November 2026';

const SECTIONS: { title: string; body: React.ReactNode }[] = [
  {
    title: 'What we collect',
    body: (
      <>
        When you sign up: your first name and email. If you choose to add them: your last name, a ZIP or postal
        code, and a word you would like us to measure. We also note which form you used and, if you arrived from one
        of our ads, that ad&rsquo;s link tags. For a US ZIP code we look up the city and state.
      </>
    ),
  },
  {
    title: 'Why',
    body: (
      <>
        To run Contextive: to email you about early access or the dispatch you asked for, to see where our readers are,
        and to decide which words to measure next. We do not sell or rent your details.
      </>
    ),
  },
  {
    title: 'Who handles it',
    body: (
      <>
        Vercel hosts the site and receives the form. Sign-ups are stored in a Google Sheet. A US ZIP code, and nothing
        else, is sent to zippopotam.us to look up the city and state. If you also subscribe to the dispatch, you do
        that on Substack, under Substack&rsquo;s own terms.
      </>
    ),
  },
  {
    title: 'Analytics and storage in your browser',
    body: (
      <>
        Vercel Web Analytics counts page views without cookies. If you arrive from one of our ads, your browser keeps
        that ad&rsquo;s link tags for the visit (session storage) so a sign-up can be matched to the ad; they clear when
        you close the tab.
      </>
    ),
  },
  {
    title: 'Your choices',
    body: (
      <>
        Email <a href={`mailto:${PRIVACY_CONTACT}`} className="underline underline-offset-2 hover:text-ink">{PRIVACY_CONTACT}</a>{' '}
        to see, correct or delete what we hold about you, or to be taken off our list.
      </>
    ),
  },
];

export function Privacy() {
  useEffect(() => {
    window.scrollTo(0, 0);
    const prev = document.title;
    document.title = 'Privacy — Contextive';
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <main className="bg-paper text-ink px-6 lg:px-12 py-12 lg:py-16">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-3">
          <Link to="/" className="small-caps text-muted hover:text-ink transition-colors">
            <span aria-hidden>←</span> Contextive
          </Link>
          <h1 className="font-display font-bold tracking-tight text-4xl sm:text-5xl leading-[0.98]">Privacy</h1>
          <p className="small-caps text-muted text-[11px]">Updated {UPDATED}</p>
        </div>
        <div className="divide-y divide-rule border-y border-rule">
          {SECTIONS.map((s) => (
            <section key={s.title} className="py-5 space-y-2">
              <h2 className="small-caps text-ink">{s.title}</h2>
              <p className="text-[15px] text-muted leading-relaxed">{s.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
