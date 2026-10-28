import { CHORD_TYPES, chordSymbol, chordTones, type Chord, type ChordTone } from './chords';
import { mod, spellPc } from './notes';

export interface CheckResult {
  correct: boolean;
  missing: ChordTone[];
  /** Classi di altezza suonate che non appartengono all'accordo. */
  extras: number[];
}

/**
 * Voicing libero: contano le classi di altezza, non ottava né ordine.
 * Le note opzionali (es. quinta giusta) possono mancare; la fondamentale anche, se `rootOptional`.
 */
export function checkChord(played: number[], chord: Chord, opts: { rootOptional: boolean }): CheckResult {
  const tones = chordTones(chord);
  const playedPcs = new Set(played.map((m) => mod(m, 12)));
  const allowed = new Set(tones.map((t) => t.pc));
  const missing = tones.filter((t) => !t.optional && !(t.iv === '1' && opts.rootOptional) && !playedPcs.has(t.pc));
  const extras = [...playedPcs].filter((pc) => !allowed.has(pc));
  return { correct: played.length > 0 && missing.length === 0 && extras.length === 0, missing, extras };
}

export interface Recognized {
  chord: Chord;
  symbol: string;
  rootless: boolean;
}

/** Riconosce gli accordi compatibili con le note suonate, i più probabili per primi. */
export function recognize(played: number[], max = 6): Recognized[] {
  if (played.length < 2) return [];
  const pcs = new Set(played.map((m) => mod(m, 12)));
  const bassPc = mod(Math.min(...played), 12);
  const found: (Recognized & { score: number })[] = [];

  for (let rootPc = 0; rootPc < 12; rootPc++) {
    const root = spellPc(rootPc);
    for (const type of CHORD_TYPES) {
      const chord = { root, type };
      const tones = chordTones(chord);
      const allowed = new Set(tones.map((t) => t.pc));
      if ([...pcs].some((pc) => !allowed.has(pc))) continue;
      const missing = tones.filter((t) => !t.optional && !pcs.has(t.pc));
      const rootless = missing.length === 1 && missing[0].iv === '1';
      if (missing.length > 0 && !rootless) continue;
      if (rootless && pcs.size < 3) continue;
      const score =
        (rootPc === bassPc ? 0 : 10) + (rootless ? 5 : 0) + (tones.length - pcs.size) + tones.length * 0.1;
      found.push({ chord, symbol: chordSymbol(chord), rootless, score });
    }
  }
  return found.sort((a, b) => a.score - b.score).slice(0, max);
}
