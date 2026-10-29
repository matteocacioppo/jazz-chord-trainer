export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const;
export const ITALIAN = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'] as const;
export const LETTER_PC = [0, 2, 4, 5, 7, 9, 11];

/** Nota "scritta": lettera (0 = C … 6 = B) + alterazione (-2 … +2). */
export interface Note {
  letter: number;
  acc: number;
}

export const mod = (n: number, m: number) => ((n % m) + m) % m;

export function parseNote(s: string): Note {
  const letter = LETTERS.indexOf(s[0].toUpperCase() as (typeof LETTERS)[number]);
  if (letter < 0) throw new Error(`Nota non valida: ${s}`);
  let acc = 0;
  for (const ch of s.slice(1)) {
    if (ch === 'b' || ch === '♭') acc--;
    else if (ch === '#' || ch === '♯') acc++;
  }
  return { letter, acc };
}

export const pitchClass = (n: Note) => mod(LETTER_PC[n.letter] + n.acc, 12);

export function accidentalSymbol(acc: number) {
  if (acc > 0) return '♯'.repeat(acc);
  if (acc < 0) return '♭'.repeat(-acc);
  return '';
}

export function noteName(n: Note, italian = false) {
  return (italian ? ITALIAN : LETTERS)[n.letter] + accidentalSymbol(n.acc);
}

/** Chiave ASCII stabile (es. "Bb", "F#"), usata per impostazioni e confronti. */
export const noteKey = (n: Note) => LETTERS[n.letter] + (n.acc > 0 ? '#'.repeat(n.acc) : 'b'.repeat(-n.acc));

/** Trasporta di `steps` gradi diatonici e `semis` semitoni, mantenendo lo spelling corretto. */
export function transpose(n: Note, steps: number, semis: number): Note {
  const letter = mod(n.letter + steps, 7);
  const diff = mod(pitchClass(n) + semis - LETTER_PC[letter], 12);
  return { letter, acc: diff > 6 ? diff - 12 : diff };
}

/** Ottava scritta (es. Cb4 = MIDI 59 ma si scrive in ottava 4). */
export const writtenOctave = (midi: number, n: Note) => Math.floor((midi - n.acc) / 12) - 1;

export const ROOTS: Note[] = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'].map(parseNote);

const PC_SPELLING = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'].map(parseNote);
/** Spelling di default per una classe di altezza (per nominare note suonate). */
export const spellPc = (pc: number) => PC_SPELLING[mod(pc, 12)];

export const midiName = (midi: number, italian = false) => noteName(spellPc(midi), italian) + (Math.floor(midi / 12) - 1);
