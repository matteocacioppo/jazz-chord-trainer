import { describe, expect, it } from 'vitest';
import { checkChord, recognize } from './check';
import { chordSymbol, chordTones, findType, type Chord } from './chords';
import { noteName, parseNote } from './notes';
import { voiceChord } from './voicing';

const chord = (root: string, typeId: string): Chord => ({ root: parseNote(root), type: findType(typeId)! });
const names = (c: Chord) => chordTones(c).map((t) => noteName(t.note));

describe('spelling', () => {
  it('Cmaj7', () => expect(names(chord('C', 'maj7'))).toEqual(['C', 'E', 'G', 'B']));
  it('G♭°7 usa i doppi bemolle', () => expect(names(chord('Gb', 'dim7'))).toEqual(['G♭', 'B♭♭', 'D♭♭', 'F♭♭']));
  it('Bmaj7♯11 ha E♯', () => expect(names(chord('B', 'maj7#11'))).toEqual(['B', 'D♯', 'F♯', 'A♯', 'E♯']));
  it('F7♭9♭13', () => expect(names(chord('F', '7b9b13'))).toEqual(['F', 'A', 'C', 'E♭', 'G♭', 'D♭']));
  it('simbolo', () => expect(chordSymbol(chord('Eb', 'm7b5'))).toBe('E♭m7♭5'));
});

describe('voicing', () => {
  it('stacked parte dalla fondamentale in ottava 3', () => {
    expect(voiceChord(chord('C', '13'), 'stacked').map((n) => n.midi)).toEqual([48, 52, 55, 58, 62, 69]);
  });
  it('shell: basso + al massimo 4 note', () => {
    const v = voiceChord(chord('C', 'm13'), 'shell');
    expect(v[0].midi).toBe(48);
    expect(v.length).toBe(5);
    expect(v.map((n) => n.iv)).not.toContain('5');
  });
  it('ottava scritta di C♭', () => {
    const v = voiceChord(chord('Ab', 'min'), 'stacked'); // A♭ C♭ E♭
    const cb = v.find((n) => n.iv === 'b3')!;
    expect(cb.midi).toBe(59);
    expect(cb.octave).toBe(4);
  });
});

describe('verifica', () => {
  const opts = { rootOptional: false };
  it('voicing libero e quinta opzionale', () => {
    expect(checkChord([36, 64, 70, 74], chord('C', '9'), opts).correct).toBe(true);
  });
  it('nota mancante', () => {
    const r = checkChord([48, 64, 67], chord('C', '7'), opts);
    expect(r.correct).toBe(false);
    expect(r.missing.map((t) => t.iv)).toEqual(['b7']);
  });
  it('nota estranea', () => {
    expect(checkChord([48, 64, 70, 69], chord('C', '7'), opts).extras).toEqual([9]);
  });
  it('rootless consentito', () => {
    expect(checkChord([64, 70, 74, 69], chord('C', '13'), { rootOptional: true }).correct).toBe(true);
    expect(checkChord([64, 70, 74, 69], chord('C', '13'), opts).correct).toBe(false);
  });
});

describe('riconoscimento', () => {
  it('C E G B♭ D → C9', () => expect(recognize([48, 52, 55, 58, 62])[0].symbol).toBe('C9'));
  it('D F A C → Dm7', () => expect(recognize([50, 53, 57, 60])[0].symbol).toBe('Dm7'));
});
