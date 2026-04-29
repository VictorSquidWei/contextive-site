import { Nav } from './components/Nav';
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
        <Hero />
        <Ticker />
        <Thesis />
        <Archive />
        <Manifesto />
        <Campaigns />
        <System />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}

export default App;
