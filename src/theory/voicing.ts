import { chordTones, type Chord, type ChordTone } from './chords';
import { mod, writtenOctave } from './notes';

export type VoicingStyle = 'shell' | 'stacked';

export const VOICING_LABELS: Record<VoicingStyle, string> = {
  shell: 'Basso + mano destra',
  stacked: 'Terze sovrapposte',
};

export interface VoicedNote extends ChordTone {
  midi: number;
  octave: number;
}

const withOctave = (t: ChordTone, midi: number): VoicedNote => ({ ...t, midi, octave: writtenOctave(midi, t.note) });

export function voiceChord(chord: Chord, style: VoicingStyle): VoicedNote[] {
  const tones = chordTones(chord);
  const [root, ...upper] = tones;

  if (style === 'stacked') {
    // Fondamentale in ottava 3, poi ogni nota appena sopra la precedente.
    let prev = 48 + root.pc;
    const out = [withOctave(root, prev)];
    for (const t of upper) {
      prev += mod(t.pc - prev, 12) || 12;
      out.push(withOctave(t, prev));
    }
    return out;
  }

  // Fondamentale alla mano sinistra (E2–D#3), mano destra in posizione stretta (max 4 note).
  const rh = [...upper];
  while (rh.length > 4) {
    const i = rh.findIndex((t) => t.optional);
    if (i < 0) break;
    rh.splice(i, 1);
  }
  const rootMidi = 40 + mod(root.pc - 4, 12);
  const start = rh[0];
  const startMidi = 55 + mod(start.pc - 7, 12);
  return [
    withOctave(root, rootMidi),
    ...rh.map((t) => withOctave(t, startMidi + mod(t.pc - start.pc, 12))).sort((a, b) => a.midi - b.midi),
  ];
}
