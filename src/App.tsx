import { Nav } from './components/Nav';
import { SectionReveal } from './components/SectionReveal';
import { Hero } from './components/Hero';
import { Ticker } from './components/Ticker';
import { Thesis } from './components/Thesis';
import { Archive } from './components/Archive';
import { Manifesto } from './components/Manifesto';
import { Campaigns } from './components/Campaigns';
import { System } from './components/System';
import { FinalCTA } from './components/FinalCTA';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <Nav />
      <main>
        <SectionReveal><Hero /></SectionReveal>
        <SectionReveal><Ticker /></SectionReveal>
        <SectionReveal><Thesis /></SectionReveal>
        <SectionReveal><Archive /></SectionReveal>
        <SectionReveal><Manifesto /></SectionReveal>
        <SectionReveal><Campaigns /></SectionReveal>
        <SectionReveal><System /></SectionReveal>
        <SectionReveal><FinalCTA /></SectionReveal>
      </main>
      <SectionReveal><Footer /></SectionReveal>
    </div>
  );
}

export default App;
