import { describe, expect, it } from 'vitest';
import { generateExercise, STEPS, type Level } from './exercise';
import { newSession, playFree, playTimed, tick } from './session';

const levels: Level[] = [1, 2, 3];

describe('generazione', () => {
  it('16 battiti, note nel range della chiave', () => {
    for (const level of levels) {
      for (let k = 0; k < 50; k++) {
        const treble = generateExercise({ clef: 'treble', hands: 1, level });
        expect(treble).toHaveLength(STEPS);
        for (const s of treble) expect(s.notes[0].midi).toBeGreaterThanOrEqual(level === 3 ? 56 : 60);
        const bass = generateExercise({ clef: 'bass', hands: 1, level });
        for (const s of bass) expect(s.notes[0].midi).toBeLessThanOrEqual(level === 3 ? 65 : 60);
      }
    }
  });

  it('livelli 1-2 senza alterazioni', () => {
    for (const level of [1, 2] as Level[]) {
      const ex = generateExercise({ clef: 'both', hands: 2, level });
      expect(ex.flatMap((s) => s.notes).every((n) => n.note.acc === 0)).toBe(true);
    }
  });

  it('due mani: una nota per chiave', () => {
    const ex = generateExercise({ clef: 'both', hands: 2, level: 2 });
    for (const s of ex) expect(s.notes.map((n) => n.clef)).toEqual(['bass', 'treble']);
  });

  it('una mano sul grande rigo: chiave decisa dal Do centrale', () => {
    const ex = generateExercise({ clef: 'both', hands: 1, level: 2 });
    for (const { notes: [n] } of ex) expect(n.clef).toBe(n.midi >= 60 ? 'treble' : 'bass');
  });
});

const steps = (...midis: number[][]) =>
  midis.map((ms) => ({ notes: ms.map((midi) => ({ midi, octave: 4, clef: 'treble' as const, note: { letter: 0, acc: 0 } })) }));

describe('senza tempo', () => {
  it('avanza solo con la nota giusta', () => {
    let s = newSession(steps([60], [62]));
    s = playFree(s, 61, 0, false);
    expect(s.cur).toBe(0);
    expect(s.errors).toBe(1);
    s = playFree(s, 60, 1, false);
    expect(s.state[0].status).toBe('fixed');
    s = playFree(s, 62, 2, false);
    expect(s.state[1].status).toBe('ok');
    expect(s.finishedAt).toBe(2);
  });

  it('due mani: servono entrambe le note', () => {
    let s = newSession(steps([48, 64]));
    s = playFree(s, 64, 0, false);
    expect(s.cur).toBe(0);
    s = playFree(s, 48, 1, false);
    expect(s.state[0].status).toBe('ok');
  });

  it('ottava libera', () => {
    expect(playFree(newSession(steps([60])), 72, 0, true).state[0].status).toBe('ok');
    expect(playFree(newSession(steps([60])), 72, 0, false).state[0].status).toBe('pending');
  });
});

describe('a tempo', () => {
  it('nota nella finestra del battito', () => {
    let s = newSession(steps([60], [62], [64]));
    s = playTimed(s, 60, -0.2, 0, false); // leggermente in anticipo: vale per il battito 0
    expect(s.state[0].status).toBe('ok');
    s = playTimed(s, 60, -2, 0, false); // durante il count-in: ignorata
    expect(s.errors).toBe(0);
  });

  it('battiti scaduti diventano mancati e l’esercizio finisce', () => {
    let s = newSession(steps([60], [62]));
    s = tick(s, 0.8, 0);
    expect(s.state[0].status).toBe('missed');
    expect(s.cur).toBe(1);
    s = tick(s, 1.75, 1);
    expect(s.state[1].status).toBe('missed');
    expect(s.finishedAt).toBe(1);
  });
});
