import { useEffect } from 'react';
import { useTweaks } from './hooks/useTweaks';
import { useReveal } from './hooks/useReveal';
import { useActiveSection } from './hooks/useActiveSection';
import { hexToRgba } from './utils/color';

import { LeftRail } from './components/layout/LeftRail';
import { TopNav } from './components/layout/TopNav';
import { StatusPill } from './components/layout/StatusPill';

import { Hero } from './components/sections/Hero';
import { About } from './components/sections/About';
import { Stats } from './components/sections/Stats';
import { Skills } from './components/sections/Skills';
import { Projects } from './components/sections/Projects';
import { ContactResume } from './components/sections/ContactResume';
import { Footer } from './components/sections/Footer';

import { TweaksPanel } from './components/tweaks/TweaksPanel';
import { TweakSection, TweakToggle, TweakColor, TweakSelect, TweakRadio } from './components/tweaks/controls';

import tweakDefaults from './data/tweakDefaults.json';

type Tweaks = typeof tweakDefaults;

export function App() {
  const [t, setTweak] = useTweaks<Tweaks>(tweakDefaults);
  useReveal();
  const active = useActiveSection(['home', 'about', 'skills', 'work', 'contact']);

  useEffect(() => {
    const b = document.body;
    b.style.setProperty('--accent', t.accent);
    b.style.setProperty('--accent-soft', hexToRgba(t.accent, 0.14));

    b.classList.toggle('light', !t.dark);

    b.classList.remove('dense', 'airy');
    if (t.density === 'compact') b.classList.add('dense');
    if (t.density === 'airy') b.classList.add('airy');

    b.classList.remove('calm', 'energetic', 'no-motion');
    if (t.motion === 'minimal') { b.classList.add('no-motion'); b.classList.add('calm'); }
    if (t.motion === 'balanced') b.classList.add('calm');
    if (t.motion === 'energetic') b.classList.add('energetic');

    b.classList.remove('family-sans', 'family-mono');
    if (t.family === 'sans') b.classList.add('family-sans');
    if (t.family === 'mono') b.classList.add('family-mono');

    b.classList.remove('hue-charcoal', 'hue-wine', 'hue-forest');
    if (t.hue === 'charcoal') b.classList.add('hue-charcoal');
    if (t.hue === 'wine') b.classList.add('hue-wine');
    if (t.hue === 'forest') b.classList.add('hue-forest');
  }, [t]);

  return (
    <>
      <LeftRail />
      <TopNav active={active} />
      <StatusPill />

      <main>
        <Hero />
        <About />
        <Stats />
        <Skills />
        <Projects />
        <ContactResume />
        <Footer />
      </main>

      {import.meta.env.DEV && (
        <TweaksPanel>
          <TweakSection label="Theme" />
          <TweakToggle label="Dark mode" value={t.dark as boolean} onChange={(v) => setTweak('dark', v as Tweaks['dark'])} />
          <TweakColor
            label="Accent"
            value={t.accent as string}
            options={['#e07a5f', '#d4af37', '#7ad0c2', '#c8d0d8', '#a78bfa', '#ff5e7e']}
            onChange={(v) => setTweak('accent', v as Tweaks['accent'])}
          />
          <TweakSelect
            label="Background hue"
            value={t.hue as string}
            options={['teal', 'charcoal', 'wine', 'forest']}
            onChange={(v) => setTweak('hue', v as Tweaks['hue'])}
          />

          <TweakSection label="Typography" />
          <TweakRadio
            label="Display family"
            value={t.family as string}
            options={['serif', 'sans', 'mono']}
            onChange={(v) => setTweak('family', v as Tweaks['family'])}
          />

          <TweakSection label="Layout & motion" />
          <TweakRadio
            label="Density"
            value={t.density as string}
            options={['compact', 'regular', 'airy']}
            onChange={(v) => setTweak('density', v as Tweaks['density'])}
          />
          <TweakSelect
            label="Animation"
            value={t.motion as string}
            options={['minimal', 'balanced', 'energetic']}
            onChange={(v) => setTweak('motion', v as Tweaks['motion'])}
          />
        </TweaksPanel>
      )}
    </>
  );
}
