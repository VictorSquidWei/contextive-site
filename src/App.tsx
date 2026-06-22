import { Routes, Route, Navigate } from 'react-router-dom';
import { Nav } from './components/Nav';
import { Footer } from './components/Footer';
import { SectionReveal } from './components/SectionReveal';
import { Hero } from './components/Hero';
import { CampaignIndex } from './components/CampaignIndex';
import { FinalCTA } from './components/FinalCTA';
import { CampaignPage } from './components/CampaignPage';
import { HowItWorks } from './components/HowItWorks';

function HomePage() {
  return (
    <main>
      <SectionReveal>
        <Hero />
      </SectionReveal>
      <SectionReveal>
        <CampaignIndex />
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
        <Route path="/campaigns/:id" element={<CampaignPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
