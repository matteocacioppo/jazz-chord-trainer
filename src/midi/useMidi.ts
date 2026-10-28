import { useEffect, useRef, useState } from 'react';

export type MidiStatus = 'unsupported' | 'pending' | 'ready' | 'denied';

export interface MidiState {
  status: MidiStatus;
  inputs: string[];
  /** Note MIDI attualmente premute, in ordine crescente. */
  active: number[];
}

interface Handlers {
  onNoteOn?: (note: number, velocity: number) => void;
  onNoteOff?: (note: number) => void;
}

const supported = () => typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;

export function useMidi(handlers: Handlers): MidiState {
  const [status, setStatus] = useState<MidiStatus>(() => (supported() ? 'pending' : 'unsupported'));
  const [inputs, setInputs] = useState<string[]>([]);
  const [active, setActive] = useState<number[]>([]);
  const h = useRef(handlers);
  h.current = handlers;

  useEffect(() => {
    if (!supported()) return;
    let access: MIDIAccess | null = null;
    let cancelled = false;
    const held = new Set<number>();

    const onMessage = (e: MIDIMessageEvent) => {
      const d = e.data;
      if (!d || d.length < 3) return;
      const cmd = d[0] & 0xf0;
      const [, note, vel] = d;
      if (cmd === 0x90 && vel > 0) {
        held.add(note);
        h.current.onNoteOn?.(note, vel / 127);
      } else if (cmd === 0x80 || cmd === 0x90) {
        held.delete(note);
        h.current.onNoteOff?.(note);
      } else return;
      setActive([...held].sort((a, b) => a - b));
    };

    const bind = () => {
      if (!access) return;
      const names: string[] = [];
      access.inputs.forEach((input) => {
        input.onmidimessage = onMessage;
        names.push(input.name ?? 'MIDI');
      });
      setInputs(names);
    };

    navigator
      .requestMIDIAccess()
      .then((a) => {
        if (cancelled) return;
        access = a;
        setStatus('ready');
        bind();
        a.onstatechange = bind;
      })
      .catch(() => !cancelled && setStatus('denied'));

    return () => {
      cancelled = true;
      if (access) {
        access.onstatechange = null;
        access.inputs.forEach((i) => (i.onmidimessage = null));
      }
    };
  }, []);

  return { status, inputs, active };
}
