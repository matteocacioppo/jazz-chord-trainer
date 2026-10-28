import { createContext, useContext } from 'react';

export type Lang = 'en' | 'it';
export type Localized = Record<Lang, string>;

const en = {
  'nav.explore': 'Explore',
  'nav.quiz': 'Quiz',
  'nav.stats': 'Stats',
  'top.solfege': 'Do Re Mi',
  'top.midiSound': 'MIDI sound',
  'top.language': 'Language',
  'aria.keyboard': 'Keyboard',
  'aria.staff': 'Sheet music',

  'audio.idle': 'Audio',
  'audio.loading': 'Loading piano…',
  'audio.ready': 'Piano ready',
  'audio.error': 'Audio unavailable',

  'midi.unsupported': 'MIDI not supported',
  'midi.unsupportedHint': 'Use Chrome or Edge',
  'midi.denied': 'MIDI blocked',
  'midi.pending': 'MIDI…',
  'midi.none': 'No MIDI',

  'explore.root': 'Root',
  'explore.type': 'Chord type',
  'explore.playChord': '▶ Chord',
  'explore.arpeggio': '♪ Arpeggio',
  'explore.playing': 'What you’re playing',
  'explore.playHint': 'Play something on your MIDI keyboard: you’ll see the notes and the recognized chord here.',
  'explore.noMatch': 'No chord recognized.',
  'explore.openChord': 'Open this chord',

  'legend.optional': 'Dashed border = optional note',
  'chip.optional': 'Optional note in the voicing',

  'quiz.verify': '✓ Check selection',
  'quiz.reveal': 'Reveal',
  'quiz.selfRight': 'I played it right',
  'quiz.selfWrong': 'Wrong',
  'quiz.next': 'Next',
  'quiz.listen': '▶ Listen',
  'quiz.skip': 'Skip',
  'quiz.kbdEnter': 'Enter',
  'quiz.hintMidi': 'Play the chord on your MIDI keyboard: it’s checked automatically.',
  'quiz.hintNoMidi': 'No MIDI: click the keys to select notes and press “Check”, or play it on the piano and press “Reveal”.',
  'quiz.correct': '✓ Correct!',
  'quiz.notYet': '✗ Not yet.',
  'quiz.missing1': 'Missing 1 note',
  'quiz.missingN': 'Missing {n} notes',
  'quiz.extras': 'Wrong notes:',
  'quiz.whichDegrees': 'which degrees?',
  'quiz.solution': 'Here’s the solution.',
  'quiz.listening': 'Listening on MIDI…',
  'quiz.playIt': 'Play it on the piano!',
  'quiz.statCorrect': 'correct',
  'quiz.statAccuracy': 'accuracy',
  'quiz.statStreak': 'streak (best {n})',

  'settings.title': 'Quiz settings',
  'settings.categories': 'Categories',
  'settings.roots': 'Roots',
  'settings.all': 'all',
  'settings.naturals': 'naturals only',
  'settings.show': 'Show',
  'settings.symbol': 'Symbol',
  'settings.staff': 'Staff',
  'settings.both': 'Both',
  'settings.voicing': 'Solution voicing',
  'settings.rootOptional': 'Root optional',
  'settings.rootOptionalHint': 'Accept rootless voicings',
  'settings.autoAdvance': 'Auto-advance',
  'settings.autoAdvanceHint': 'After a correct answer',
  'settings.smart': 'Smart review',
  'settings.smartHint': 'Repeats the chords you miss more often',

  'stats.tried': 'chords tried',
  'stats.firstTry': 'on first try',
  'stats.avgTime': 'average time',
  'stats.bestStreak': 'best streak',
  'stats.byType': 'By chord type',
  'stats.hardestFirst': '· hardest first',
  'stats.reset': 'Reset',
  'stats.resetConfirm': 'Reset all statistics?',
  'stats.empty': 'No data yet: do a few rounds in the Quiz.',
  'stats.colChord': 'Chord',
  'stats.colCategory': 'Category',
  'stats.colAttempts': 'Attempts',
  'stats.colAccuracy': 'Accuracy',
  'stats.colAvgTime': 'Avg time',
};

export type I18nKey = keyof typeof en;

