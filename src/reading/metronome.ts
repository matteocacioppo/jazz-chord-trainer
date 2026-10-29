import * as Tone from 'tone';

/** Battiti di attacco prima dell'esercizio. */
export const COUNT_IN = 4;

let click: Tone.Synth | null = null;

export async function startMetronome(bpm: number) {
  await Tone.start();
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel();
  transport.position = 0;
  transport.bpm.value = bpm;
  click ??= new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.02 },
    volume: -6,
  }).toDestination();
  let beat = 0;
  transport.scheduleRepeat((time) => {
    click!.triggerAttackRelease(beat % 4 === 0 ? 'C6' : 'G5', '32n', time); // primo battito accentato
    beat++;
  }, '4n', 0);
  transport.start('+0.05');
}

export function stopMetronome() {
  const transport = Tone.getTransport();
  transport.stop();
  transport.cancel();
}

/** Posizione in battiti dall'inizio dell'esercizio (negativa durante l'attacco). */
export function currentBeat(bpm: number) {
  const transport = Tone.getTransport();
  if (transport.state !== 'started') return -Infinity;
  return (transport.getSecondsAtTime(Tone.immediate()) * bpm) / 60 - COUNT_IN;
}
