import { useEffect } from 'react';
import { Community } from './components/Community';
import { FanNotice } from './components/FanNotice';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { OpeningAct } from './components/OpeningAct';
import { PeoplesSetlist } from './components/PeoplesSetlist';
import { RadioPlayer } from './components/RadioPlayer';
import { RadioSection } from './components/RadioSection';
import { SetlistBuilder } from './components/SetlistBuilder';
import { Toasts } from './components/Toasts';
import { VideoDock } from './components/VideoDock';
import { Wildcards } from './components/Wildcards';
import { scrollToId } from './lib/format';
import { consumeReturnToBuilder } from './services/auth';
import { AuthProvider, useAuth } from './state/auth';
import { RadioProvider } from './state/radio';
import { StoreProvider, useStore } from './state/store';

/** After coming back from Google: confirm the login and take the visitor to their draft. */
function AfterLogin() {
  const { status, user } = useAuth();
  const { notify } = useStore();

  useEffect(() => {
    if (status !== 'ready') return;
    const wasLoggingIn = consumeReturnToBuilder();
    if (!wasLoggingIn || !user) return;
    notify(user.firstName ? `¡Sesión iniciada, ${user.firstName}! Ya podés publicar.` : '¡Sesión iniciada! Ya podés publicar.', 'success');
    window.setTimeout(() => scrollToId('crear'), 400);
  }, [status, user, notify]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
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
            <OpeningAct />
            <Wildcards />
          </main>
          <Footer />
          <RadioPlayer />
          <VideoDock />
          <Toasts />
          <AfterLogin />
        </RadioProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