const it: Record<I18nKey, string> = {
  'nav.explore': 'Esplora',
  'nav.quiz': 'Quiz',
  'nav.stats': 'Statistiche',
  'top.solfege': 'Do Re Mi',
  'top.midiSound': 'Suono MIDI',
  'top.language': 'Lingua',
  'aria.keyboard': 'Tastiera',
  'aria.staff': 'Spartito',

  'audio.idle': 'Audio',
  'audio.loading': 'Carico piano…',
  'audio.ready': 'Piano pronto',
  'audio.error': 'Audio non disponibile',

  'midi.unsupported': 'MIDI non supportato',
  'midi.unsupportedHint': 'Usa Chrome o Edge',
  'midi.denied': 'MIDI bloccato',
  'midi.pending': 'MIDI…',
  'midi.none': 'Nessun MIDI',

  'explore.root': 'Fondamentale',
  'explore.type': 'Tipo di accordo',
  'explore.playChord': '▶ Accordo',
  'explore.arpeggio': '♪ Arpeggio',
  'explore.playing': 'Cosa stai suonando',
  'explore.playHint': 'Suona qualcosa sulla tastiera MIDI: qui vedrai le note e l’accordo riconosciuto.',
  'explore.noMatch': 'Nessun accordo riconosciuto.',
  'explore.openChord': 'Apri questo accordo',

  'legend.optional': 'Bordo tratteggiato = nota opzionale',
  'chip.optional': 'Nota opzionale nel voicing',

  'quiz.verify': '✓ Verifica selezione',
  'quiz.reveal': 'Rivela',
  'quiz.selfRight': 'L’ho suonato giusto',
  'quiz.selfWrong': 'Sbagliato',
  'quiz.next': 'Prossimo',
  'quiz.listen': '▶ Ascolta',
  'quiz.skip': 'Salta',
  'quiz.kbdEnter': 'Invio',
  'quiz.hintMidi': 'Suona l’accordo sulla tastiera MIDI: la verifica è automatica.',
  'quiz.hintNoMidi': 'Senza MIDI: clicca i tasti per selezionare le note e premi “Verifica”, oppure suona al piano e premi “Rivela”.',
  'quiz.correct': '✓ Corretto!',
  'quiz.notYet': '✗ Non ancora.',
  'quiz.missing1': 'Manca 1 nota',
  'quiz.missingN': 'Mancano {n} note',
  'quiz.extras': 'Note estranee:',
  'quiz.whichDegrees': 'quali gradi?',
  'quiz.solution': 'Ecco la soluzione.',
  'quiz.listening': 'In ascolto sul MIDI…',
  'quiz.playIt': 'Suonalo al piano!',
  'quiz.statCorrect': 'corretti',
  'quiz.statAccuracy': 'precisione',
  'quiz.statStreak': 'serie (record {n})',

  'settings.title': 'Impostazioni quiz',
  'settings.categories': 'Categorie',
  'settings.roots': 'Fondamentali',
  'settings.all': 'tutte',
  'settings.naturals': 'solo naturali',
  'settings.show': 'Mostra',
  'settings.symbol': 'Sigla',
  'settings.staff': 'Spartito',
  'settings.both': 'Entrambi',
  'settings.voicing': 'Voicing della soluzione',
  'settings.rootOptional': 'Fondamentale opzionale',
  'settings.rootOptionalHint': 'Accetta voicing rootless',
  'settings.autoAdvance': 'Avanza da solo',
  'settings.autoAdvanceHint': 'Dopo una risposta corretta',
  'settings.smart': 'Ripasso intelligente',
  'settings.smartHint': 'Ripropone più spesso gli accordi che sbagli',

  'stats.tried': 'accordi provati',
  'stats.firstTry': 'al primo colpo',
  'stats.avgTime': 'tempo medio',
  'stats.bestStreak': 'serie record',
  'stats.byType': 'Per tipo di accordo',
  'stats.hardestFirst': '· i più difficili in alto',
  'stats.reset': 'Azzera',
  'stats.resetConfirm': 'Azzerare tutte le statistiche?',
  'stats.empty': 'Ancora nessun dato: fai qualche giro nel Quiz.',
  'stats.colChord': 'Accordo',
  'stats.colCategory': 'Categoria',
  'stats.colAttempts': 'Tentativi',
  'stats.colAccuracy': 'Precisione',
  'stats.colAvgTime': 'Tempo medio',
};

const DICTS: Record<Lang, Record<I18nKey, string>> = { en, it };

export const LANGUAGES: { id: Lang; label: string }[] = [
  { id: 'en', label: 'English' },
  { id: 'it', label: 'Italiano' },
];

export const LangContext = createContext<Lang>('en');

export function useT() {
  const lang = useContext(LangContext);
  const t = (key: I18nKey, vars?: Record<string, string | number>) =>
    DICTS[lang][key].replace(/\{(\w+)\}/g, (_, v) => String(vars?.[v] ?? ''));
  return { lang, t };
}
