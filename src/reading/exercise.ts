import { LETTER_PC, LETTERS, mod, type Note } from '../theory/notes';

export type Clef = 'treble' | 'bass';
export type ClefMode = Clef | 'both';
export type Hands = 1 | 2;
export type Level = 1 | 2 | 3;

export interface ReadNote {
  note: Note;
  octave: number;
  midi: number;
  clef: Clef;
}

/** Un battito: una nota (una mano) o due note simultanee (due mani). */
export interface Step {
  notes: ReadNote[];
}

/** 4 battute di 4/4 in semiminime. */
export const STEPS = 16;
export const BEATS_PER_MEASURE = 4;

/** Indice diatonico (lettera + 7·ottava), es. "C4" → 28. */
const dia = (s: string) => LETTERS.indexOf(s[0] as (typeof LETTERS)[number]) + 7 * Number(s.slice(1));
const MIDDLE_C = dia('C4');

const RANGES: Record<Clef | 'grand', Record<Level, [string, string]>> = {
  treble: { 1: ['C4', 'G4'], 2: ['C4', 'A5'], 3: ['A3', 'C6'] },
  bass: { 1: ['C3', 'G3'], 2: ['F2', 'C4'], 3: ['C2', 'E4'] },
  // Una mano sul grande rigo: la melodia passa da una chiave all'altra.
  grand: { 1: ['C3', 'G4'], 2: ['F2', 'A5'], 3: ['C2', 'C6'] },
};

/** Salto massimo tra note consecutive, in gradi. */
const MAX_LEAP: Record<Level, number> = { 1: 2, 2: 4, 3: 5 };

type Rand = () => number;

function walk(range: [string, string], level: Level, rand: Rand): number[] {
  const [lo, hi] = range.map(dia);
  const max = MAX_LEAP[level];
  let d = lo + Math.floor(rand() * (hi - lo + 1));
  const out: number[] = [];
  for (let i = 0; i < STEPS; i++) {
    out.push(d);
    let next: number;
    do next = d + Math.floor(rand() * (2 * max + 1)) - max;
    while (next < lo || next > hi || (next === d && rand() < 0.75)); // poche note ripetute
    d = next;
  }
  return out;
}

function makeNote(d: number, level: Level, rand: Rand, clef?: Clef): ReadNote {
  const letter = mod(d, 7);
  const octave = Math.floor(d / 7);
  let acc = 0;
  if (level === 3 && rand() < 0.25) {
    acc = rand() < 0.5 ? 1 : -1;
    // Niente E♯/B♯/C♭/F♭: corretti ma inutilmente insidiosi a questo livello.
    if (acc === 1 && (letter === 2 || letter === 6)) acc = -1;
    else if (acc === -1 && (letter === 0 || letter === 3)) acc = 1;
  }
  return {
    note: { letter, acc },
    octave,
    midi: (octave + 1) * 12 + LETTER_PC[letter] + acc,
    clef: clef ?? (d >= MIDDLE_C ? 'treble' : 'bass'),
  };
}

export function generateExercise(opts: { clef: ClefMode; hands: Hands; level: Level }, rand: Rand = Math.random): Step[] {
  const { clef, level } = opts;
  if (clef === 'both' && opts.hands === 2) {
    const rh = walk(RANGES.treble[level], level, rand);
    const lh = walk(RANGES.bass[level], level, rand);
    return rh.map((d, i) => ({ notes: [makeNote(lh[i], level, rand, 'bass'), makeNote(d, level, rand, 'treble')] }));
  }
  if (clef === 'both') return walk(RANGES.grand[level], level, rand).map((d) => ({ notes: [makeNote(d, level, rand)] }));
  return walk(RANGES[clef][level], level, rand).map((d) => ({ notes: [makeNote(d, level, rand, clef)] }));
}

export const matches = (expected: number, played: number, anyOctave: boolean) =>
  anyOctave ? mod(expected - played, 12) === 0 : expected === played;
