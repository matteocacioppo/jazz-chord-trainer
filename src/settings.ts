import type { CategoryId } from './theory/chords';
import { noteKey, ROOTS } from './theory/notes';
import type { VoicingStyle } from './theory/voicing';

export type PromptMode = 'symbol' | 'staff' | 'both';

export interface QuizSettings {
  categories: CategoryId[];
  roots: string[];
  prompt: PromptMode;
  rootOptional: boolean;
  autoAdvance: boolean;
  smart: boolean;
}

export interface Settings {
  italian: boolean;
  voicing: VoicingStyle;
  midiEcho: boolean;
  quiz: QuizSettings;
}

export const DEFAULT_SETTINGS: Settings = {
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
};

export interface StatEntry {
  label: string;
  name: string;
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
