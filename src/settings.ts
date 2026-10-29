import type { Lang, Localized } from './i18n';
import type { ClefMode, Hands, Level } from './reading/exercise';
import type { CategoryId } from './theory/chords';
import { noteKey, ROOTS } from './theory/notes';
import type { VoicingStyle } from './theory/voicing';

export type PromptMode = 'symbol' | 'staff';

export interface QuizSettings {
  categories: CategoryId[];
  roots: string[];
  prompt: PromptMode;
  rootOptional: boolean;
  autoAdvance: boolean;
  smart: boolean;
}

export interface ReadingSettings {
  clef: ClefMode;
  hands: Hands;
  level: Level;
  tempo: boolean;
  bpm: number;
  showNames: boolean;
  anyOctave: boolean;
}

export interface Settings {
  lang: Lang;
  italian: boolean;
  voicing: VoicingStyle;
  midiEcho: boolean;
  quiz: QuizSettings;
  reading: ReadingSettings;
}

export const DEFAULT_SETTINGS: Settings = {
  lang: 'en',
  italian: false,
  voicing: 'shell',
  midiEcho: false,
  quiz: {
    categories: ['settime', 'none'],
    roots: ROOTS.map(noteKey),
    prompt: 'symbol',
    rootOptional: true,
    autoAdvance: true,
    smart: true,
  },
  reading: {
    clef: 'treble',
    hands: 1,
    level: 1,
    tempo: false,
    bpm: 60,
    showNames: false,
    anyOctave: false,
  },
};

export interface StatEntry {
  label: string;
  /** Stringa semplice nei dati salvati prima dell'aggiunta delle lingue. */
  name: Localized | string;
  category: CategoryId;
  attempts: number;
  correct: number;
  /** Somma dei tempi delle risposte corrette, in ms. */
  totalMs: number;
}

export interface Stats {
  types: Record<string, StatEntry>;
  bestStreak: number;
}

export const EMPTY_STATS: Stats = { types: {}, bestStreak: 0 };
