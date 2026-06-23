import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { SectionReveal } from './components/SectionReveal';
import { Hero } from './components/Hero';
import { CampaignIndex } from './components/CampaignIndex';
import { FinalCTA } from './components/FinalCTA';
import { CampaignPage } from './components/CampaignPage';
import { HowItWorks } from './components/HowItWorks';
import { HowItWorksTeaser } from './components/HowItWorksTeaser';
import { ApiTeaser } from './components/ApiTeaser';
import { Waitlist } from './components/Waitlist';
import { Analytics } from '@vercel/analytics/react';

function HomePage() {
  const { hash } = useLocation();

  // Deep-link / cross-page jump to the campaign section (the "Campaigns" nav item).
  useEffect(() => {
    if (hash !== '#campaigns') return;
    const t = setTimeout(() => {
      document.getElementById('campaigns')?.scrollIntoView({ behavior: 'smooth' });
    }, 80);
    return () => clearTimeout(t);
  }, [hash]);

  return (
    <main>
      <SectionReveal>
        <Hero />
      </SectionReveal>
      <SectionReveal>
        <CampaignIndex />
      </SectionReveal>
      <SectionReveal>
        <HowItWorksTeaser />
      </SectionReveal>
      <SectionReveal>
        <ApiTeaser />
      </SectionReveal>
      <SectionReveal>
        <FinalCTA />
      </SectionReveal>
    </main>
  );
}

function App() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/waitlist" element={<Waitlist />} />
        <Route path="/campaigns/:id" element={<CampaignPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
      <Analytics />
    </div>
  );
}

export default App;
