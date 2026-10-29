import { useEffect, useRef } from 'react';
import { loadPiano, noteOff, noteOn, unlockAudio, usePianoStatus } from './audio/piano';
import { LanguageMenu } from './components/LanguageMenu';
import { useLocalStorage } from './hooks/useLocalStorage';
import { LangContext, useT, type I18nKey } from './i18n';
import { useMidi, type MidiState } from './midi/useMidi';
import { Explore } from './pages/Explore';
import { Quiz, Switch } from './pages/Quiz';
import { Reading } from './pages/Reading';
import { StatsPage } from './pages/StatsPage';
import { DEFAULT_SETTINGS, EMPTY_STATS, type Settings, type Stats } from './settings';

type Page = 'explore' | 'quiz' | 'reading' | 'stats';

const PAGES: { id: Page; label: I18nKey }[] = [
  { id: 'explore', label: 'nav.explore' },
  { id: 'quiz', label: 'nav.quiz' },
  { id: 'reading', label: 'nav.reading' },
  { id: 'stats', label: 'nav.stats' },
];

export default function App() {
  const [settings, setSettings] = useLocalStorage<Settings>('jct.settings', DEFAULT_SETTINGS);

  useEffect(() => {
    document.documentElement.lang = settings.lang;
  }, [settings.lang]);

  return (
    <LangContext.Provider value={settings.lang}>
      <Shell settings={settings} setSettings={setSettings} />
    </LangContext.Provider>
  );
}

function Shell({ settings, setSettings }: { settings: Settings; setSettings: (fn: (s: Settings) => Settings) => void }) {
  const { t } = useT();
  const [page, setPage] = useLocalStorage<Page>('jct.page', 'explore');
  const [stats, setStats] = useLocalStorage<Stats>('jct.stats', EMPTY_STATS);
  const pianoStatus = usePianoStatus();

  const echo = useRef(settings.midiEcho);
  echo.current = settings.midiEcho;
  const midi = useMidi({
    onNoteOn: (n, v) => echo.current && noteOn(n, v),
    onNoteOff: (n) => echo.current && noteOff(n),
  });

  useEffect(() => {
    loadPiano().catch(() => {});
    // L'audio del browser parte solo dopo un gesto dell'utente.
    const unlock = () => unlockAudio().catch(() => {});
    window.addEventListener('pointerdown', unlock, { once: true });
    window.addEventListener('keydown', unlock, { once: true });
    return () => {
      window.removeEventListener('pointerdown', unlock);
      window.removeEventListener('keydown', unlock);
    };
  }, []);

  const playNote = (m: number) => {
    noteOn(m, 0.7);
    setTimeout(() => noteOff(m), 900);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <Logo />
          <span>
            Jazz Chord <b>Trainer</b>
          </span>
        </div>
        <nav className="tabs">
          {PAGES.map((p) => (
            <button key={p.id} className={page === p.id ? 'active' : ''} onClick={() => setPage(p.id)}>
              {t(p.label)}
            </button>
          ))}
        </nav>
        <div className="top-right">
          <Switch checked={settings.italian} onChange={(v) => setSettings((s) => ({ ...s, italian: v }))} label={t('top.solfege')} />
          <Switch checked={settings.midiEcho} onChange={(v) => setSettings((s) => ({ ...s, midiEcho: v }))} label={t('top.midiSound')} />
          <MidiPill midi={midi} />
          <span className={`pill status-pill ${pianoStatus}`}>
            {t(`audio.${pianoStatus}`)}
          </span>
          <LanguageMenu onChange={(lang) => setSettings((s) => ({ ...s, lang }))} />
        </div>
      </header>

      <main>
        {page === 'explore' && <Explore settings={settings} midiActive={midi.active} onPlayNote={playNote} />}
        {page === 'quiz' && (
          <Quiz settings={settings} setSettings={setSettings} stats={stats} setStats={setStats} midi={midi} onPlayNote={playNote} />
        )}
        {page === 'reading' && <Reading settings={settings} setSettings={setSettings} midi={midi} onPlayNote={playNote} />}
        {page === 'stats' && <StatsPage stats={stats} setStats={setStats} />}
      </main>
    </div>
  );
}

function MidiPill({ midi }: { midi: MidiState }) {
  const { status, inputs } = midi;
  const { t } = useT();
  if (status === 'unsupported') return <span className="pill status-pill error" title={t('midi.unsupportedHint')}>{t('midi.unsupported')}</span>;
  if (status === 'denied') return <span className="pill status-pill error">{t('midi.denied')}</span>;
  if (status === 'pending') return <span className="pill status-pill loading">{t('midi.pending')}</span>;
  if (!inputs.length) return <span className="pill status-pill idle">{t('midi.none')}</span>;
  return (
    <span className="pill status-pill ready" title={inputs.join(', ')}>
      {inputs[0]}
    </span>
  );
}

function Logo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="8" fill="url(#lg)" />
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#7c5cff" />
          <stop offset="1" stopColor="#22d3ee" />
        </linearGradient>
      </defs>
      <rect x="6" y="8" width="5" height="16" rx="1.2" fill="#fff" />
      <rect x="13.5" y="8" width="5" height="16" rx="1.2" fill="#fff" opacity=".85" />
      <rect x="21" y="8" width="5" height="16" rx="1.2" fill="#fff" />
      <rect x="10" y="8" width="3" height="9" rx="1" fill="#141821" />
      <rect x="19" y="8" width="3" height="9" rx="1" fill="#141821" />
    </svg>
  );
}
