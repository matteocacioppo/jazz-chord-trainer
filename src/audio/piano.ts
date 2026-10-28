import * as Tone from 'tone';
import { useSyncExternalStore } from 'react';

export type PianoStatus = 'idle' | 'loading' | 'ready' | 'error';

let status: PianoStatus = 'idle';
let sampler: Tone.Sampler | null = null;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();

function setStatus(s: PianoStatus) {
  status = s;
  listeners.forEach((l) => l());
}

// Salamander Grand Piano (CC-BY): un campione ogni terza minore, Tone.Sampler interpola il resto.
const urls: Record<string, string> = { A0: 'A0.mp3', C8: 'C8.mp3' };
for (let o = 1; o <= 7; o++) {
  for (const [note, file] of [['C', 'C'], ['D#', 'Ds'], ['F#', 'Fs'], ['A', 'A']]) urls[note + o] = `${file}${o}.mp3`;
}

export function loadPiano(): Promise<void> {
  if (loading) return loading;
  setStatus('loading');
  loading = new Promise((resolve, reject) => {
    sampler = new Tone.Sampler({
      urls,
      baseUrl: 'https://tonejs.github.io/audio/salamander/',
      release: 1.2,
      onload: () => {
        setStatus('ready');
        resolve();
      },
      onerror: (e) => {
        setStatus('error');
        loading = null;
        reject(e);
      },
    }).toDestination();
  });
  return loading;
}

/** Va chiamata dopo un gesto dell'utente (click/tasto): i browser bloccano l'audio prima. */
export async function unlockAudio() {
  await Tone.start();
  await loadPiano();
}

const toName = (midi: number) => Tone.Frequency(midi, 'midi').toNote();

export async function playChord(midis: number[], mode: 'block' | 'arp' = 'block') {
  await unlockAudio();
  const now = Tone.now();
  [...midis]
    .sort((a, b) => a - b)
    .forEach((m, i) => sampler!.triggerAttackRelease(toName(m), mode === 'arp' ? 2.2 : 2.6, now + (mode === 'arp' ? i * 0.14 : 0), 0.7));
}

export function noteOn(midi: number, velocity = 0.8) {
  if (status === 'ready') sampler!.triggerAttack(toName(midi), Tone.now(), velocity);
}

export function noteOff(midi: number) {
  if (status === 'ready') sampler!.triggerRelease(toName(midi), Tone.now());
}

export function usePianoStatus() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => status,
  );
}
