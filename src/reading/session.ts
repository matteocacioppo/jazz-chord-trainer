import { matches, type Step } from './exercise';

export type StepStatus = 'pending' | 'ok' | 'fixed' | 'missed';

export interface StepState {
  hit: number[];
  errors: number;
  status: StepStatus;
}

export interface Session {
  steps: Step[];
  state: StepState[];
  cur: number;
  errors: number;
  startedAt: number | null;
  finishedAt: number | null;
  lastWrong: { midi: number; at: number } | null;
}

/**
 * A tempo, una nota suonata vale per il battito `floor(beat + EARLY)`:
 * si può anticipare fino a 0.3 battiti, e il battito chiude 0.3 battiti prima del successivo.
 */
export const EARLY = 0.3;

export const newSession = (steps: Step[]): Session => ({
  steps,
  state: steps.map(() => ({ hit: [], errors: 0, status: 'pending' })),
  cur: 0,
  errors: 0,
  startedAt: null,
  finishedAt: null,
  lastWrong: null,
});

function withStep(s: Session, i: number, st: StepState, patch: Partial<Session> = {}): Session {
  const state = [...s.state];
  state[i] = st;
  return { ...s, ...patch, state };
}

function applyNote(s: Session, i: number, midi: number, now: number, anyOctave: boolean): Session {
  const st = s.state[i];
  const expected = s.steps[i].notes;
  const target = expected.find((n) => matches(n.midi, midi, anyOctave) && !st.hit.includes(n.midi));
  if (!target) {
    if (expected.some((n) => matches(n.midi, midi, anyOctave))) return s; // nota già presa
    return withStep(s, i, { ...st, errors: st.errors + 1 }, { errors: s.errors + 1, lastWrong: { midi, at: now } });
  }
  const hit = [...st.hit, target.midi];
  const done = hit.length === expected.length;
  return withStep(s, i, { ...st, hit, status: done ? (st.errors ? 'fixed' : 'ok') : 'pending' });
}

/** Senza tempo: si resta sul battito corrente finché non è suonato giusto. */
export function playFree(s: Session, midi: number, now: number, anyOctave: boolean): Session {
  if (s.finishedAt !== null) return s;
  const i = s.cur;
  const next = applyNote({ ...s, startedAt: s.startedAt ?? now }, i, midi, now, anyOctave);
  if (next.state[i].status === 'pending') return next;
  const cur = i + 1;
  return { ...next, cur, finishedAt: cur === s.steps.length ? now : null };
}

/** A tempo: la nota va al battito in corso (count-in e battiti chiusi vengono ignorati). */
export function playTimed(s: Session, midi: number, beat: number, now: number, anyOctave: boolean): Session {
  if (s.finishedAt !== null) return s;
  const i = Math.floor(beat + EARLY);
  if (i < 0 || i >= s.steps.length || s.state[i].status !== 'pending') return s;
  return applyNote({ ...s, startedAt: s.startedAt ?? now }, i, midi, now, anyOctave);
}

/** A tempo: avanza il cursore, segna come mancati i battiti scaduti e chiude l'esercizio. */
export function tick(s: Session, beat: number, now: number): Session {
  if (s.finishedAt !== null) return s;
  const n = s.steps.length;
  const cur = Math.min(Math.max(Math.floor(beat + EARLY), 0), n - 1);
  let next = cur === s.cur ? s : { ...s, cur };
  for (let i = 0; i < n && beat >= i + 1 - EARLY; i++) {
    if (next.state[i].status === 'pending') next = withStep(next, i, { ...next.state[i], status: 'missed' });
  }
  if (beat >= n - EARLY) next = { ...next, finishedAt: now };
  return next;
}
