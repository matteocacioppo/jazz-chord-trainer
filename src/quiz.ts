import { CHORD_TYPES, chordSymbol, randomMixedType, type Chord, type ChordType } from './theory/chords';
import { noteKey, ROOTS } from './theory/notes';
import type { QuizSettings, StatEntry, Stats } from './settings';

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

/** Più errori su un tipo di accordo → più probabilità che ricapiti (Laplace smoothing). */
function weight(e: StatEntry | undefined) {
  if (!e) return 1;
  const errorRate = (e.attempts - e.correct + 1) / (e.attempts + 2);
  return 0.4 + 2.4 * errorRate;
}

function weightedPick(pool: ChordType[], w: (t: ChordType) => number) {
  const weights = pool.map(w);
  let r = Math.random() * weights.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) if ((r -= weights[i]) <= 0) return pool[i];
  return pool[pool.length - 1];
}

export function generateChord(q: QuizSettings, stats: Stats, prev?: Chord): Chord {
  const cats = q.categories.length ? q.categories : ['settime'];
  const pool = CHORD_TYPES.filter((t) => cats.includes(t.category));
  const roots = ROOTS.filter((r) => q.roots.includes(noteKey(r)));
  const rootPool = roots.length ? roots : ROOTS;
  const mixed = cats.includes('miste');

  let chord: Chord;
  let tries = 0;
  do {
    // "Tensioni miste" pesa come una categoria in più.
    const useMixed = mixed && (pool.length === 0 || Math.random() < 1 / (cats.length));
    const type = useMixed ? randomMixedType() : weightedPick(pool, (t) => (q.smart ? weight(stats.types[t.id]) : 1));
    chord = { root: pick(rootPool), type };
  } while (prev && chordSymbol(chord) === chordSymbol(prev) && ++tries < 20);
  return chord;
}
