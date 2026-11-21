import { Community } from './components/Community';
import { FanNotice } from './components/FanNotice';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PeoplesSetlist } from './components/PeoplesSetlist';
import { RadioPlayer } from './components/RadioPlayer';
import { RadioSection } from './components/RadioSection';
import { SetlistBuilder } from './components/SetlistBuilder';
import { Toasts } from './components/Toasts';
import { VideoDock } from './components/VideoDock';
import { Wildcards } from './components/Wildcards';
import { RadioProvider } from './state/radio';
import { StoreProvider } from './state/store';

export default function App() {
  return (
    <StoreProvider>
      <RadioProvider>
        <a className="skip-link" href="#crear">
          Saltar al creador de setlists
        </a>
        <Header />
        <main>
          <Hero />
          <FanNotice />
          <RadioSection />
          <PeoplesSetlist />
          <SetlistBuilder />
          <Community />
          <Wildcards />
        </main>
        <Footer />
        <RadioPlayer />
        <VideoDock />
        <Toasts />
      </RadioProvider>
    </StoreProvider>
  );
}
